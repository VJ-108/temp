// Server-Backend/controllers/ai.controller.js
import {
	initializeProjectContext,
	buildAIContext,
	trackFileChange,
	trackTerminalOutput,
	updateUserProgress,
	getProjectContext,
} from "../contextManager.js";
import {
	generateAIResponse,
	generateAIResponseStream,
	getCodeSuggestions,
	analyzeCodeComplexity,
	generateCommitMessage,
} from "../services/geminiService.js";
import { Project } from "../models/project.model.js";

/**
 * Initialize project context for AI
 */
export const initializeContext = async (req, res) => {
	try {
		const { projectId } = req.params;
		const userId = req.user.id;

		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		const context = await initializeProjectContext(userId, projectId, {
			title: project.title,
			description: project.description,
			difficulty: project.difficulty,
			techStack: project.techStack,
			requirements: project.requirements || [],
			templateRepo: project.templateRepo,
		});

		res.status(200).json({
			message: "Project context initialized",
			projectId,
			context: {
				title: context.projectInfo.title,
				startedAt: context.startedAt,
			},
		});
	} catch (error) {
		console.error("Error initializing context:", error);
		res.status(500).json({ message: "Error initializing context" });
	}
};

/**
 * Get AI response with full project context (Non-streaming)
 */
export const getAIResponse = async (req, res) => {
	try {
		const { projectId, query, currentFile, currentCode, taskType, userDir } =
			req.body;
		const userId = req.user.id;

		if (!query && !currentCode) {
			return res.status(400).json({ error: "Query or code is required" });
		}

		// Build comprehensive context
		const aiContext = await buildAIContext(
			userId,
			projectId,
			userDir,
			currentFile,
			currentCode
		);

		if (aiContext.error) {
			return res.status(400).json({ error: aiContext.error });
		}

		// Generate AI response
		const startTime = Date.now();
		const result = await generateAIResponse(taskType, query, aiContext);
		const duration = Date.now() - startTime;

		if (!result.success) {
			return res.status(500).json({ error: result.error });
		}

		res.status(200).json({
			success: true,
			response: result.response,
			taskType,
			contextUsed: {
				filesIncluded: aiContext.allFiles.length,
				errorsTracked: aiContext.recentActivity.errors.length,
				terminalLines: aiContext.recentActivity.terminalOutput.length,
			},
			duration,
			tokensUsed: result.tokensUsed,
		});
	} catch (error) {
		console.error("Error getting AI response:", error);
		res.status(500).json({ error: "Error getting AI response" });
	}
};

/**
 * Get AI response with streaming (SSE)
 */
export const getAIResponseStream = async (req, res) => {
	try {
		const { projectId, query, currentFile, currentCode, taskType, userDir } =
			req.body;
		const userId = req.user.id;

		if (!query && !currentCode) {
			return res.status(400).json({ error: "Query or code is required" });
		}

		// Build comprehensive context
		const aiContext = await buildAIContext(
			userId,
			projectId,
			userDir,
			currentFile,
			currentCode
		);

		if (aiContext.error) {
			return res.status(400).json({ error: aiContext.error });
		}

		// Set up SSE headers
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		// Send context info first
		res.write(
			`data: ${JSON.stringify({
				type: "context",
				filesIncluded: aiContext.allFiles.length,
				errorsTracked: aiContext.recentActivity.errors.length,
			})}\n\n`
		);

		// Stream AI response
		const stream = await generateAIResponseStream(taskType, query, aiContext);

		for await (const chunk of stream) {
			const text = chunk.text();
			res.write(
				`data: ${JSON.stringify({
					type: "token",
					content: text,
				})}\n\n`
			);
		}

		// Send done signal
		res.write(
			`data: ${JSON.stringify({
				type: "done",
			})}\n\n`
		);

		res.end();
	} catch (error) {
		console.error("Error streaming AI response:", error);
		res.write(
			`data: ${JSON.stringify({
				type: "error",
				error: error.message,
			})}\n\n`
		);
		res.end();
	}
};

/**
 * Get inline code suggestions (like Copilot)
 */
export const getInlineSuggestion = async (req, res) => {
	try {
		const { projectId, code, cursorPosition, userDir } = req.body;
		const userId = req.user.id;

		const aiContext = await buildAIContext(userId, projectId, userDir);

		if (aiContext.error) {
			return res.status(400).json({ error: aiContext.error });
		}

		const result = await getCodeSuggestions(code, cursorPosition, aiContext);

		res.status(200).json(result);
	} catch (error) {
		console.error("Error getting code suggestion:", error);
		res.status(500).json({ success: false, suggestion: "" });
	}
};

/**
 * Analyze code complexity
 */
export const analyzeCode = async (req, res) => {
	try {
		const { projectId, code, filePath, userDir } = req.body;
		const userId = req.user.id;

		const aiContext = await buildAIContext(userId, projectId, userDir);

		if (aiContext.error) {
			return res.status(400).json({ error: aiContext.error });
		}

		const result = await analyzeCodeComplexity(code, filePath, aiContext);

		res.status(200).json(result);
	} catch (error) {
		console.error("Error analyzing code:", error);
		res.status(500).json({ success: false, error: error.message });
	}
};

/**
 * Generate commit message
 */
export const getCommitMessage = async (req, res) => {
	try {
		const { projectId, userDir } = req.body;
		const userId = req.user.id;

		const context = getProjectContext(userId, projectId);
		if (!context) {
			return res.status(400).json({ error: "No project context found" });
		}

		// Get recent changes
		const recentChanges = context.codeChanges.slice(-10);

		const aiContext = await buildAIContext(userId, projectId, userDir);
		const result = await generateCommitMessage(recentChanges, aiContext);

		res.status(200).json(result);
	} catch (error) {
		console.error("Error generating commit message:", error);
		res.status(500).json({ success: false, message: "Update code" });
	}
};

/**
 * Track file changes for context
 */
export const trackFileChangeEndpoint = async (req, res) => {
	try {
		const { projectId, filePath, content, userDir } = req.body;
		const userId = req.user.id;

		await trackFileChange(userId, projectId, filePath, content, userDir);

		res.status(200).json({ message: "File change tracked" });
	} catch (error) {
		console.error("Error tracking file change:", error);
		res.status(500).json({ message: "Error tracking file change" });
	}
};

/**
 * Track terminal output for context
 */
export const trackTerminalOutputEndpoint = async (req, res) => {
	try {
		const { projectId, output, type } = req.body;
		const userId = req.user.id;

		trackTerminalOutput(userId, projectId, output, type);

		res.status(200).json({ message: "Terminal output tracked" });
	} catch (error) {
		console.error("Error tracking terminal output:", error);
		res.status(500).json({ message: "Error tracking terminal output" });
	}
};

/**
 * Update user progress
 */
export const updateProgressEndpoint = async (req, res) => {
	try {
		const { projectId } = req.params;
		const userId = req.user.id;
		const progressData = req.body;

		updateUserProgress(userId, projectId, progressData);

		res.status(200).json({ message: "Progress updated" });
	} catch (error) {
		console.error("Error updating progress:", error);
		res.status(500).json({ message: "Error updating progress" });
	}
};

/**
 * Get project context summary
 */
export const getContextSummary = async (req, res) => {
	try {
		const { projectId } = req.params;
		const userId = req.user.id;
		const { userDir } = req.query;

		const aiContext = await buildAIContext(userId, projectId, userDir);

		if (aiContext.error) {
			return res.status(400).json({ error: aiContext.error });
		}

		res.status(200).json({
			project: aiContext.project,
			stats: aiContext.stats,
			progress: aiContext.progress,
			recentActivity: {
				errorsCount: aiContext.recentActivity.errors.length,
				changesCount: aiContext.recentActivity.codeChanges.length,
			},
		});
	} catch (error) {
		console.error("Error getting context summary:", error);
		res.status(500).json({ message: "Error getting context summary" });
	}
};
