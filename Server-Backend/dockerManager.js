import { execSync } from "child_process";
import fs from "fs/promises";
import { joinPath, sanitizeContainerName, isWindows } from "./utils.js";
import { allocatePortRange, getDockerPortFlags, saveUserPorts, userPorts } from "./portManager.js";

export const tmpDir = joinPath(process.cwd(), "tmp");
await fs.mkdir(tmpDir, { recursive: true });

const CONTAINER_MEMORY_LIMIT = "512m";
const CONTAINER_CPU_LIMIT = "0.5";
const CONTAINER_PIDS_LIMIT = "100";

export async function createUserContainer(userId) {
	const containerName = sanitizeContainerName(`user_${userId}`);
	const userDir = joinPath(tmpDir, containerName);
	await fs.mkdir(userDir, { recursive: true });

	try {
		const existing = execSync(`docker ps -a --format '{{.Names}}'`, {
			encoding: "utf8",
		})
			.split("\n")
			.filter(Boolean);

		if (existing.includes(containerName)) {
			execSync(`docker start ${containerName}`);
			console.log(`♻️  Reusing container ${containerName}`);
			return { containerName, userDir };
		}

		// const createCmd = `docker run -d --name ${containerName} --memory=${CONTAINER_MEMORY_LIMIT} --memory-swap=${CONTAINER_MEMORY_LIMIT} --cpus=${CONTAINER_CPU_LIMIT} --pids-limit=${CONTAINER_PIDS_LIMIT} --network bridge -v "${userDir}:/workspace" -w /workspace -e NODE_ENV=development ide-base:latest sleep infinity`;
		allocatePortRange(userId);
		const portFlags = getDockerPortFlags(userId);
		const createCmd = `docker run -d --name ${containerName} ${portFlags} --memory=${CONTAINER_MEMORY_LIMIT} --memory-swap=${CONTAINER_MEMORY_LIMIT} --cpus=${CONTAINER_CPU_LIMIT} --pids-limit=${CONTAINER_PIDS_LIMIT} --network bridge -v "${userDir}:/workspace" -w /workspace -e NODE_ENV=development ide-base:latest sleep infinity`;
		execSync(createCmd);

		userPorts[userId] = {
			...(userPorts[userId] || {}),
			containerName,
			userDir,
		};
		saveUserPorts?.();

		console.log(`✅ Container ${containerName} created`);
		return { containerName, userDir };
	} catch (err) {
		console.error("❌ Error creating container:", err.message);
		throw err;
	}
}

export function getStats(res) {
	try {
		const stats = execSync(
			`docker stats --no-stream --format "{{.Name}}: CPU {{.CPUPerc}} | MEM {{.MemUsage}}"`,
			{ encoding: "utf8" }
		);
		res.json({ stats: stats.split("\n").filter(Boolean) });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

export function setupPeriodicCleanup() {
	setInterval(() => {
		try {
			execSync('docker container prune -f --filter "until=1h"');
			console.log("🧹 Cleaned up old containers");
		} catch (err) {
			console.error("❌ Error cleaning containers:", err.message);
		}
	}, 3600000);
}

export function containerExists(containerName) {
	try {
		execSync(`docker inspect ${containerName}`, { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

export { isWindows };
