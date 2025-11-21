import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { SERVER_URL } from "./utils/constants";

let socket = null;

export const connectSocket = (userId) => {
	if (!userId) {
		console.error("❌ Cannot connect socket: userId is required");
		return null;
	}

	// If socket already exists and connected for same user, return it
	if (socket && socket.connected && socket.auth.userId === userId) {
		console.log("✅ Socket already connected for user:", userId);
		return socket;
	}

	// Disconnect existing socket if user changed
	if (socket) {
		console.log("🔌 Disconnecting previous socket");
		socket.disconnect();
		socket = null;
	}
	
	console.log("🔌 Connecting socket for user:", userId);

	socket = io(`${SERVER_URL}`, {
		// No need to send token in auth; HttpOnly cookie will be sent automatically
		auth: {
			userId, // optional, if you still need to identify user client-side
		},
		transports: ["websocket", "polling"],
		withCredentials: true, // important: allows cookies to be sent
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
	});


	socket.on("connect", () => {
		console.log("✅ Socket connected:", socket.id, "for user:", userId);
	});

	socket.on("disconnect", (reason) => {
		console.log("❌ Socket disconnected:", reason);
		if (reason === "io server disconnect") {
			// Server forcefully disconnected, try to reconnect
			socket.connect();
		}
	});

	socket.on("connect_error", (err) => {
		console.error("⚠️  Socket connection error:", err.message);
		if (err.message.includes("token") || err.message.includes("auth")) {
			console.error("❌ Authentication failed. Please login again.");
			// You might want to redirect to login page here
		}
	});

	socket.on("reconnect", (attemptNumber) => {
		console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
	});

	socket.on("reconnect_attempt", (attemptNumber) => {
		console.log(`🔄 Attempting to reconnect (${attemptNumber})...`);
	});

	socket.on("reconnect_error", (err) => {
		console.error("❌ Reconnection error:", err.message);
	});

	socket.on("reconnect_failed", () => {
		console.error("❌ Failed to reconnect after all attempts");
	});

	return socket;
};

export const getSocket = () => {
	if (!socket) {
		console.warn("⚠️  Socket not initialized");
	}
	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		console.log("🔌 Socket manually disconnected");
		socket = null;
	}
};
