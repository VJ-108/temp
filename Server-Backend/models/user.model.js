import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},


		passwordHash: {
			type: String,
		},

		
		googleId: {
			type: String,
			default: null,
		},

		
		verified: {
			type: Boolean,
			default: false,
		},

		
		otp: {
			type: String,
			default: null,
			select: false,
		},
		otpExpiry: {
			type: Date,
			default: null,
			select: false,
		},

		
		refreshToken: {
			type: String,
			default: null,
		},

		
		role: {
			type: String,
			enum: ["student", "teacher", "admin"],
			default: "student",
		},

		preferences: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		avatar: { type: String },
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);