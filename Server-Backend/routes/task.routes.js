// Server-Backend/routes/task.routes.js
import express from "express";
import {
	getProjectTasks,
	completeTask,
	getCurrentTask,
	getConceptExplanation,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all tasks for a project
router.get("/:projectId", verifyJWT, getProjectTasks);

// Get current task for user's project
router.get("/:projectId/current", verifyJWT, getCurrentTask);

// Mark task as complete
router.post("/:projectId/complete/:taskId", verifyJWT, completeTask);

// Get AI explanation for a concept
router.post("/explain-concept", verifyJWT, getConceptExplanation);

export default router;
