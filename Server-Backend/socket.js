import { execSync } from "child_process";
import { Server as SocketServer } from "socket.io";
import fs from "fs";
import path from "path";

import * as dockerManager from "./dockerManager.js";
import * as terminalManager from "./terminalManager.js";
import * as fileManager from "./fileManager.js";
import * as portManager from "./portManager.js";
import { verifySocketJWT } from "./middlewares/auth.middleware.js";

export default function setupSocketServer(server, app) {
	const io = new SocketServer(server, {
		cors: {
			origin: process.env.FRONTEND_URL || "http://localhost:5173",
			credentials: true,
		},
		transports: ["websocket", "polling"],
	});

	console.log("⚡ Socket.IO initialized");

	// Socket.IO middleware for JWT authentication
	io.use(verifySocketJWT);

	const users = {}; // Maps socket.id -> { containerName, userDir, dbUserId }
	const SERVER_HOST = process.env.SERVER_HOST || "localhost";
	const MAX_TERMINALS_PER_USER = 3;

	portManager.cleanupStaleEntries();

	const DATA_FILE = path.resolve("./userPorts.json");
	let persistedUserPorts = {};

	try {
		if (fs.existsSync(DATA_FILE)) {
			persistedUserPorts = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
			console.log("✅ Loaded persisted userPorts");
		}
	} catch (err) {
		console.error("⚠️  Failed to load persisted userPorts:", err.message);
	}

	// Setup file routes
	fileManager.setupFileRoutes(app, users, io);

	io.on("connection", async (socket) => {
		// socket.user is set by verifySocketJWT middleware
		const dbUserId = socket.user._id.toString(); // MongoDB user ID
		const socketId = socket.id; // Socket.io session ID

		console.log(
			`👤 User connected: ${socket.user.username} (DB ID: ${dbUserId}, Socket: ${socketId})`
		);

		let containerName, userDir;

		try {
			// Check if container exists for this DB user
			const saved = persistedUserPorts[dbUserId];
			if (
				saved?.containerName &&
				saved?.userDir &&
				dockerManager.containerExists(saved.containerName)
			) {
				console.log(`♻️  Reusing existing container for user ${dbUserId}`);
				containerName = saved.containerName;
				userDir = saved.userDir;

				// Ensure container is running
				try {
					const output = execSync(
						`docker inspect -f '{{.State.Running}}' ${containerName}`,
						{
							encoding: "utf8",
						}
					).trim();

					if (output !== "true") {
						execSync(`docker start ${containerName}`, { stdio: "ignore" });
						console.log(`▶️  Started container ${containerName}`);
					}
				} catch (err) {
					console.error("Error checking/starting container:", err.message);
				}
			} else {
				console.log(`🆕 Creating new container for user ${dbUserId}`);
				const containerInfo = await dockerManager.createUserContainer(dbUserId);
				containerName = containerInfo.containerName;
				userDir = containerInfo.userDir;

				persistedUserPorts[dbUserId] = { containerName, userDir };
				fs.writeFileSync(
					DATA_FILE,
					JSON.stringify(persistedUserPorts, null, 2)
				);
			}

			// Store in users map using socket.id
			users[socketId] = { containerName, userDir, dbUserId };

			// Always spawn a fresh default terminal (uses socket.id internally)
			console.log(`🖥️  Spawning default terminal for socket ${socketId}`);
			await terminalManager.spawnDockerPTY(containerName, socket, "default");

			// Socket event handlers
			socket.on("terminal:write", ({ terminalId, input }) => {
				// Use socket.id for terminal operations
				terminalManager.writeToTerminal(socketId, terminalId, input);
			});

			socket.on("terminal:resize", ({ terminalId, cols, rows }) => {
				terminalManager.resizeTerminal(socketId, terminalId, cols, rows);
			});

			socket.on("terminal:create", async ({ terminalId }) => {
				try {
					const count = terminalManager.getUserTerminalCount(socketId);
					if (count >= MAX_TERMINALS_PER_USER) {
						socket.emit("terminal:error", {
							terminalId,
							error: `Maximum ${MAX_TERMINALS_PER_USER} terminals allowed`,
						});
						return;
					}

					if (!terminalId) terminalId = `terminal_${Date.now()}`;

					await terminalManager.spawnDockerPTY(
						containerName,
						socket,
						terminalId
					);
					socket.emit("terminal:created", { terminalId });
					console.log(
						`✅ Created terminal ${terminalId} for socket ${socketId}`
					);
				} catch (err) {
					console.error("❌ Error creating terminal:", err);
					socket.emit("terminal:error", { terminalId, error: err.message });
				}
			});

			socket.on("terminal:close", ({ terminalId }) => {
				terminalManager.closeTerminal(socketId, terminalId);
			});

			socket.on("terminal:list", () => {
				const terminals = terminalManager.getActiveTerminals(socketId);
				socket.emit("terminal:list", { terminals });
			});

			socket.on("file:change", (data) => {
				fileManager.changeFile(userDir, containerName, data, socket);
			});

			socket.on("file:tree:refresh", () => {
				fileManager.refreshFileTree(containerName, socket);
			});

			// Port tracking - use dbUserId for persistent port management
			const portCheckInterval = setInterval(() => {
				try {
					const activePorts = portManager.detectActivePorts(containerName);
					portManager.mapPorts(dbUserId, activePorts);
					const portInfo = portManager.getPortInfo(dbUserId, SERVER_HOST);
					socket.emit("ports:update", portInfo);
				} catch (err) {
					console.error("⚠️  Port detection error:", err.message);
				}
			}, 5000);

			users[socketId].portCheckInterval = portCheckInterval;

			// Initial setup
			fileManager.refreshFileTree(containerName, socket);

			setTimeout(() => {
				try {
					const activePorts = portManager.detectActivePorts(containerName);
					portManager.mapPorts(dbUserId, activePorts);
					const portInfo = portManager.getPortInfo(dbUserId, SERVER_HOST);
					socket.emit("ports:update", portInfo);
				} catch (err) {
					console.error("⚠️  Initial port check error:", err.message);
				}
			}, 2000);

			// Send terminal list
			const terminals = terminalManager.getActiveTerminals(socketId);
			socket.emit("terminal:list", { terminals });

			console.log(
				`✅ User ${dbUserId} session setup complete (Socket: ${socketId})`
			);
		} catch (error) {
			console.error("❌ Error setting up user session:", error);
			socket.emit("terminal:data", {
				terminalId: "default",
				data: `\r\n❌ Error: ${error.message}\r\n`,
			});
		}

		// Disconnect handler
		socket.on("disconnect", () => {
			console.log(`👋 Socket disconnected: ${socketId} (User: ${dbUserId})`);

			if (users[socketId]?.portCheckInterval) {
				clearInterval(users[socketId].portCheckInterval);
			}

			// Cleanup terminals for this socket session
			// Container is kept for reuse
			terminalManager.cleanupAllTerminals(socketId, containerName);
			portManager.clearActivePorts(dbUserId);

			delete users[socketId];

			console.log(
				`✅ Cleanup complete for socket ${socketId}, container ${containerName} kept for reuse`
			);
		});
	});

	// REST endpoints
	app.get("/stats", (req, res) => dockerManager.getStats(res));

	app.get("/ports/:userId", (req, res) => {
		const { userId } = req.params;
		const portInfo = portManager.getPortInfo(userId, SERVER_HOST);
		if (!portInfo) return res.status(404).json({ error: "User not found" });
		res.json(portInfo);
	});

	app.get("/health", (req, res) =>
		res.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			activeUsers: Object.keys(users).length,
		})
	);

	dockerManager.setupPeriodicCleanup();

	console.log("✅ Socket.IO setup complete");
}

