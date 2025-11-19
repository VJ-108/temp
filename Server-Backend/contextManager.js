// Server-Backend/contextManager.js
import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import { Project } from "./models/project.model.js";
/**
 * Context Manager for AI Assistant
 * Builds comprehensive context about user's project for AI queries
 */

// Store project contexts per user
const projectContexts = new Map();

/**
 * Initialize or update project context
 */
export async function initializeProjectContext(userId, projectId, projectData) {
	const contextKey = `${userId}-${projectId}`;

	projectContexts.set(contextKey, {
		userId,
		projectId,
		projectInfo: {
			title: projectData.title,
			description: projectData.description,
			difficulty: projectData.difficulty,
			techStack: projectData.techStack || [],
			requirements: projectData.requirements || [],
			templateRepo: projectData.templateRepo,
		},
		startedAt: new Date().toISOString(),
		lastUpdated: new Date().toISOString(),
		fileSnapshots: new Map(),
		terminalHistory: [],
		errorLog: [],
		codeChanges: [],
		userProgress: {
			completedFeatures: [],
			currentFeature: null,
			blockers: [],
		},
	});

	return projectContexts.get(contextKey);
}

/**
 * Get project context
 */
export function getProjectContext(userId, projectId) {
	const contextKey = `${userId}-${projectId}`;
	return projectContexts.get(contextKey);
}

/**
 * Track file changes
 */
export async function trackFileChange(
	userId,
	projectId,
	filePath,
	content,
	userDir
) {
	const contextKey = `${userId}-${projectId}`;
	const context = projectContexts.get(contextKey);

	if (!context) return;

	const previousContent = context.fileSnapshots.get(filePath);

	// Store new snapshot
	context.fileSnapshots.set(filePath, {
		content,
		timestamp: new Date().toISOString(),
		size: content.length,
	});

	// Track change
	if (previousContent) {
		context.codeChanges.push({
			filePath,
			timestamp: new Date().toISOString(),
			changeType: "modified",
			previousSize: previousContent.size,
			newSize: content.length,
			diff: calculateSimpleDiff(previousContent.content, content),
		});
	} else {
		context.codeChanges.push({
			filePath,
			timestamp: new Date().toISOString(),
			changeType: "created",
			size: content.length,
		});
	}

	// Keep only last 50 changes
	if (context.codeChanges.length > 50) {
		context.codeChanges = context.codeChanges.slice(-50);
	}

	context.lastUpdated = new Date().toISOString();
}

/**
 * Track terminal output (errors, warnings, success)
 */
export function trackTerminalOutput(userId, projectId, output, type = "info") {
	const contextKey = `${userId}-${projectId}`;
	const context = projectContexts.get(contextKey);

	if (!context) return;

	const terminalEntry = {
		output,
		type, // 'error', 'warning', 'info', 'success'
		timestamp: new Date().toISOString(),
	};

	context.terminalHistory.push(terminalEntry);

	// Detect errors
	if (
		type === "error" ||
		output.toLowerCase().includes("error") ||
		output.toLowerCase().includes("exception")
	) {
		context.errorLog.push({
			error: output,
			timestamp: new Date().toISOString(),
			resolved: false,
		});

		// Keep only last 20 errors
		if (context.errorLog.length > 20) {
			context.errorLog = context.errorLog.slice(-20);
		}
	}

	// Keep only last 100 terminal entries
	if (context.terminalHistory.length > 100) {
		context.terminalHistory = context.terminalHistory.slice(-100);
	}
}

/**
 * Get all files in user's project directory
 */
export async function getAllProjectFiles(userDir, maxFiles = 50) {
	try {
		const files = [];

		async function scanDirectory(dir, relativePath = "") {
			if (files.length >= maxFiles) return;

			const entries = await fs.readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				if (files.length >= maxFiles) break;

				// Skip common directories
				if (
					["node_modules", ".git", "dist", "build", ".next", ".cache"].includes(
						entry.name
					)
				) {
					continue;
				}

				const fullPath = path.join(dir, entry.name);
				const relPath = path.join(relativePath, entry.name);

				if (entry.isDirectory()) {
					await scanDirectory(fullPath, relPath);
				} else if (entry.isFile()) {
					// Only include text files
					const ext = path.extname(entry.name).toLowerCase();
					if (
						[
							".js",
							".jsx",
							".ts",
							".tsx",
							".json",
							".html",
							".css",
							".md",
							".txt",
							".py",
							".env",
						].includes(ext)
					) {
						try {
							const content = await fs.readFile(fullPath, "utf-8");
							// Skip large files (> 50KB)
							if (content.length < 50000) {
								files.push({
									path: relPath,
									content,
									size: content.length,
									extension: ext,
								});
							}
						} catch (err) {
							// Skip files that can't be read
						}
					}
				}
			}
		}

		await scanDirectory(userDir);
		return files;
	} catch (error) {
		console.error("Error scanning project files:", error);
		return [];
	}
}

/**
 * Build comprehensive AI context
 */
export async function buildAIContext(
	userId,
	projectId,
	userDir,
	currentFile = null,
	currentCode = null
) {
	const contextKey = `${userId}-${projectId}`;
	const context = projectContexts.get(contextKey);

	if (!context) {
		return {
			error: "No project context found. Please initialize project first.",
		};
	}

	const projectName = await Project.findById(projectId).then((p) => p?.title);
	// 🧹 Sanitize: remove " App" (case-insensitive) and trim
	const sanitizedProjectName = projectName.replace(/\s*App\s*$/i, "").trim();

	// Optionally replace spaces or special chars with underscores
	const safeProjectName = sanitizedProjectName.replace(/[^\w.-]/g, "_");

	const fallbackDir = path.join(process.cwd(), "tmp", `user_${userId}`);

	const actuallyFallbackDir = path.join(fallbackDir, safeProjectName);

	try {
		await fs.access(actuallyFallbackDir);
	} catch {
		await fs.mkdir(actuallyFallbackDir, { recursive: true });
	}

	const validUserDir = actuallyFallbackDir;

	// Ensure directory exists
	try {
		await fs.access(validUserDir);
	} catch {
		console.error(`❌ User directory not found: ${validUserDir}`);
		return { error: `User directory not found: ${validUserDir}` };
	}

	// Get all project files
	const projectFiles = await getAllProjectFiles(validUserDir);

	// Get recent errors (last 5)
	const recentErrors = context.errorLog
		.filter((e) => !e.resolved)
		.slice(-5)
		.map((e) => e.error);

	// Get recent terminal output (last 10 lines)
	const recentTerminal = context.terminalHistory
		.slice(-10)
		.map((t) => `[${t.type}] ${t.output}`);

	// Get recent code changes (last 10)
	const recentChanges = context.codeChanges.slice(-10).map((c) => ({
		file: c.filePath,
		type: c.changeType,
		when: c.timestamp,
	}));

	// Build context object
	const aiContext = {
		// Project Information
		project: {
			title: context.projectInfo.title,
			description: context.projectInfo.description,
			difficulty: context.projectInfo.difficulty,
			techStack: context.projectInfo.techStack,
			requirements: context.projectInfo.requirements,
		},

		// Current State
		currentFile: currentFile
			? {
					path: currentFile,
					content: currentCode,
			  }
			: null,

		// All Project Files (limited to 50 files)
		allFiles: projectFiles.map((f) => ({
			path: f.path,
			content: f.content,
			size: f.size,
		})),

		// File Structure (tree view)
		fileStructure: generateFileTree(projectFiles),

		// Recent Activity
		recentActivity: {
			errors: recentErrors,
			terminalOutput: recentTerminal,
			codeChanges: recentChanges,
		},

		// Progress
		progress: {
			startedAt: context.startedAt,
			lastUpdated: context.lastUpdated,
			completedFeatures: context.userProgress.completedFeatures,
			currentFeature: context.userProgress.currentFeature,
			blockers: context.userProgress.blockers,
		},

		// Statistics
		stats: {
			totalFiles: projectFiles.length,
			totalCodeLines: projectFiles.reduce(
				(sum, f) => sum + f.content.split("\n").length,
				0
			),
			totalErrors: context.errorLog.length,
			unresolvedErrors: context.errorLog.filter((e) => !e.resolved).length,
		},
	};

	return aiContext;
}

/**
 * Format context for AI prompt
 */
export function formatContextForAI(aiContext) {
	let prompt = `# Project Context\n\n`;

	// Project Info
	prompt += `## Project: ${aiContext.project.title}\n`;
	prompt += `**Description:** ${aiContext.project.description}\n`;
	prompt += `**Difficulty:** ${aiContext.project.difficulty}\n`;
	prompt += `**Tech Stack:** ${aiContext.project.techStack.join(", ")}\n\n`;

	// Current File
	if (aiContext.currentFile) {
		prompt += `## Current File: ${aiContext.currentFile.path}\n`;
		prompt += `\`\`\`\n${aiContext.currentFile.content}\n\`\`\`\n\n`;
	}

	// File Structure
	prompt += `## File Structure\n`;
	prompt += `\`\`\`\n${aiContext.fileStructure}\n\`\`\`\n\n`;

	// Recent Errors
	if (aiContext.recentActivity.errors.length > 0) {
		prompt += `## Recent Errors\n`;
		aiContext.recentActivity.errors.forEach((err, i) => {
			prompt += `${i + 1}. ${err}\n`;
		});
		prompt += `\n`;
	}

	// Recent Terminal Output
	if (aiContext.recentActivity.terminalOutput.length > 0) {
		prompt += `## Recent Terminal Output\n`;
		prompt += `\`\`\`\n${aiContext.recentActivity.terminalOutput.join(
			"\n"
		)}\n\`\`\`\n\n`;
	}

	// Related Files (other files in project)
	if (aiContext.allFiles.length > 0) {
		prompt += `## Other Project Files (${Math.min(
			aiContext.allFiles.length,
			5
		)} shown)\n`;
		aiContext.allFiles.slice(0, 5).forEach((file) => {
			if (file.path !== aiContext.currentFile?.path) {
				prompt += `\n### ${file.path}\n`;
				prompt += `\`\`\`\n${file.content.slice(0, 500)}...\n\`\`\`\n`;
			}
		});
	}

	return prompt;
}

/**
 * Generate file tree structure
 */
function generateFileTree(files) {
	const tree = {};

	files.forEach((file) => {
		const parts = file.path.split(path.sep);
		let current = tree;

		parts.forEach((part, index) => {
			if (index === parts.length - 1) {
				current[part] = null; // File
			} else {
				current[part] = current[part] || {}; // Directory
				current = current[part];
			}
		});
	});

	return JSON.stringify(tree, null, 2);
}

/**
 * Simple diff calculator (counts changed lines)
 */
function calculateSimpleDiff(oldContent, newContent) {
	const oldLines = oldContent.split("\n");
	const newLines = newContent.split("\n");

	const added = newLines.length - oldLines.length;
	const modified = Math.min(oldLines.length, newLines.length);

	return {
		linesAdded: Math.max(0, added),
		linesRemoved: Math.max(0, -added),
		linesModified: modified,
	};
}

/**
 * Update user progress
 */
export function updateUserProgress(userId, projectId, progressData) {
	const contextKey = `${userId}-${projectId}`;
	const context = projectContexts.get(contextKey);

	if (!context) return;

	if (progressData.completedFeature) {
		context.userProgress.completedFeatures.push({
			feature: progressData.completedFeature,
			completedAt: new Date().toISOString(),
		});
	}

	if (progressData.currentFeature) {
		context.userProgress.currentFeature = progressData.currentFeature;
	}

	if (progressData.blocker) {
		context.userProgress.blockers.push({
			blocker: progressData.blocker,
			timestamp: new Date().toISOString(),
			resolved: false,
		});
	}

	context.lastUpdated = new Date().toISOString();
}

/**
 * Mark error as resolved
 */
export function markErrorResolved(userId, projectId, errorIndex) {
	const contextKey = `${userId}-${projectId}`;
	const context = projectContexts.get(contextKey);

	if (context && context.errorLog[errorIndex]) {
		context.errorLog[errorIndex].resolved = true;
		context.errorLog[errorIndex].resolvedAt = new Date().toISOString();
	}
}

/**
 * Clear old contexts (cleanup)
 */
export function clearOldContexts(maxAgeHours = 24) {
	const now = Date.now();
	const maxAge = maxAgeHours * 60 * 60 * 1000;

	for (const [key, context] of projectContexts.entries()) {
		const lastUpdate = new Date(context.lastUpdated).getTime();
		if (now - lastUpdate > maxAge) {
			projectContexts.delete(key);
			console.log(`Cleared old context: ${key}`);
		}
	}
}

// Cleanup every hour
setInterval(() => clearOldContexts(), 60 * 60 * 1000);
