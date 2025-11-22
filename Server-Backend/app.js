import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import connectDB from "./db.js";
import passport from "./config/passport.js";

configDotenv();

const app = express();

app.use(
	cors({
		origin: [process.env.FRONTEND_URL, process.env.FRONTEND_NIP_URL],
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use(passport.initialize());

import userRouter from "./routes/user.routes.js";
import google_authRouter from "./routes/google_auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import userProjectRouter from "./routes/userProject.routes.js";
import aiRouter from "./routes/ai.routes.js";
import taskRouter from "./routes/task.routes.js";

app.use("/api/auth", google_authRouter);
app.use("/api/user", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/user-projects", userProjectRouter);
app.use("/api/ai", aiRouter);
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
	res.send("API is running");
});

export default app;