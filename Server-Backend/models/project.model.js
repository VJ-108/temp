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
      // required: true,
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
