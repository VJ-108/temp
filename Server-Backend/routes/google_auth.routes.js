import express from "express";
import passport from "../config/passport.js";
import { googleauth } from "../controllers/google_auth.controller.js";

const router = express.Router();

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		session: false,
		failureRedirect: process.env.FRONTEND_URL + "login",
	}),
	googleauth
);

export default router;
