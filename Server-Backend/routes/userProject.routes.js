import express from "express";
import {
	getAllUserProjects,
	getUserProjectById,
	createUserProject,
	updateUserProject,
	deleteUserProject,
	addCodeHistory,
	addAISuggestion,
	addEvaluation,
} from "../controllers/userProject.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, getAllUserProjects);
router.get("/:id", verifyJWT, getUserProjectById);
router.post("/", verifyJWT, createUserProject);
router.put("/:id", verifyJWT, updateUserProject);
router.delete("/:id", deleteUserProject);

router.post("/:id/code", verifyJWT, addCodeHistory);
router.post("/:id/ai", verifyJWT, addAISuggestion);
router.post("/:id/eval", verifyJWT, addEvaluation);

export default router;
