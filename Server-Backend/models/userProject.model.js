// Server-Backend/models/userProject.model.js
import mongoose from "mongoose";

const userProjectSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		project: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
			required: true,
		},

		status: {
			type: String,
			enum: ["in-progress", "completed"],
			default: "in-progress",
		},

		// NEW: Track which tasks are completed
		completedTasks: [
			{
				type: Number, // Task ID
			}
		],

		// NEW: Track concepts learned
		conceptsLearned: [
			{
				type: String, // Concept name
			}
		],

		// NEW: Track current active task
		currentTask: {
			type: Number,
			default: 1,
		},

		codeHistory: [
			{
				fileName: { type: String, required: true },
				code: { type: String, required: true },
				timestamp: { type: Date, default: Date.now },
			},
		],

		aiSuggestions: [
			{
				message: { type: String, required: true },
				type: {
					type: String,
					enum: ["hint", "debug", "improvement"],
					default: "hint",
				},
				createdAt: { type: Date, default: Date.now },
			},
		],

		evaluations: [
			{
				testResults: { type: Object, required: true },
				score: { type: Number, required: true },
				feedback: { type: String, required: true },
				createdAt: { type: Date, default: Date.now },
			},
		],

		startedAt: { type: Date, default: Date.now },

		completedAt: { type: Date },
	},
	{ timestamps: true }
);

userProjectSchema.index({ user: 1, project: 1 }, { unique: true });

export const UserProject = mongoose.model("UserProject", userProjectSchema);