import {
	generateAccessToken,
	generateRefreshToken,
} from "./user.controller.js";

const googleauth = async (req, res) => {
	try {
		const user = req.user;

		const accessToken = await generateAccessToken(user);
		const refreshToken = await generateRefreshToken(user);

		const options = {
			httpOnly: true,
			secure: false, // (HTTP ONLY)
			sameSite: "lax",
			domain: "13.48.148.189.nip.io",
			path: "/",
		};

		res
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", refreshToken, options)
			.redirect(process.env.FRONTEND_NIP_URL || "/");
	} catch (error) {
		console.error(error);
		return res.status(401).json({ message: "Unable to login with Google" });
	}
};

export { googleauth };
