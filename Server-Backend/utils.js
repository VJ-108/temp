import os from "os";
import path from "path";

/** Platform detection */
export const isWindows =
	process.env.FORCE_PTY_MODE === "windows"
		? true
		: process.env.FORCE_PTY_MODE === "linux"
		? false
		: os.platform() === "win32";

/** Sanitize a string to use as Docker container name */
export function sanitizeContainerName(name) {
	return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Sleep helper */
export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Safe cross-platform path join */
export function joinPath(...segments) {
	return path.join(...segments);
}

/** Check if a path is inside a directory */
export function isInsideDirectory(baseDir, targetPath) {
	const relative = path.relative(baseDir, targetPath);
	return !relative.startsWith("..") && !path.isAbsolute(relative);
}
