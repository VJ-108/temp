import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// File to persist userPorts state
const DATA_FILE = path.resolve("./userPorts.json");

// Port allocation per user: each user gets a range of 10 ports
export const userPorts = loadUserPorts();

const BASE_PORT = 4000;
const PORTS_PER_USER = 10;

/**
 * Load persisted port data from disk
 */
function loadUserPorts() {
	try {
		if (fs.existsSync(DATA_FILE)) {
			const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
			console.log("✅ Loaded persisted user port data");
			return data;
		}
	} catch (err) {
		console.error("⚠️ Failed to load persisted userPorts:", err.message);
	}
	return {};
}

/**
 * Save current user port data to disk
 */
export function saveUserPorts() {
	try {
		fs.writeFileSync(DATA_FILE, JSON.stringify(userPorts, null, 2), "utf8");
	} catch (err) {
		console.error("⚠️ Failed to save userPorts:", err.message);
	}
}

/**
 * Allocate a port range for a user
 */
export function allocatePortRange(userId) {
	if (userPorts[userId]) {
		return userPorts[userId].portRange;
	}

	// Find next available port range
	const usedRanges = Object.values(userPorts).map((u) => u.portRange);
	let startPort = BASE_PORT;

	// Find a non-overlapping range
	while (
		usedRanges.some(
			([start, end]) => startPort < end && startPort + PORTS_PER_USER > start
		)
	) {
		startPort += PORTS_PER_USER;
	}

	const endPort = startPort + PORTS_PER_USER - 1;
	userPorts[userId] = {
		...(userPorts[userId] || {}), // preserve existing containerName, userDir
		portRange: [startPort, endPort],
		mappings: userPorts[userId]?.mappings || {},
		activePorts: userPorts[userId]?.activePorts || [],
	};


	saveUserPorts();
	return [startPort, endPort];
}

/**
 * Generate Docker port mapping flags for container creation
 */
export function getDockerPortFlags(userId) {
	const [startPort, endPort] = allocatePortRange(userId);
	const flags = [];

	for (let port = startPort; port <= endPort; port++) {
		flags.push(`-p ${port}:${port}`);
	}

	return flags.join(" ");
}

/**
 * Detect which ports are listening inside the container
 */
export function detectActivePorts(containerName) {
	try {
		const cmd = `docker exec ${containerName} sh -c "netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null || echo ''"`;
		const output = execSync(cmd, { encoding: "utf8", timeout: 5000 });

		const ports = new Set();
		const lines = output.split("\n");

		for (const line of lines) {
			const match = line.match(/(?:0\.0\.0\.0|127\.0\.0\.1|\*|::):(\d+)/);
			if (match && line.toLowerCase().includes("listen")) {
				const port = parseInt(match[1], 10);
				if (port >= 1000 && port <= 65535) {
					ports.add(port);
				}
			}
		}

		return Array.from(ports).sort((a, b) => a - b);
	} catch (err) {
		console.error("⚠️  Error detecting ports:", err.message);
		return [];
	}
}

/**
 * Map internal ports to external ports from the allocated range
 */
export function mapPorts(userId, internalPorts) {
	if (!userPorts[userId]) return {};

	const { portRange, mappings } = userPorts[userId];
	const [startPort, endPort] = portRange;

	let nextAvailablePort = startPort;

	for (const internalPort of internalPorts) {
		if (mappings[internalPort]) continue;

		const usedPorts = Object.values(mappings);
		while (
			usedPorts.includes(nextAvailablePort) &&
			nextAvailablePort <= endPort
		) {
			nextAvailablePort++;
		}

		if (nextAvailablePort <= endPort) {
			mappings[internalPort] = nextAvailablePort;
			nextAvailablePort++;
		}
	}

	for (const internalPort in mappings) {
		if (!internalPorts.includes(parseInt(internalPort))) {
			delete mappings[internalPort];
		}
	}

	userPorts[userId].activePorts = internalPorts;
	saveUserPorts();
	return mappings;
}

/**
 * Get user's port information for UI
 */
export function getPortInfo(userId, serverHost = "localhost") {
	if (!userPorts[userId]) return null;

	const { portRange, mappings, activePorts } = userPorts[userId];

	return {
		allocatedRange: portRange,
		services: activePorts.map((internalPort) => ({
			internal: internalPort,
			external: mappings[internalPort],
			url: mappings[internalPort]
				? `http://${serverHost}:${mappings[internalPort]}`
				: null,
		})),
	};
}

/**
 * Cleanup user ports
 */
export function cleanupUserPorts(userId) {
	delete userPorts[userId];
	saveUserPorts();
}

export function clearActivePorts(userId) {
	if (!userPorts[userId]) return;
	userPorts[userId].activePorts = [];
	saveUserPorts();
}


export function cleanupStaleEntries() {
	Object.keys(userPorts).forEach((userId) => {
		const cName = userPorts[userId].containerName;
		if (!cName) return;

		try {
			execSync(`docker inspect ${cName}`, { stdio: "ignore" });
		} catch {
			console.log(`🧹 Removing stale entry for ${userId} (container missing)`);
			delete userPorts[userId];
		}
	});
	saveUserPorts();
}