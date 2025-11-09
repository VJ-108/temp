import { UserProject } from "../models/userProject.model.js";

const getAllUserProjects = async (req, res) => {
	try {
		const projects = await UserProject.find({ user: req.user.id })
			.populate("user", "username email")
			.populate("project", "title description difficulty techStack");

		res.status(200).json(projects);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching projects" });
	}
};

const getUserProjectById = async (req, res) => {
	try {
		const project = await UserProject.findById(req.params.id)
			.populate("user", "username email")
			.populate("project", "title description difficulty techStack");
		if (!project) return res.status(404).json({ message: "Project not found" });
		res.status(200).json(project);
	} catch (error) {
		res.status(500).json({ message: "Error fetching project" });
	}
};

const createUserProject = async (req, res) => {
	try {
        const { project, status } = req.body;
        const user = req.user.id;
		const newProject = await UserProject.create({ user, project, status });
		res.status(201).json(newProject);
	} catch (error) {
		res.status(500).json({ message: "Error creating user project" });
	}
};

const updateUserProject = async (req, res) => {
	try {
		const updatedProject = await UserProject.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedProject)
			return res.status(404).json({ message: "Project not found" });
		res.status(200).json(updatedProject);
	} catch (error) {
		res.status(500).json({ message: "Error updating user project" });
	}
};

const deleteUserProject = async (req, res) => {
	try {
		const deletedProject = await UserProject.findByIdAndDelete(req.params.id);
		if (!deletedProject)
			return res.status(404).json({ message: "Project not found" });
		res.status(200).json({ message: "Project deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting user project" });
	}
};

const addCodeHistory = async (req, res) => {
	try {
		const { fileName, code } = req.body;
		const project = await UserProject.findById(req.params.id);
		if (!project) return res.status(404).json({ message: "Project not found" });

		project.codeHistory.push({ fileName, code });
		await project.save();
		res.status(200).json({
			message: "Code updated successfully",
			codeHistory: project.codeHistory,
		});
	} catch (error) {
		res.status(500).json({ message: "Error adding code history" });
	}
};

const addAISuggestion = async (req, res) => {
	try {
		const { message, type } = req.body;
		const project = await UserProject.findById(req.params.id);
		if (!project) return res.status(404).json({ message: "Project not found" });

		project.aiSuggestions.push({ message, type });
		await project.save();
		res.status(200).json({
			message: "AI suggestion added",
			aiSuggestions: project.aiSuggestions,
		});
	} catch (error) {
		res.status(500).json({ message: "Error adding AI suggestion" });
	}
};

const addEvaluation = async (req, res) => {
	try {
		const { testResults, score, feedback } = req.body;
		const project = await UserProject.findById(req.params.id);
		if (!project) return res.status(404).json({ message: "Project not found" });

		project.evaluations.push({ testResults, score, feedback });
		await project.save();
		res
			.status(200)
			.json({ message: "Evaluation added", evaluations: project.evaluations });
	} catch (error) {
		res.status(500).json({ message: "Error adding evaluation" });
	}
};

export {
	getAllUserProjects,
	getUserProjectById,
	createUserProject,
	updateUserProject,
	deleteUserProject,
	addCodeHistory,
	addAISuggestion,
	addEvaluation,
};
