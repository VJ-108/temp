import { useCallback, useEffect, useRef, useState } from "react";
import Terminal from "../components/terminal";
import FileTree from "../components/FileTree";
import PortDisplay from "../components/PortDisplay";
import AIAssistant from "../components/AIAssistant";
import AceEditor from "react-ace";
import { getFileMode } from "../utils/getFileMode";
import { Save, FileCode, Menu, Bot, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { connectSocket, getSocket, disconnectSocket } from "../socket";
import { useNavigate, useParams } from "react-router-dom";
import ProjectCompletionButton from "../components/ProjectCompletionButton";
import { API_BASE_URL, SERVER_URL } from "@/utils/constants";
import TaskPanel from "../components/TaskPanel";
// import { Info } from "lucide-react";
import InfoModal from "../components/InfoModal";
import CrazyInfoIcon from "../components/CrazyInfoIcon";


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
	const [terminalHeight, setTerminalHeight] = useState(250);
	const [isResizing, setIsResizing] = useState(false);
	const [socketConnected, setSocketConnected] = useState(false);
	const [currentProjectId, setCurrentProjectId] = useState(null);
	const { projectId } = useParams();
	const [userProjectId, setUserProjectId] = useState(null);
	const [projectStatus, setProjectStatus] = useState("in-progress");
	const [currentTask, setCurrentTask] = useState(null); // Track current task

	const isSaved = selectedFileContent === code;
	const [infoOpen, setInfoOpen] = useState(false);


	// 🔧 Scroll Fix: Freeze scroll during layout mount
	useEffect(() => {
		if ("scrollRestoration" in window.history) {
			window.history.scrollRestoration = "manual";
		}

		// Instantly scroll top and lock
		window.scrollTo({ top: 0, behavior: "auto" });
		document.body.style.overflow = "hidden";

		// Wait until editor + terminal mount fully
		const timer = setTimeout(() => {
			window.scrollTo({ top: 0, behavior: "auto" });
			document.body.style.overflow = "auto"; // re-enable scrolling
		}, 600); // wait for layout reflow & xterm fit

		return () => {
			clearTimeout(timer);
			if ("scrollRestoration" in window.history) {
				window.history.scrollRestoration = "auto";
			}
			document.body.style.overflow = "auto";
		};
	}, []);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!loading && !user) {
			console.log("⚠️  No user found, redirecting to login");
			navigate("/login");
		}
	}, [loading, user, navigate]);

	// Get project ID (customize this based on your routing)
	useEffect(() => {
		setCurrentProjectId(projectId);
	}, []);

	const loadingRef = useRef(false);

	useEffect(() => {
		if (!currentProjectId || !user?._id) return;
		if (loadingRef.current) return; // prevents double-run

		loadingRef.current = true;

		const initUserProject = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/user-projects`, {
					method: "GET",
					credentials: "include",
				});

				if (!response.ok) return;

				const projects = await response.json();
				const currentProject = projects.find(
					(p) => p.project._id === currentProjectId
				);

				if (currentProject) {
					setUserProjectId(currentProject._id);
					setProjectStatus(currentProject.status);
					return;
				}

				const createResponse = await fetch(`${API_BASE_URL}/user-projects`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						project: currentProjectId,
						status: "in-progress",
					}),
				});

				if (createResponse.ok) {
					const newProject = await createResponse.json();
					setUserProjectId(newProject._id);
					setProjectStatus(newProject.status);
				}
			} finally {
				loadingRef.current = false;
			}
		};

		initUserProject();
	}, [currentProjectId, user]);

	// Add callback for status change:
	const handleStatusChange = (newStatus) => {
		setProjectStatus(newStatus);
	};

	// Establish socket connection
	useEffect(() => {
		if (loading) return;

		if (user && user._id) {
			console.log("🔌 Establishing socket connection for user:", user._id);
			const s = connectSocket(user._id);

			if (s) {
				setSocket(s);

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

				if (s.connected) {
					setSocketConnected(true);
				}

				return () => {
					s.off("connect", handleConnect);
					s.off("disconnect", handleDisconnect);
				};
			}
		} else {
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
				`${SERVER_URL}/files/content?userId=${user._id}&socketId=${
					socket.id
				}&path=${encodeURIComponent(selectedFile)}`,
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
	}, [selectedFile, user, socket]);

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
			await fetch(`${SERVER_URL}/files/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					path: newPath,
					type,
					socketId: socket.id,
				}),
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
			await fetch(`${SERVER_URL}/files/delete`, {
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
			await fetch(`${SERVER_URL}/files/rename`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					oldPath: path,
					newPath,
					socketId: socket.id,
				}),
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
			const newHeight = window.innerHeight - e.clientY - 90; // Account for navbar/footer
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
				minHeight: "100vh",
				width: "100%",
				overflow: "hidden",

				backgroundColor: "#1e1e1e",
				color: "#cccccc",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				paddingTop: "76px",
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
					flexShrink: 0,
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
					IDE - {user?.username}
				</span>

				{/* Project Completion Button */}
				{userProjectId && (
    <div style={{ marginLeft: "auto", marginRight: "12px", display: "flex", alignItems: "center", gap: "10px" }}>

        {/* ℹ️ Info Icon */}
        <button
            onClick={() => setInfoOpen(true)}
            style={{
                 background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "none",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    cursor: "pointer",
    gap: "6px",
            }}
            title="Show Project Info"
        >
            <CrazyInfoIcon size={28} variant="neon" />
        </button>

        <ProjectCompletionButton
            userProjectId={userProjectId}
            currentStatus={projectStatus}
            onStatusChange={handleStatusChange}
        />
		<InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />

    </div>
)}


				<div
					style={{
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
			<div
				style={{
					display: "flex",
					flex: 1,
					overflow: "hidden",
					height: "100%",
				}}
			>
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
							flexShrink: 0,
						}}
					>
						<PortDisplay socket={socket} userId={user?._id} />

						{/* Task Panel - Collapsible */}
						<div
							style={{
								maxHeight: "50%",
								overflow: "hidden",
								borderBottom: "1px solid #2d2d30",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<TaskPanel
								projectId={currentProjectId}
								userId={user?._id}
								onTaskSelect={setCurrentTask}
							/>
						</div>

						{/* File Tree - Remaining Space */}
						<div
							style={{
								flex: 1,
								overflow: "hidden",
								display: "flex",
								flexDirection: "column",
							}}
						>
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

				{/* Center: Editor + Terminal */}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						minWidth: 0,
					}}
				>
					{/* Editor */}
					<div
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
							minHeight: 0,
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
									flexShrink: 0,
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

						<div
							style={{
								flex: 1,
								position: "relative",
								overflow: "hidden",
								minHeight: 0,
							}}
						>
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

					{/* Terminal Resizer */}
					<div
						onMouseDown={handleMouseDown}
						style={{
							height: "4px",
							backgroundColor: isResizing ? "#0e639c" : "#2d2d30",
							cursor: "ns-resize",
							transition: "background-color 0.2s",
							flexShrink: 0,
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
							flexShrink: 0,
						}}
					>
						<Terminal userId={user?._id} />
					</div>
				</div>

				{/* AI Assistant Panel - Full Height */}
				{aiPanelOpen && (
					<div
						style={{
							width: "350px",
							backgroundColor: "#252526",
							borderLeft: "1px solid #2d2d30",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
							flexShrink: 0,
						}}
					>
						<AIAssistant
							userId={user?._id}
							projectId={currentProjectId}
							selectedFile={selectedFile}
							code={code}
							socket={socket}
							currentTask={currentTask}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default Editor;
