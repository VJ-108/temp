// Server-Backend/models/project.model.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},

		description: {
			type: String,
			required: true,
		},

		difficulty: {
			type: String,
			enum: ["easy", "medium", "hard"],
			required: true,
		},

		techStack: [
			{
				type: String,
			},
		],

		templateRepo: {
			type: String,
		},

		// NEW: Learning objectives for this project
		learningObjectives: [
			{
				type: String,
			},
		],

		// NEW: Structured tasks for project-based learning
		tasks: [
			{
				id: {
					type: Number,
					required: true,
				},
				title: {
					type: String,
					required: true,
				},
				description: {
					type: String,
					required: true,
				},
				concept: {
					type: String, // e.g., "DOM Manipulation", "Event Handling"
					required: true,
				},
				// Progressive hints (Level 1 → 2 → 3)
				hints: [
					{
						type: String,
					},
				],
				// External learning resources
				resources: [
					{
						title: String,
						url: String,
					},
				],
				// Expected files/code patterns (for future validation)
				validation: {
					requiredFiles: [String],
					codePatterns: [String], // e.g., "addEventListener", "querySelector"
				},
			},
		],
	},
	{ timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
