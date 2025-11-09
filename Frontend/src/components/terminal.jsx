import { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { getSocket } from "../socket.js";
import { Plus, X, Terminal as TerminalIcon } from "lucide-react";

const Terminal = ({ userId }) => {
	const [terminals, setTerminals] = useState([]);
	const [activeTerminalId, setActiveTerminalId] = useState("default");
	const terminalInstances = useRef(new Map());
	const containerRefs = useRef(new Map());
	const socketRef = useRef(null);

	useEffect(() => {
		if (!userId) {
			console.warn("⚠️  Terminal: No userId provided");
			return;
		}

		// Get existing socket connection
		const socket = getSocket();

		if (!socket) {
			console.error("❌ Terminal: Socket not initialized");
			return;
		}

		if (!socket.connected) {
			console.warn("⚠️  Terminal: Socket not connected yet, waiting...");

			// Wait for socket to connect
			const handleConnect = () => {
				console.log("✅ Terminal: Socket connected, initializing...");
				initializeTerminals();
			};

			socket.once("connect", handleConnect);

			return () => {
				socket.off("connect", handleConnect);
			};
		} else {
			// Socket already connected
			console.log("✅ Terminal: Socket already connected");
			initializeTerminals();
		}

		socketRef.current = socket;

		function initializeTerminals() {
			console.log("🖥️  Initializing terminals for user:", userId);

			// Set default terminal
			setTerminals([{ id: "default", name: "Terminal 1" }]);

			// Initialize default terminal UI
			setTimeout(() => {
				initializeTerminal("default");
			}, 100);

			// Socket event listeners
			const handleTerminalData = ({ terminalId, data }) => {
				const instance = terminalInstances.current.get(terminalId);
				if (instance?.term) {
					instance.term.write(data);
				}
			};

			const handleTerminalCreated = ({ terminalId }) => {
				console.log(`✅ Terminal ${terminalId} created on server`);
			};

			const handleTerminalClosed = ({ terminalId }) => {
				console.log(`🛑 Terminal ${terminalId} closed by server`);
				handleServerTerminalClose(terminalId);
			};

			const handleTerminalError = ({ terminalId, error }) => {
				console.error(`❌ Terminal error (${terminalId}):`, error);
				alert(`Terminal error: ${error}`);
			};

			const handleTerminalList = ({ terminals: termList }) => {
				console.log("📋 Terminal list received:", termList);
			};

			socket.on("terminal:data", handleTerminalData);
			socket.on("terminal:created", handleTerminalCreated);
			socket.on("terminal:closed", handleTerminalClosed);
			socket.on("terminal:error", handleTerminalError);
			socket.on("terminal:list", handleTerminalList);

			// Cleanup
			return () => {
				socket.off("terminal:data", handleTerminalData);
				socket.off("terminal:created", handleTerminalCreated);
				socket.off("terminal:closed", handleTerminalClosed);
				socket.off("terminal:error", handleTerminalError);
				socket.off("terminal:list", handleTerminalList);

				// Dispose all terminal instances
				terminalInstances.current.forEach(({ term }) => {
					try {
						term.dispose();
					} catch (err) {
						console.error("Error disposing terminal:", err);
					}
				});
				terminalInstances.current.clear();
			};
		}

		// Return cleanup from outer useEffect
		return () => {
			// Cleanup will be handled by inner function's return
		};
	}, [userId]);

	const initializeTerminal = (terminalId) => {
		// Wait for DOM element
		const checkAndInit = () => {
			const container = containerRefs.current.get(terminalId);

			if (!container) {
				console.warn(`⚠️  Container for ${terminalId} not ready, retrying...`);
				return false;
			}

			if (terminalInstances.current.has(terminalId)) {
				console.log(`✅ Terminal ${terminalId} already initialized`);
				return true;
			}

			try {
				const term = new XTerminal({
					rows: 30,
					cols: 80,
					convertEol: true,
					cursorBlink: true,
					cursorStyle: "block",
					fontFamily: 'Menlo, Monaco, "Courier New", monospace',
					fontSize: 14,
					scrollback: 1000,
					theme: {
						background: "#1e1e1e",
						foreground: "#d4d4d4",
						cursor: "#ffffff",
						black: "#000000",
						red: "#cd3131",
						green: "#0dbc79",
						yellow: "#e5e510",
						blue: "#2472c8",
						magenta: "#bc3fbc",
						cyan: "#11a8cd",
						white: "#e5e5e5",
					},
					// These settings prevent local echo
					allowProposedApi: false,
				});

				const fitAddon = new FitAddon();
				term.loadAddon(fitAddon);
				term.open(container);

				// Fit terminal to container
				setTimeout(() => {
					try {
						fitAddon.fit();
					} catch (err) {
						console.error("Error fitting terminal:", err);
					}
				}, 50);

				// Handle input - send everything to server, server echoes back
				const disposable = term.onData((data) => {
					const socket = getSocket();
					if (socket && socket.connected) {
						socket.emit("terminal:write", { terminalId, input: data });
					}
				});

				terminalInstances.current.set(terminalId, {
					term,
					fitAddon,
					disposable,
				});
				console.log(`✅ Terminal ${terminalId} initialized in UI`);

				return true;
			} catch (err) {
				console.error(`❌ Error initializing terminal ${terminalId}:`, err);
				return false;
			}
		};

		// Try multiple times with delay
		let attempts = 0;
		const maxAttempts = 10;

		const tryInit = () => {
			if (checkAndInit()) {
				return;
			}

			attempts++;
			if (attempts < maxAttempts) {
				setTimeout(tryInit, 100);
			} else {
				console.error(
					`❌ Failed to initialize terminal ${terminalId} after ${maxAttempts} attempts`
				);
			}
		};

		tryInit();
	};

	const createNewTerminal = () => {
		if (terminals.length >= 5) {
			alert("Maximum 5 terminals allowed");
			return;
		}

		const socket = getSocket();
		if (!socket || !socket.connected) {
			alert("Socket not connected. Please wait...");
			return;
		}

		const terminalId = `terminal_${Date.now()}`;
		const terminalName = `Terminal ${terminals.length + 1}`;

		// Add to UI
		setTerminals((prev) => [...prev, { id: terminalId, name: terminalName }]);

		// Initialize UI
		setTimeout(() => {
			initializeTerminal(terminalId);
		}, 100);

		// Switch to new terminal
		setActiveTerminalId(terminalId);

		// Request server to create terminal
		socket.emit("terminal:create", { terminalId });
	};

	const handleServerTerminalClose = (terminalId) => {
		// Terminal closed by server
		const instance = terminalInstances.current.get(terminalId);
		if (instance?.term) {
			try {
				instance.term.dispose();
			} catch (err) {
				console.error("Error disposing terminal:", err);
			}
		}

		terminalInstances.current.delete(terminalId);
		containerRefs.current.delete(terminalId);
		setTerminals((prev) => prev.filter((t) => t.id !== terminalId));

		if (activeTerminalId === terminalId) {
			setActiveTerminalId("default");
		}
	};

	const closeTerminal = (terminalId) => {
		if (terminalId === "default") {
			alert("Cannot close the default terminal");
			return;
		}

		const socket = getSocket();
		if (!socket || !socket.connected) {
			console.warn("⚠️  Socket not connected, cannot close terminal");
			return;
		}

		// Dispose UI
		const instance = terminalInstances.current.get(terminalId);
		if (instance?.term) {
			try {
				instance.term.dispose();
			} catch (err) {
				console.error("Error disposing terminal:", err);
			}
		}

		terminalInstances.current.delete(terminalId);
		containerRefs.current.delete(terminalId);
		setTerminals((prev) => prev.filter((t) => t.id !== terminalId));

		if (activeTerminalId === terminalId) {
			setActiveTerminalId("default");
		}

		// Notify server
		socket.emit("terminal:close", { terminalId });
	};

	const switchTerminal = (terminalId) => {
		setActiveTerminalId(terminalId);

		setTimeout(() => {
			const instance = terminalInstances.current.get(terminalId);
			if (instance?.fitAddon) {
				try {
					instance.fitAddon.fit();
					instance.term.focus();
				} catch (err) {
					console.error("Error fitting terminal:", err);
				}
			}
		}, 50);
	};

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			terminalInstances.current.forEach(({ fitAddon }) => {
				try {
					fitAddon.fit();
				} catch (err) {
					// Ignore resize errors
				}
			});
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (!userId) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					fontSize: "13px",
					color: "#858585",
				}}
			>
				Waiting for user authentication...
			</div>
		);
	}

	const socket = getSocket();
	if (!socket || !socket.connected) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					fontSize: "13px",
					color: "#858585",
				}}
			>
				Connecting to terminal...
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{/* Terminal Tabs */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "2px",
					backgroundColor: "#1e1e1e",
					borderBottom: "1px solid #2d2d30",
					padding: "0 8px",
					overflowX: "auto",
					flexShrink: 0,
				}}
			>
				{terminals.map((terminal) => (
					<div
						key={terminal.id}
						onClick={() => switchTerminal(terminal.id)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "6px 12px",
							fontSize: "12px",
							backgroundColor:
								activeTerminalId === terminal.id ? "#252526" : "transparent",
							color: activeTerminalId === terminal.id ? "#ffffff" : "#858585",
							cursor: "pointer",
							borderRadius: "4px 4px 0 0",
							transition: "all 0.2s",
							whiteSpace: "nowrap",
							userSelect: "none",
						}}
					>
						<TerminalIcon size={14} />
						<span>{terminal.name}</span>
						{terminal.id !== "default" && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									closeTerminal(terminal.id);
								}}
								style={{
									background: "none",
									border: "none",
									color: "#858585",
									cursor: "pointer",
									padding: "2px",
									display: "flex",
									alignItems: "center",
								}}
							>
								<X size={14} />
							</button>
						)}
					</div>
				))}

				{/* New Terminal Button */}
				<button
					onClick={createNewTerminal}
					disabled={terminals.length >= 5}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "4px",
						padding: "6px 10px",
						fontSize: "12px",
						backgroundColor: "transparent",
						color: terminals.length >= 5 ? "#3e3e42" : "#858585",
						border: "none",
						cursor: terminals.length >= 5 ? "not-allowed" : "pointer",
						borderRadius: "4px",
						transition: "all 0.2s",
						marginLeft: "4px",
					}}
				>
					<Plus size={14} />
					<span>New</span>
				</button>
			</div>

			{/* Terminal Containers */}
			<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				{terminals.map((terminal) => (
					<div
						key={terminal.id}
						ref={(el) => {
							if (el) {
								containerRefs.current.set(terminal.id, el);
							}
						}}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							padding: "10px",
							backgroundColor: "#1e1e1e",
							display: activeTerminalId === terminal.id ? "block" : "none",
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default Terminal;
