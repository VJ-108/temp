import { useCallback, useEffect, useState } from "react";
import Terminal from "../components/terminal";
import FileTree from "../components/FileTree";
import PortDisplay from "../components/PortDisplay";
import AIAssistant from "../components/AIAssistant";
import AceEditor from "react-ace";
import { getFileMode } from "../utils/getFileMode";
import { Save, FileCode, Menu, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { connectSocket, getSocket, disconnectSocket } from "../socket";
import { useNavigate } from "react-router-dom";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

function Editor() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [socket, setSocket] = useState(null);
	const [fileTree, setFileTree] = useState({});
	const [selectedFile, setSelectedFile] = useState("");
	const [selectedFileContent, setSelectedFileContent] = useState("");
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [aiPanelOpen, setAiPanelOpen] = useState(true);
	const [terminalHeight, setTerminalHeight] = useState(300);
	const [isResizing, setIsResizing] = useState(false);
	const [socketConnected, setSocketConnected] = useState(false);

	const isSaved = selectedFileContent === code;

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!loading && !user) {
			console.log("⚠️  No user found, redirecting to login");
			navigate("/login");
		}
	}, [loading, user, navigate]);

	// Establish socket connection
	useEffect(() => {
		if (loading) return;

		if (user && user._id) {
			console.log("🔌 Establishing socket connection for user:", user._id);
			const s = connectSocket(user._id);

			if (s) {
				setSocket(s);

				// Socket event listeners
				const handleConnect = () => {
					console.log("✅ Socket connected");
					setSocketConnected(true);
				};

				const handleDisconnect = () => {
					console.log("❌ Socket disconnected");
					setSocketConnected(false);
				};

				s.on("connect", handleConnect);
				s.on("disconnect", handleDisconnect);

				// Set initial state if already connected
				if (s.connected) {
					setSocketConnected(true);
				}

				return () => {
					s.off("connect", handleConnect);
					s.off("disconnect", handleDisconnect);
				};
			}
		} else {
			// Disconnect socket if no user
			disconnectSocket();
			setSocket(null);
			setSocketConnected(false);
		}
	}, [loading, user]);

	// File tree updates
	useEffect(() => {
		if (!socket || !socketConnected) return;

		const handleTreeRefresh = (tree) => {
			console.log("📁 File tree updated");
			setFileTree(tree);
		};

		socket.on("file:refresh", handleTreeRefresh);

		return () => {
			socket.off("file:refresh", handleTreeRefresh);
		};
	}, [socket, socketConnected]);

	// Auto save
	useEffect(() => {
		if (!socket || !socketConnected || !selectedFile || isSaved || !code)
			return;

		const timer = setTimeout(() => {
			socket.emit("file:change", { path: selectedFile, content: code });
			setSelectedFileContent(code);
		}, 2000);

		return () => clearTimeout(timer);
	}, [socket, socketConnected, code, selectedFile, isSaved]);

	useEffect(() => {
		setCode(selectedFileContent);
	}, [selectedFileContent]);

	// Fetch file content
	const fetchFileContent = useCallback(async () => {
		if (
			!selectedFile ||
			!user?._id ||
			selectedFile === "/" ||
			selectedFile === ""
		)
			return;

		setIsLoading(true);
		setError("");

		try {
			const res = await fetch(
				`http://localhost:3000/files/content?userId=${
					user._id
				}&socketId=${socket.id}&path=${encodeURIComponent(selectedFile)}`,
				{
					credentials: "include",
				}
			);
			const data = await res.json();

			if (res.ok) {
				setSelectedFileContent(data.content);
			} else {
				setError(data.error || "Failed to load file");
				setSelectedFileContent("");
			}
		} catch (err) {
			setError("Failed to load file");
			setSelectedFileContent("");
			console.error("Error fetching file:", err);
		} finally {
			setIsLoading(false);
		}
	}, [selectedFile, user]);

	useEffect(() => {
		if (selectedFile) {
			fetchFileContent();
		} else {
			setSelectedFileContent("");
			setCode("");
			setError("");
		}
	}, [selectedFile, fetchFileContent]);

	// Periodically refresh file tree
	useEffect(() => {
		if (!socket || !socketConnected) return;

		const interval = setInterval(() => {
			socket.emit("file:tree:refresh");
		}, 3000);

		return () => clearInterval(interval);
	}, [socket, socketConnected]);

	const handleRefresh = () => {
		if (socket && socketConnected) {
			socket.emit("file:tree:refresh");
		}
	};

	// File operations
	const handleAdd = async (path, type) => {
		if (!user?._id) return;
		const newName = prompt(`Enter ${type} name:`);
		if (!newName) return;

		const newPath = path ? `${path}/${newName}` : `/${newName}`;

		try {
			await fetch("http://localhost:3000/files/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user._id, path: newPath, type,socketId: socket.id }),
				credentials: "include",
			});
		} catch (err) {
			alert("Failed to create file");
			console.error(err);
		}
	};

	const handleDelete = async (path) => {
		if (!user?._id || !path) return;
		if (!window.confirm(`Delete "${path}"?`)) return;

		try {
			await fetch("http://localhost:3000/files/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user._id, path, socketId: socket.id }),
				credentials: "include",
			});

			if (selectedFile === path) setSelectedFile("");
		} catch (err) {
			alert("Failed to delete file");
			console.error(err);
		}
	};

	const handleRename = async (path) => {
		if (!user?._id || !path) return;
		const newName = prompt("Enter new name:");
		if (!newName) return;

		const pathParts = path.split("/");
		pathParts[pathParts.length - 1] = newName;
		const newPath = pathParts.join("/");

		try {
			await fetch("http://localhost:3000/files/rename", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user._id, oldPath: path, newPath, socketId: socket.id }),
				credentials: "include",
			});

			if (selectedFile === path) setSelectedFile(newPath);
		} catch (err) {
			alert("Failed to rename file");
			console.error(err);
		}
	};

	const handleSelect = (path) => {
		if (path && path !== "/" && path !== "") setSelectedFile(path);
	};

	const handleManualSave = () => {
		if (socket && socketConnected && selectedFile && !isSaved) {
			socket.emit("file:change", { path: selectedFile, content: code });
			setSelectedFileContent(code);
		}
	};

	// Terminal resizer
	const handleMouseDown = (e) => {
		setIsResizing(true);
		e.preventDefault();
	};

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!isResizing) return;
			const newHeight = window.innerHeight - e.clientY;
			if (newHeight >= 150 && newHeight <= 600) {
				setTerminalHeight(newHeight);
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing]);

	// Show loading while checking authentication
	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					backgroundColor: "#1e1e1e",
					color: "#cccccc",
					fontSize: "16px",
				}}
			>
				<div>Loading...</div>
			</div>
		);
	}

	// Show connection status
	if (!socketConnected && user) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					backgroundColor: "#1e1e1e",
					color: "#cccccc",
					flexDirection: "column",
					gap: "16px",
				}}
			>
				<div style={{ fontSize: "16px" }}>Connecting to IDE...</div>
				<div style={{ fontSize: "12px", color: "#858585" }}>
					Please wait while we set up your workspace
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				backgroundColor: "#1e1e1e",
				color: "#cccccc",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				// padding: "8px",
				paddingTop: "76px",
				paddingBottom: "90px",
			}}
		>
			{/* Top Bar */}
			<div
				style={{
					height: "35px",
					backgroundColor: "#323233",
					borderBottom: "1px solid #2d2d30",
					display: "flex",
					alignItems: "center",
					padding: "0 12px",
					gap: "12px",
				}}
			>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					style={{
						background: "none",
						border: "none",
						color: "#cccccc",
						cursor: "pointer",
						padding: "4px",
						display: "flex",
						alignItems: "center",
					}}
					title="Toggle Sidebar"
				>
					<Menu size={18} />
				</button>
				<button
					onClick={() => setAiPanelOpen(!aiPanelOpen)}
					style={{
						background: "none",
						border: "none",
						color: aiPanelOpen ? "#4caf50" : "#cccccc",
						cursor: "pointer",
						padding: "4px",
						display: "flex",
						alignItems: "center",
					}}
					title="Toggle AI Assistant"
				>
					<Bot size={18} />
				</button>
				<span style={{ fontSize: "13px", fontWeight: 500 }}>
					Docker IDE - {user?.username}
				</span>
				<div
					style={{
						marginLeft: "auto",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						fontSize: "12px",
					}}
				>
					<span
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: socketConnected ? "#4caf50" : "#ff9800",
						}}
					></span>
					<span>{socketConnected ? "Connected" : "Connecting..."}</span>
				</div>
			</div>

			{/* Main Area */}
			<div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
				{/* Sidebar */}
				{sidebarOpen && (
					<div
						style={{
							width: "250px",
							backgroundColor: "#252526",
							borderRight: "1px solid #2d2d30",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						<PortDisplay socket={socket} userId={user?._id} />
						<div style={{ flex: 1, overflow: "hidden" }}>
							<FileTree
								tree={fileTree}
								onSelect={handleSelect}
								onAdd={handleAdd}
								onDelete={handleDelete}
								onRename={handleRename}
								selectedPath={selectedFile}
								onRefresh={handleRefresh}
							/>
						</div>
					</div>
				)}

				{/* Editor Area */}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					{selectedFile && (
						<div
							style={{
								height: "36px",
								backgroundColor: "#2d2d2d",
								borderBottom: "1px solid #2d2d30",
								display: "flex",
								alignItems: "center",
								padding: "0 12px",
								gap: "8px",
							}}
						>
							<FileCode size={16} style={{ color: "#858585" }} />
							<span style={{ fontSize: "13px" }}>
								{selectedFile.split("/").pop()}
							</span>
							{!isSaved && (
								<>
									<span
										style={{
											width: "6px",
											height: "6px",
											borderRadius: "50%",
											backgroundColor: "#ff9800",
										}}
									></span>
									<button
										onClick={handleManualSave}
										style={{
											marginLeft: "auto",
											padding: "4px 12px",
											fontSize: "12px",
											backgroundColor: "#0e639c",
											color: "white",
											border: "none",
											borderRadius: "2px",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "6px",
										}}
									>
										<Save size={14} />
										Save
									</button>
								</>
							)}
						</div>
					)}

					<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
						{selectedFile ? (
							error ? (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										height: "100%",
										color: "#f48771",
									}}
								>
									<div style={{ textAlign: "center" }}>
										<p style={{ fontSize: "14px", marginBottom: "8px" }}>
											Error
										</p>
										<p style={{ fontSize: "12px", opacity: 0.8 }}>{error}</p>
									</div>
								</div>
							) : isLoading ? (
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
									Loading...
								</div>
							) : (
								<AceEditor
									width="100%"
									height="100%"
									mode={getFileMode({ selectedFile })}
									theme="monokai"
									value={code}
									onChange={setCode}
									name="code-editor"
									editorProps={{ $blockScrolling: true }}
									setOptions={{
										enableBasicAutocompletion: true,
										enableLiveAutocompletion: true,
										enableSnippets: true,
										showLineNumbers: true,
										tabSize: 2,
										fontSize: 13,
										showPrintMargin: false,
									}}
								/>
							)
						) : (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									height: "100%",
									flexDirection: "column",
									gap: "12px",
									color: "#858585",
								}}
							>
								<FileCode size={48} style={{ opacity: 0.3 }} />
								<div style={{ textAlign: "center" }}>
									<p style={{ fontSize: "16px", marginBottom: "8px" }}>
										No file selected
									</p>
									<p style={{ fontSize: "12px" }}>
										Select a file from the explorer to start editing
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* AI Assistant Panel */}
				{aiPanelOpen && (
					<div
						style={{
							width: "350px",
							backgroundColor: "#252526",
							borderLeft: "1px solid #2d2d30",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						<AIAssistant
							userId={user?._id}
							selectedFile={selectedFile}
							code={code}
						/>
					</div>
				)}
			</div>

			{/* Terminal Resizer */}
			<div
				onMouseDown={handleMouseDown}
				style={{
					height: "4px",
					backgroundColor: isResizing ? "#0e639c" : "#2d2d30",
					cursor: "ns-resize",
					transition: "background-color 0.2s",
				}}
			/>

			{/* Terminal */}
			<div
				style={{
					height: `${terminalHeight}px`,
					backgroundColor: "#1e1e1e",
					borderTop: "1px solid #2d2d30",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				<Terminal userId={user?._id} />
			</div>
		</div>
	);
}

export default Editor;
