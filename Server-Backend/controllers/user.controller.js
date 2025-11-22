import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { sendOTP } from "../utils/emailService.js";
import { User } from "../models/user.model.js";

const generateRefreshToken = async (user) => {
	const refreshToken = jwt.sign(
		{ id: user._id },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
	);

	await User.findOneAndUpdate({ email: user.email }, { refreshToken });

	return refreshToken;
};

const generateAccessToken = async (user) => {
	return jwt.sign(
		{
			id: user._id,
			email: user.email,
			username: user.username,
			role: user.role,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
	);
};

const refreshAccessToken = async (req, res) => {
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		return res.status(401).json({ message: "Refresh token missing" });
	}

	try {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		const user = await User.findById(decoded.id).select("+refreshToken");

		if (!user || user.refreshToken !== refreshToken) {
			return res.status(401).json({
				message: "Invalid refresh token",
				refresh_token: user.refreshToken,
				refreshToken,
			});
		}

		const newAccessToken = jwt.sign(
			{
				id: user._id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
		);

		const options = {
			httpOnly: true,
			secure: false, // (HTTP ONLY)
			sameSite: "lax",
			domain: "16.171.21.4.nip.io",
			path: "/",
		};

		res.cookie("accessToken", newAccessToken, options);

		return res.status(200).json({ accessToken: newAccessToken });
	} catch (err) {
		console.error(err);
		return res.status(401).json({ message: "Invalid refresh token" });
	}
};

const verifyOTP = async (req, res) => {
	const { email, otp } = req.body;
	try {
		const user = await User.findOne({ email }).select(
			"+otp +otpExpiry +verified"
		);

		if (!user) return res.status(400).json({ message: "User not found" });
		if (user.otp !== otp)
			return res.status(400).json({ message: "Invalid OTP" });

		if (user.otpExpiry && new Date() > user.otpExpiry)
			return res.status(400).json({ message: "OTP has expired" });

		user.otp = null;
		user.otpExpiry = null;
		user.verified = true;
		await user.save();

		res.status(200).json({ message: "Email verified successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error verifying OTP" });
	}
};

const resendOTP = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: "User not found" });

		if (user.verified)
			return res.status(400).json({ message: "User already verified" });

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiryTime = parseInt(process.env.OTP_EXPIRY_TIME, 10);
		const otpExpiry = new Date(Date.now() + otpExpiryTime);

		user.otp = otp;
		user.otpExpiry = otpExpiry;
		await user.save();

		await sendOTP(email, otp);
		res.status(200).json({ message: "OTP sent successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error resending OTP" });
	}
};

const signup = async (req, res) => {
	try {
		const { username, email, password, role, preferences, avatar } = req.body;

		const existedUser = await User.findOne({
			$or: [{ username }, { email }],
		});
		if (existedUser)
			return res
				.status(400)
				.json({ message: "Username or email already exists" });

		const passwordHash = await bcryptjs.hash(password, 10);

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiryTime = parseInt(process.env.OTP_EXPIRY_TIME, 10);
		const otpExpiry = new Date(Date.now() + otpExpiryTime);

		const user = await User.create({
			username,
			email,
			passwordHash,
			role: role || "student",
			otp,
			otpExpiry,
			preferences: preferences || {},
			avatar,
		});

		await sendOTP(email, otp);

		res.status(201).json({
			message: "User created successfully, please verify your email",
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				preferences: user.preferences,
				avatar: user.avatar,
				verified: user.verified,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Error creating new user" });
	}
};

const login = async (req, res) => {
	try {
		const decodedToken = req.cookies?.accessToken;

		if (decodedToken) {
			try {
				const decoded = jwt.verify(
					decodedToken,
					process.env.ACCESS_TOKEN_SECRET
				);
				if (!decoded || !decoded.id)
					return res.status(401).json({ message: "Invalid access token" });

				const user = await User.findById(decoded.id);

				if (!user) return res.status(401).json({ message: "User not found" });
				if (!user.verified)
					return res
						.status(401)
						.json({ message: "Please verify your email to login" });

				return res.status(200).json({
					message: "Logged in successfully",
					user,
				});
			} catch (error) {
				return res.status(401).json({ message: "Invalid access token" });
			}
		}

		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) return res.status(401).json({ message: "Invalid email" });
		if (!user.verified)
			return res
				.status(401)
				.json({ message: "Please verify your email to login" });

		const isPasswordCorrect = await bcryptjs.compare(
			password,
			user.passwordHash
		);
		if (!isPasswordCorrect)
			return res.status(401).json({ message: "Invalid password" });

		const accessToken = await generateAccessToken(user);
		const refreshToken = await generateRefreshToken(user);

		const options = {
			httpOnly: true,
			secure: false, // (HTTP ONLY)
			sameSite: "lax",
			domain: "16.171.21.4.nip.io",
			path: "/",
		};

		res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", refreshToken, options)
			.json({
				message: "Logged in successfully",
				user: {
					id: user._id,
					username: user.username,
					email: user.email,
					role: user.role,
					verified: user.verified,
				},
				accessToken,
				refreshToken,
			});
	} catch (error) {
		res.status(500).json({ message: "Error logging in" });
	}
};

const logout = async (req, res) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.user.id,
			{ refreshToken: null },
			{ new: true }
		);
		if (!updatedUser)
			return res.status(401).json({ message: "User not found" });

		res
			.status(200)
			.clearCookie("accessToken")
			.clearCookie("refreshToken")
			.json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error logging out" });
	}
};

const deleteAccount = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findByIdAndDelete(userId);

		if (!user) return res.status(401).json({ message: "User not found" });

		res
			.status(200)
			.clearCookie("accessToken")
			.clearCookie("refreshToken")
			.json({ message: "Account deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting account" });
	}
};

const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select(
			"-passwordHash -refreshToken -otp -otpExpiry"
		);
		res.status(200).json({ user });
	} catch (err) {
		res.status(500).json({ message: "Error fetching profile" });
	}
};

const updateProfile = async (req, res) => {
	try {
		const { preferences, username, avatar } = req.body;
		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ preferences, username, avatar },
			{
				new: true,
			}
		).select("-passwordHash -refreshToken -otp -otpExpiry");
		res.status(200).json({ message: "Profile updated", user });
	} catch (err) {
		res.status(500).json({ message: "Error updating profile" });
	}
};

const changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		const user = await User.findById(req.user.id).select("+passwordHash");
		if (!user) return res.status(404).json({ message: "User not found" });

		const isValid = await bcryptjs.compare(oldPassword, user.passwordHash);
		if (!isValid)
			return res.status(400).json({ message: "Old password incorrect" });

		user.passwordHash = await bcryptjs.hash(newPassword, 10);
		await user.save();
		res.status(200).json({ message: "Password changed successfully" });
	} catch (err) {
		res.status(500).json({ message: "Error changing password" });
	}
};

export {
	generateAccessToken,
	generateRefreshToken,
	refreshAccessToken,
	signup,
	login,
	logout,
	deleteAccount,
	verifyOTP,
	resendOTP,
	getProfile,
	updateProfile,
	changePassword,
};
