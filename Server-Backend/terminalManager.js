import { spawn, execSync } from "child_process";
import pty from "node-pty";
import { isWindows as platformIsWindows } from "./utils.js";
import { sleep } from "./utils.js";
import { handleCommand } from "./fileManager.js";

// Store multiple terminals per user
// Structure: { userId: { terminalId: { proc, containerName } } }
const userTerminals = {};

export async function spawnDockerPTY(
	containerName,
	socket,
	terminalId = "default"
) {
	// IMPORTANT: Use socket.id for terminal management (NOT socket.user._id)
	const userId = socket.id;

	// Initialize user's terminal map if it doesn't exist
	if (!userTerminals[userId]) {
		userTerminals[userId] = {};
	}

	// Check if terminal already exists
	if (userTerminals[userId][terminalId]) {
		console.log(`⚠️  Terminal ${terminalId} already exists for user ${userId}`);
		return userTerminals[userId][terminalId].proc;
	}

	let proc;

	if (platformIsWindows) {
		try {
			proc = pty.spawn("docker", ["exec", "-it", containerName, "bash"], {
				name: "xterm-256color",
				cols: 80,
				rows: 30,
				cwd: process.cwd(),
				env: {
					...process.env,
					TERM: "xterm-256color",
					COLORTERM: "truecolor",
				},
			});

			proc.onData((data) => {
				socket.emit("terminal:data", { terminalId, data });
			});

			proc.onExit(({ exitCode, signal }) => {
				console.log(`🛑 Terminal ${terminalId} exited:`, exitCode, signal);
				socket.emit("terminal:data", {
					terminalId,
					data: "\r\n[Terminal session ended]\r\n",
				});
				socket.emit("terminal:closed", { terminalId });

				// Remove from tracking
				if (userTerminals[userId]) {
					delete userTerminals[userId][terminalId];
				}
			});

			await sleep(500);

			proc.write("export PS1='\\[\\033[01;32m\\]bash>\\[\\033[00m\\] '\r");
			proc.write("cd /workspace\r");
			proc.write("clear\r");
		} catch (err) {
			console.warn("⚠️  node-pty failed on Windows:", err.message);
			proc = await spawnWindowsFallback(
				containerName,
				socket,
				terminalId,
				userId
			);
		}
	} else {
		// Linux/Mac with node-pty
		proc = pty.spawn("docker", ["exec", "-it", containerName, "bash"], {
			name: "xterm-256color",
			cols: 80,
			rows: 30,
			cwd: process.cwd(),
			env: {
				...process.env,
				TERM: "xterm-256color",
				COLORTERM: "truecolor",
			},
		});

		proc.onData((data) => {
			socket.emit("terminal:data", { terminalId, data });
		});

		proc.onExit(({ exitCode, signal }) => {
			console.log(`🛑 Terminal ${terminalId} exited:`, exitCode, signal);
			socket.emit("terminal:data", {
				terminalId,
				data: "\r\n[Terminal session ended]\r\n",
			});
			socket.emit("terminal:closed", { terminalId });

			// Remove from tracking
			if (userTerminals[userId]) {
				delete userTerminals[userId][terminalId];
			}
		});

		await sleep(500);

		proc.write("export PS1='\\[\\033[01;32m\\]bash>\\[\\033[00m\\] '\r");
		proc.write("cd /workspace\r");
		proc.write("clear\r");
	}

	// Store terminal info
	userTerminals[userId][terminalId] = {
		proc,
		containerName,
		createdAt: Date.now(),
	};

	console.log(`✅ Terminal ${terminalId} created for user ${userId}`);
	return proc;
}

async function spawnWindowsFallback(containerName, socket, terminalId, userId) {
	console.warn("⚠️  Running in Windows fallback mode.");

	const proc = spawn("docker", ["exec", "-i", containerName, "/bin/bash"], {
		stdio: ["pipe", "pipe", "pipe"],
		shell: false,
		windowsHide: true,
	});

	proc.stdout.on("data", (data) => {
		socket.emit("terminal:data", { terminalId, data: data.toString() });
	});

	proc.stderr.on("data", (data) => {
		socket.emit("terminal:data", { terminalId, data: data.toString() });
	});

	proc.on("exit", (code, signal) => {
		if (code !== 0 && code !== null) {
			socket.emit("terminal:data", {
				terminalId,
				data: `\r\n[Terminal exited with code ${code}]\r\n`,
			});
		}
		socket.emit("terminal:closed", { terminalId });

		if (userTerminals[userId]) {
			delete userTerminals[userId][terminalId];
		}
	});

	proc.on("error", (err) => {
		console.error("❌ Terminal process error:", err);
		socket.emit("terminal:data", {
			terminalId,
			data: `\r\n[Terminal error: ${err.message}]\r\n`,
		});
	});

	await sleep(500);

	if (proc.stdin && proc.stdin.writable) {
		proc.stdin.write("export TERM=xterm-256color\n");
		proc.stdin.write("export PS1='\\[\\033[01;32m\\]bash>\\[\\033[00m\\] '\n");
		proc.stdin.write("cd /workspace\n");
		proc.stdin.write("clear\n");
	}

	proc.commandBuffer = "";
	return proc;
}

export function writeToTerminal(userId, terminalId, input) {
	try {
		if (!userTerminals[userId] || !userTerminals[userId][terminalId]) {
			console.error(`❌ No terminal ${terminalId} for user ${userId}`);
			return;
		}

		const { proc } = userTerminals[userId][terminalId];

		if (typeof proc.write === "function") {
			// node-pty
			proc.write(input);
		} else if (proc.stdin && proc.stdin.writable) {
			// spawn mode
			if (input === "\r") {
				proc.stdin.write("\n");
				if (proc.commandBuffer) {
					handleCommand(
						userTerminals[userId][terminalId].containerName,
						proc.commandBuffer,
						proc.socket
					);
					proc.commandBuffer = "";
				}
			} else if (input === "\x7F" || input === "\x08") {
				if (proc.commandBuffer.length > 0) {
					proc.commandBuffer = proc.commandBuffer.slice(0, -1);
				}
				proc.stdin.write(input);
			} else if (input.charCodeAt(0) < 32) {
				proc.stdin.write(input);
			} else {
				proc.commandBuffer += input;
				proc.stdin.write(input);
			}
		} else {
			console.error("❌ Terminal stdin not writable");
		}
	} catch (err) {
		console.error("❌ Error writing to terminal:", err.message);
	}
}

export function resizeTerminal(userId, terminalId, cols, rows) {
	try {
		if (!userTerminals[userId] || !userTerminals[userId][terminalId]) {
			return;
		}

		const { proc } = userTerminals[userId][terminalId];
		if (proc && typeof proc.resize === "function") {
			proc.resize(cols, rows);
		}
	} catch (err) {
		console.error("❌ Error resizing terminal:", err.message);
	}
}

export function closeTerminal(userId, terminalId) {
	try {
		if (!userTerminals[userId] || !userTerminals[userId][terminalId]) {
			return;
		}

		const { proc } = userTerminals[userId][terminalId];
		console.log(`🧹 Closing terminal ${terminalId} for user ${userId}`);

		if (typeof proc.kill === "function") {
			proc.kill();
		} else if (proc.stdin) {
			if (proc.stdin.writable) {
				proc.stdin.write("\x03");
				proc.stdin.end();
			}
			setTimeout(() => {
				if (!proc.killed) {
					proc.kill("SIGKILL");
				}
			}, 2000);
			proc.kill("SIGTERM");
		}

		delete userTerminals[userId][terminalId];
	} catch (err) {
		console.error("❌ Error closing terminal:", err.message);
	}
}

export function cleanupAllTerminals(userId, containerName) {
	try {
		if (!userTerminals[userId]) return;

		console.log(`🧹 Cleaning up all terminals for user: ${userId}`);

		// Close all terminals for this user
		Object.keys(userTerminals[userId]).forEach((terminalId) => {
			closeTerminal(userId, terminalId);
		});

		// DON'T stop/remove container - it will be reused
		// Just log that we're keeping it
		if (containerName) {
			console.log(`♻️  Keeping container ${containerName} for reuse`);
		}

		delete userTerminals[userId];
	} catch (err) {
		console.error("❌ Terminal cleanup error:", err.message);
	}
}

export function getActiveTerminals(userId) {
	if (!userTerminals[userId]) return [];

	return Object.keys(userTerminals[userId]).map((terminalId) => ({
		id: terminalId,
		createdAt: userTerminals[userId][terminalId].createdAt,
	}));
}

export function getUserTerminalCount(userId) {
	return userTerminals[userId] ? Object.keys(userTerminals[userId]).length : 0;
}
