import { Project } from "../models/project.model.js";

const getAllProjects = async (req, res) => {
	try {
		const projects = await Project.find();
		res.status(200).json(projects);
	} catch (err) {
		res.status(500).json({ message: "Error fetching projects" });
	}
};


const getProjectById = async (req, res) => {
	try {
		const project = await Project.findById(req.params.id);
		if (!project) return res.status(404).json({ message: "Project not found" });
		res.status(200).json(project);
	} catch (err) {
		res.status(500).json({ message: "Error fetching project" });
	}
};

const createProject = async (req, res) => {
	try {
		const {
			title,
			description,
			difficulty,
			techStack,
			templateRepo,
			learningObjectives, // NEW
			tasks, // NEW
		} = req.body;

		const project = await Project.create({
			title,
			description,
			difficulty,
			techStack,
			templateRepo,
			learningObjectives: learningObjectives || [], // NEW
			tasks: tasks || [], // NEW
		});

		res.status(201).json(project);
	} catch (err) {
		console.error("Error creating project:", err);
		res.status(500).json({ message: "Error creating project" });
	}
};


const updateProject = async (req, res) => {
	try {
		const {
			title,
			description,
			difficulty,
			techStack,
			templateRepo,
			learningObjectives, // NEW
			tasks, // NEW
		} = req.body;

		const updatedProject = await Project.findByIdAndUpdate(
			req.params.id,
			{
				title,
				description,
				difficulty,
				techStack,
				templateRepo,
				learningObjectives, // NEW
				tasks, // NEW
			},
			{ new: true }
		);

		if (!updatedProject)
			return res.status(404).json({ message: "Project not found" });

		res.status(200).json(updatedProject);
	} catch (err) {
		console.error("Error updating project:", err);
		res.status(500).json({ message: "Error updating project" });
	}
};


const deleteProject = async (req, res) => {
	try {
		const deletedProject = await Project.findByIdAndDelete(req.params.id);
		if (!deletedProject)
			return res.status(404).json({ message: "Project not found" });
		res.status(200).json({ message: "Project deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: "Error deleting project" });
	}
};

export {
	getAllProjects,
	getProjectById,
	createProject,
	updateProject,
	deleteProject,
};
