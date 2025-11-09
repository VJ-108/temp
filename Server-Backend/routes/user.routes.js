import express from "express";
import {
	signup,
	login,
	logout,
	deleteAccount,
	verifyOTP,
    resendOTP,
	refreshAccessToken,
	getProfile,
	updateProfile,
	changePassword,
} from "../controllers/user.controller.js";
import { verifyJWT ,checkAdminPassKey} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/adminsignup").post(checkAdminPassKey,signup);
router.route("/adminlogin").post(checkAdminPassKey,login);
router.route("/logout").post(verifyJWT, logout);
router.route("/deleteAccount").delete(verifyJWT, deleteAccount);
router.route("/verifyOTP").post(verifyOTP);
router.route("/resendOTP").post(resendOTP);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/get-profile").get(verifyJWT, getProfile)
router.route("/update-profile").put(verifyJWT, updateProfile);
router.route("/changePassword").post(verifyJWT, changePassword);

export default router;
