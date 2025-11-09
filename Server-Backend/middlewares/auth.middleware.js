import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import cookie from "cookie";

export const verifyJWT = async (req, res, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			return res.status(401).json({ message: "Access Token is required" });
		}

		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const userId = decodedToken.id;

		const user = await User.findById(userId).select(
			"-passwordHash -refreshToken -otp -otpExpiry"
		);

		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}
		
		req.user = user;
		next();
	} catch (error) {
		console.error(error);
		return res.status(401).json({ message: "Invalid Access Token" });
	}
};

export const checkAdminPassKey = (req,res,next)=>{
	try{
		const {adminPassKey } = req.body;
		
		if(!adminPassKey){
			return res.status(401).json({ message: "PassKey is missing" });
		}
		if(adminPassKey != process.env.ADMIN_PASSKEY){
			return res.status(401).json({ message: "Incorrect Passkey" });
		}
		req.body.role = "admin";
		next();
	}
	catch(error){
		console.error(error);
		return res.status(401).json({ message: "Invalid Pass key" });
	}
}

export const verifySocketJWT = async (socket, next) => {
	try {
		const cookiesHeader = socket.handshake.headers.cookie;

		if (!cookiesHeader) {
			return next(new Error("Access token cookie is required"));
		}

		// Parse cookies
		const cookies = cookie.parse(cookiesHeader);
		const token = cookies.accessToken;

		if (!token) {
			return next(new Error("Access token cookie is missing"));
		}

		// Verify JWT
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		// Fetch user from DB
		const user = await User.findById(decoded.id).select(
			"-passwordHash -refreshToken -otp -otpExpiry"
		);

		if (!user) {
			return next(new Error("User not found"));
		}

		socket.user = user; // attach user to socket
		next();
	} catch (err) {
		console.error("❌ Socket auth error:", err.message);
		next(new Error("Invalid or expired token"));
	}
};
