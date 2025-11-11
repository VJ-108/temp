import http from "http";
import { configDotenv } from "dotenv";
import app from "./app.js";
import setupSocketServer from "./socket.js";

// ✅ 1. Add these handlers RIGHT AT THE TOP before anything else
process.on("uncaughtException", (err) => {
	if (err.code === "EPIPE") {
		console.log("⚠️  EPIPE error caught and handled");
		return; // Don't crash
	}
	console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("SIGTERM", () => {
	console.log("👋 SIGTERM signal received: closing server gracefully");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("👋 SIGINT signal received: closing server gracefully");
	process.exit(0);
});

console.log("✅ Global error handlers initialized");

// ✅ 2. Load environment variables
configDotenv();

const PORT = process.env.PORT || 3000;

// ✅ 3. Create and start the HTTP server
const server = http.createServer(app);

// ✅ 4. Initialize Socket.IO with your custom setup
setupSocketServer(server, app);

// ✅ 5. Start listening
server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📡 Socket.IO ready on the same port`);
	console.log(`🐳 Docker IDE integrated`);
});
