import http from "http";
import { configDotenv } from "dotenv";
import app from "./app.js";
import setupSocketServer from "./socket.js";

configDotenv();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO on the same server
setupSocketServer(server, app);

// Start server
server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📡 Socket.IO ready on the same port`);
	console.log(`🐳 Docker IDE integrated`);
});
