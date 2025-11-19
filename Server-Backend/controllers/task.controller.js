// Server-Backend/controllers/task.controller.js
import { Project } from "../models/project.model.js";
import { UserProject } from "../models/userProject.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all tasks for a project
export const getProjectTasks = async (req, res) => {
	try {
		const { projectId } = req.params;
		const userId = req.user.id;

		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		// Get user's progress
		const userProject = await UserProject.findOne({
			user: userId,
			project: projectId,
		});

		res.status(200).json({
			tasks: project.tasks || [],
			learningObjectives: project.learningObjectives || [],
			completedTasks: userProject?.completedTasks || [],
			currentTask: userProject?.currentTask || 1,
			conceptsLearned: userProject?.conceptsLearned || [],
		});
	} catch (error) {
		console.error("Error fetching tasks:", error);
		res.status(500).json({ message: "Error fetching tasks" });
	}
};

// Get current task for user
export const getCurrentTask = async (req, res) => {
	try {
		const { projectId } = req.params;
		const userId = req.user.id;

		const project = await Project.findById(projectId);
		const userProject = await UserProject.findOne({
			user: userId,
			project: projectId,
		});

		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		const currentTaskId = userProject?.currentTask || 1;
		const currentTask = project.tasks.find((t) => t.id === currentTaskId);

		res.status(200).json({
			currentTask: currentTask || project.tasks[0],
			completedTasks: userProject?.completedTasks || [],
		});
	} catch (error) {
		console.error("Error fetching current task:", error);
		res.status(500).json({ message: "Error fetching current task" });
	}
};

// Mark task as complete
export const completeTask = async (req, res) => {
	try {
		const { projectId, taskId } = req.params;
		const userId = req.user.id;

		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		const task = project.tasks.find((t) => t.id === parseInt(taskId));
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		let userProject = await UserProject.findOne({
			user: userId,
			project: projectId,
		});

		if (!userProject) {
			// Create if doesn't exist
			userProject = await UserProject.create({
				user: userId,
				project: projectId,
				completedTasks: [parseInt(taskId)],
				conceptsLearned: [task.concept],
				currentTask: parseInt(taskId) + 1,
			});
		} else {
			// Update existing
			if (!userProject.completedTasks.includes(parseInt(taskId))) {
				userProject.completedTasks.push(parseInt(taskId));
			}

			if (!userProject.conceptsLearned.includes(task.concept)) {
				userProject.conceptsLearned.push(task.concept);
			}

			// Move to next task
			userProject.currentTask = parseInt(taskId) + 1;
			await userProject.save();
		}

		res.status(200).json({
			message: "Task completed",
			completedTasks: userProject.completedTasks,
			conceptsLearned: userProject.conceptsLearned,
			currentTask: userProject.currentTask,
		});
	} catch (error) {
		console.error("Error completing task:", error);
		res.status(500).json({ message: "Error completing task" });
	}
};

// Get AI explanation for a concept
export const getConceptExplanation = async (req, res) => {
	try {
		const { concept, taskDescription } = req.body;

		if (!concept) {
			return res.status(400).json({ message: "Concept is required" });
		}

		const model = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
			generationConfig: {
				temperature: 0.4,
				topP: 0.95,
				maxOutputTokens: 1024,
			},
		});

		const prompt = `You are a programming teacher explaining concepts to beginners.

Concept: ${concept}
Context: ${taskDescription || "General web development"}

Explain this concept in a beginner-friendly way:
1. What it is (2-3 sentences)
2. Why it's useful (1-2 sentences)
3. Simple code example (3-5 lines)
4. One practical tip

Keep it concise and clear. Use simple language.`;

		const result = await model.generateContent(prompt);
		const explanation = result.response.text();

		res.status(200).json({
			success: true,
			explanation,
			concept,
		});
	} catch (error) {
		console.error("Error generating explanation:", error);
		res.status(500).json({
			success: false,
			message: "Error generating explanation",
		});
	}
};
