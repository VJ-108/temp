// Server-Backend/routes/ai.routes.js
import express from "express";
import {
	initializeContext,
	getAIResponse,
	getAIResponseStream,
	getInlineSuggestion,
	analyzeCode,
	getCommitMessage,
	trackFileChangeEndpoint,
	trackTerminalOutputEndpoint,
	updateProgressEndpoint,
	getContextSummary,
} from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Initialize project context
router.post("/context/init/:projectId", verifyJWT, initializeContext);

// Get AI response (non-streaming)
router.post("/query", verifyJWT, getAIResponse);

// Get AI response (streaming)
router.post("/query/stream", verifyJWT, getAIResponseStream);

// Get inline code suggestions (like Copilot)
router.post("/suggest", verifyJWT, getInlineSuggestion);

// Analyze code complexity
router.post("/analyze", verifyJWT, analyzeCode);

// Generate commit message
router.post("/commit-message", verifyJWT, getCommitMessage);

// Track file changes
router.post("/track/file-change", verifyJWT, trackFileChangeEndpoint);

// Track terminal output
router.post("/track/terminal", verifyJWT, trackTerminalOutputEndpoint);

// Update progress
router.post("/progress/:projectId", verifyJWT, updateProgressEndpoint);

// Get context summary
router.get("/context/:projectId", verifyJWT, getContextSummary);

export default router;
