import fs from "fs/promises";
import { joinPath } from "./utils.js";
import { execSync } from "child_process";
import path from "path";
import { isInsideDirectory } from "./utils.js";

export function generateFileTree(containerName) {
	try {
		const output = execSync(
			`docker exec ${containerName} sh -c "find /workspace -printf '%y %p\\n' 2>/dev/null || echo ''"`,
			{
				encoding: "utf8",
				timeout: 10000, // 10 second timeout
				windowsHide: true, // Hide window on Windows
				maxBuffer: 1024 * 1024 * 10, // 10MB buffer
			}
		);

		const lines = output
			.split("\n")
			.filter((line) => line.trim() && line.includes("/workspace"))
			.filter((line) => {
				// Exclude node_modules and common build directories
				const excluded = [
					"node_modules",
					".git",
					"dist",
					"build",
					".next",
					".cache",
				];
				return !excluded.some((dir) => line.includes(`/${dir}`));
			})
			.filter((line) => line.trim() !== "d /workspace");

		const tree = {};

		for (const line of lines) {
			const [type, fullPath] = line.split(" ");
			const relPath = fullPath.replace(/^\/workspace\/?/, "");
			if (!relPath) continue;

			const parts = relPath.split("/");
			let current = tree;

			parts.forEach((part, idx) => {
				if (!part) return;
				if (idx === parts.length - 1) {
					current[part] = type === "d" ? {} : null;
				} else {
					current[part] = current[part] || {};
					current = current[part];
				}
			});
		}

		return tree;
	} catch (error) {
		// Check if it's a timeout error
		if (error.code === "ETIMEDOUT") {
			console.error(
				`⚠️  File tree generation timeout for ${containerName}. Container may be slow to respond.`
			);
		} else {
			console.error(
				`❌ Error generating file tree for ${containerName}:`,
				error.message
			);
		}
		return {};
	}
}

export function handleCommand(containerName, command, socket) {
	if (!command.trim()) return;

	const firstWord = command.split(" ")[0];
	if (["touch", "mkdir", "rm", "mv", "cp"].includes(firstWord)) {
		setTimeout(() => {
			try {
				const tree = generateFileTree(containerName);
				socket.emit("file:refresh", tree);
			} catch (err) {
				console.error("❌ Error refreshing file tree:", err);
			}
		}, 200);
	}
}

export async function changeFile(
	userDir,
	containerName,
	{ path: filePath, content },
	socket
) {
	try {
		// Use the user-specific directory
		const tmpFile = path.join(userDir, filePath);
		await fs.mkdir(path.dirname(tmpFile), { recursive: true });
		await fs.writeFile(tmpFile, content, "utf-8");
		const tree = generateFileTree(containerName);
		socket.emit("file:refresh", tree);
	} catch (error) {
		console.error("❌ Error saving file:", error);
	}
}

export function setupFileRoutes(app, users, io) {
	// GET file content
	app.get("/files/content", async (req, res) => {
		const { userId, socketId } = req.query;
		let { path: filePath } = req.query;

		console.log(`📄 Fetching file content for user ${userId}: ${filePath}`);

		if (!userId || !users[socketId]) {
			return res.status(400).json({ error: "Invalid userId" });
		}

		if (!filePath || filePath.trim() === "" || filePath === "/") {
			return res.status(400).json({ error: "Invalid file path" });
		}

		try {
			filePath = decodeURIComponent(filePath);
			const userDir = users[socketId].userDir;
			const fullPath = path.join(userDir, filePath);

			if (!isInsideDirectory(userDir, fullPath)) {
				return res.status(400).json({ error: "Path outside user directory" });
			}

			const stat = await fs.stat(fullPath);
			if (!stat.isFile()) {
				return res.status(400).json({ error: "Path is not a file" });
			}

			const content = await fs.readFile(fullPath, "utf-8");
			res.json({ content });
		} catch (error) {
			console.error("❌ Error reading file:", filePath, error.message);
			res.status(404).json({ error: "File not found or inaccessible" });
		}
	});

	// CREATE file/folder
	app.post("/files/create", async (req, res) => {
		const { userId, path: filePath, type, socketId } = req.body;
		if (!userId || !filePath || !users[socketId])
			return res.status(400).json({ error: "Invalid request" });

		try {
			const userDir = users[socketId].userDir;
			const fullPath = path.join(userDir, filePath);

			if (type === "file") {
				await fs.mkdir(path.dirname(fullPath), { recursive: true });
				await fs.writeFile(fullPath, "", "utf-8");
			} else {
				await fs.mkdir(fullPath, { recursive: true });
			}

			const tree = generateFileTree(users[socketId].containerName);
			io.to(userId).emit("file:refresh", tree);
			res.json({ success: true });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});

	// DELETE file/folder
	app.post("/files/delete", async (req, res) => {
		const { userId, path: filePath, socketId } = req.body;
		if (!userId || !filePath || !users[socketId])
			return res.status(400).json({ error: "Invalid request" });

		try {
			const userDir = users[socketId].userDir;
			const fullPath = path.join(userDir, filePath);

			await fs.rm(fullPath, { recursive: true, force: true });

			const tree = generateFileTree(users[socketId].containerName);
			io.to(userId).emit("file:refresh", tree);
			res.json({ success: true });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});

	// RENAME file/folder
	app.post("/files/rename", async (req, res) => {
		const { userId, oldPath, newPath, socketId } = req.body;
		if (!userId || !oldPath || !newPath || !users[socketId])
			return res.status(400).json({ error: "Invalid request" });

		try {
			const userDir = users[socketId].userDir;
			const oldFullPath = path.join(userDir, oldPath);
			const newFullPath = path.join(userDir, newPath);

			await fs.mkdir(path.dirname(newFullPath), { recursive: true });
			await fs.rename(oldFullPath, newFullPath);

			const tree = generateFileTree(users[socketId].containerName);
			io.to(userId).emit("file:refresh", tree);
			res.json({ success: true });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});
}

export function refreshFileTree(containerName, socket) {
	const tree = generateFileTree(containerName);
	socket.emit("file:refresh", tree);
}
