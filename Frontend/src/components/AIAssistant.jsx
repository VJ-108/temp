// Frontend/src/components/AIAssistant.jsx
import { useState, useEffect, useRef } from "react";
import {
	Bot,
	Bug,
	FileSearch,
	Lightbulb,
	TestTube,
	BookOpen,
	MessageCircle,
	Send,
	Loader2,
	Copy,
	Check,
	Sparkles,
	AlertCircle,
	TrendingUp,
	Code,
	Zap,
	X,
} from "lucide-react";
import { API_BASE_URL } from "@/utils/constants";

const AIAssistant = ({ userId, projectId, selectedFile, code, socket }) => {
	const [activeTab, setActiveTab] = useState("chat");
	const [chatMessages, setChatMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [streamingMessage, setStreamingMessage] = useState("");
	const [copiedIndex, setCopiedIndex] = useState(null);
	const [contextSummary, setContextSummary] = useState(null);
	// const [codeAnalysis, setCodeAnalysis] = useState(null);
	// const [showAnalysis, setShowAnalysis] = useState(false);
	const [suggestedPrompts, setSuggestedPrompts] = useState([]);

	const chatEndRef = useRef(null);

	// Enhanced tabs with descriptions
	const tabs = [
		{
			id: "chat",
			label: "Chat",
			icon: MessageCircle,
			color: "#06B6D4",
			desc: "Ask anything about your project",
		},
		{
			id: "debug",
			label: "Debug",
			icon: Bug,
			color: "#F59E0B",
			desc: "Find and fix errors",
		},
		{
			id: "review",
			label: "Review",
			icon: FileSearch,
			color: "#8B5CF6",
			desc: "Get code quality feedback",
		},
		{
			id: "refactor",
			label: "Refactor",
			icon: Code,
			color: "#10B981",
			desc: "Improve code structure",
		},
		{
			id: "optimize",
			label: "Optimize",
			icon: TrendingUp,
			color: "#EF4444",
			desc: "Boost performance",
		},
		{
			id: "security",
			label: "Security",
			icon: AlertCircle,
			color: "#DC2626",
			desc: "Find vulnerabilities",
		},
		{
			id: "test",
			label: "Tests",
			icon: TestTube,
			color: "#14B8A6",
			desc: "Generate test cases",
		},
		{
			id: "explain",
			label: "Explain",
			icon: BookOpen,
			color: "#F97316",
			desc: "Learn concepts",
		},
	];

	// Suggested prompts based on context
	useEffect(() => {
		if (contextSummary) {
			const prompts = [];

			if (contextSummary.stats?.unresolvedErrors > 0) {
				prompts.push("Help me fix the recent errors");
			}

			if (selectedFile) {
				prompts.push(`Review ${selectedFile.split("/").pop()}`);
				prompts.push("Optimize this file");
			}

			if (contextSummary.recentActivity?.changesCount > 5) {
				prompts.push("Summarize my recent changes");
			}

			prompts.push("What should I work on next?");

			setSuggestedPrompts(prompts.slice(0, 3));
		}
	}, [contextSummary, selectedFile]);

	// Auto-scroll chat

	useEffect(() => {
		const lastMessage = chatMessages[chatMessages.length - 1];
		const chatContainer = chatEndRef.current?.parentElement;

		if (!chatContainer) return;

		// Scroll only once when streaming starts
		if (streamingMessage && lastMessage?.role === "assistant") {
			if (!useEffect.scrollLocked) {
				useEffect.scrollLocked = true;
				chatContainer.scrollTo({
					top: chatContainer.scrollHeight - chatContainer.clientHeight - 20,
					behavior: "smooth",
				});
			}
		}

		// When streaming stops (AI done), gently scroll to bottom — but stop before footer
		if (!streamingMessage && lastMessage?.role === "assistant") {
			requestAnimationFrame(() => {
				chatContainer.scrollTo({
					top: chatContainer.scrollHeight - chatContainer.clientHeight - 60, // adjust offset if needed
					behavior: "smooth",
				});
			});
			useEffect.scrollLocked = false;
		}
	}, [chatMessages.length, streamingMessage]);

	// Initialize project context
	useEffect(() => {
		if (projectId && userId && socket) {
			socket.emit("project:set", { projectId });
			initializeProjectContext();
			loadContextSummary();
		}
	}, [projectId, userId, socket]);

	// Analyze current file when it changes
	// useEffect(() => {
	// 	if (code && selectedFile && projectId) {
	// 		analyzeCurrentFile();
	// 	}
	// }, [code, selectedFile]);

	const initializeProjectContext = async () => {
		try {
			await fetch(`${API_BASE_URL}/ai/context/init/${projectId}`, {
				method: "POST",
				credentials: "include",
			});
		} catch (error) {
			console.error("Error initializing context:", error);
		}
	};

	const loadContextSummary = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/ai/context/${projectId}?userDir=/workspace`,
				{
					method: "GET",
					credentials: "include",
				}
			);

			if (response.ok) {
				const data = await response.json();
				setContextSummary(data);
			}
		} catch (error) {
			console.error("Error loading context summary:", error);
		}
	};

	// const analyzeCurrentFile = async () => {
	// 	try {
	// 		const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
	// 			method: "POST",
	// 			headers: { "Content-Type": "application/json" },
	// 			credentials: "include",
	// 			body: JSON.stringify({
	// 				projectId,
	// 				code,
	// 				filePath: selectedFile,
	// 				userDir: "/workspace",
	// 			}),
	// 		});

	// 		if (response.ok) {
	// 			const data = await response.json();
	// 			if (data.success) {
	// 				setCodeAnalysis(data.analysis);
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error("Error analyzing code:", error);
	// 	}
	// };

	const handleAIQuery = async (taskType, specificQuery = null) => {
		const query = specificQuery || input;
		if (!query && taskType !== "review" && taskType !== "refactor") return;

		setLoading(true);
		setInput("");

		const userMessage = {
			role: "user",
			content: query || `${taskType} my code`,
			timestamp: new Date().toISOString(),
		};
		setChatMessages((prev) => [...prev, userMessage]);

		try {
			const response = await fetch(`${API_BASE_URL}/ai/query/stream`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					projectId,
					query: query || `Perform ${taskType} on this code`,
					currentFile: selectedFile,
					currentCode: code,
					taskType,
					userDir: "/workspace",
				}),
			});

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let fullResponse = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));

							if (data.type === "token") {
								fullResponse += data.content;
								setStreamingMessage(fullResponse);
							} else if (data.type === "done") {
								setChatMessages((prev) => [
									...prev,
									{
										role: "assistant",
										content: fullResponse,
										timestamp: new Date().toISOString(),
										taskType,
									},
								]);
								setStreamingMessage("");
								loadContextSummary();
							} else if (data.type === "error") {
								throw new Error(data.error);
							}
						} catch (e) {
							// Skip invalid JSON
						}
					}
				}
			}
		} catch (error) {
			console.error("AI query error:", error);
			setChatMessages((prev) => [
				...prev,
				{
					role: "error",
					content: `Error: ${error.message}`,
					timestamp: new Date().toISOString(),
				},
			]);
			setStreamingMessage("");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		handleAIQuery(activeTab, input);
	};

	const copyToClipboard = (text, index) => {
		navigator.clipboard.writeText(text);
		setCopiedIndex(index);
		setTimeout(() => setCopiedIndex(null), 2000);
	};

	const currentTab = tabs.find((t) => t.id === activeTab);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				backgroundColor: "#1e1e1e",
			}}
		>
			{/* Header with Context Info */}
			{contextSummary && (
				<div
					style={{
						padding: "8px 12px",
						backgroundColor: "#252526",
						borderBottom: "1px solid #2d2d30",
						fontSize: "11px",
						color: "#858585",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<Code size={12} />
							<span>{contextSummary.stats?.totalFiles || 0} files</span>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<TrendingUp size={12} />
							<span>{contextSummary.stats?.totalCodeLines || 0} lines</span>
						</div>
						{contextSummary.stats?.unresolvedErrors > 0 && (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									color: "#f48771",
								}}
							>
								<AlertCircle size={12} />
								<span>{contextSummary.stats.unresolvedErrors} errors</span>
							</div>
						)}
						{/* <button
							onClick={() => setShowAnalysis(!showAnalysis)}
							style={{
								marginLeft: "auto",
								fontSize: "10px",
								padding: "2px 8px",
								backgroundColor: showAnalysis ? "#0e639c" : "#3e3e42",
								color: "white",
								border: "none",
								borderRadius: "3px",
								cursor: "pointer",
							}}
							title="Toggle code analysis"
						>
							{showAnalysis ? "Hide Analysis" : "Show Analysis"}
						</button> */}
						<button
							onClick={() => {
								if (projectId && userId && socket) {
									socket.emit("project:set", { projectId });
									initializeProjectContext();
									loadContextSummary();
								}
							}}
							style={{
								marginLeft: "auto",
								fontSize: "10px",
								padding: "2px 8px",
								backgroundColor: "#0e639c",
								color: "white",
								border: "none",
								borderRadius: "3px",
								cursor: "pointer",
							}}
						>
							Refresh Context
						</button>
						{/* <button
							onClick={() => setShowAnalysis(!showAnalysis)}
							style={{
								marginLeft: "auto",
								fontSize: "10px",
								padding: "2px 8px",
								backgroundColor: showAnalysis ? "#0e639c" : "#3e3e42",
								color: "white",
								border: "none",
								borderRadius: "3px",
								cursor: "pointer",
							}}
							title="Toggle code analysis"
						>
							{showAnalysis ? "Hide Analysis" : "Show Analysis"}
						</button> */}
					</div>
				</div>
			)}

			{/* Code Analysis Panel */}
			{/* {showAnalysis && codeAnalysis && (
				<div
					style={{
						padding: "12px",
						backgroundColor: "#252526",
						borderBottom: "1px solid #2d2d30",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "8px",
						}}
					>
						<h3
							style={{
								fontSize: "11px",
								fontWeight: 600,
								color: "#cccccc",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								margin: 0,
								textTransform: "uppercase",
								letterSpacing: "0.5px",
							}}
						>
							<Sparkles size={12} />
							Code Analysis
						</h3>
						<button
							onClick={() => setShowAnalysis(false)}
							style={{
								color: "#858585",
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: "2px",
								display: "flex",
								alignItems: "center",
							}}
						>
							<X size={14} />
						</button>
					</div>
					<div
						style={{ fontSize: "11px", color: "#858585", lineHeight: "1.6" }}
					>
						<div style={{ marginBottom: "6px" }}>
							<span style={{ color: "#cccccc" }}>Complexity:</span>{" "}
							<span
								style={{
									color:
										codeAnalysis.complexityScore > 7 ? "#f48771" : "#4ec9b0",
								}}
							>
								{codeAnalysis.complexityScore}/10
							</span>
						</div>
						<div style={{ marginBottom: "6px" }}>
							<span style={{ color: "#cccccc" }}>Lines:</span>{" "}
							<span style={{ color: "#d4d4d4" }}>
								{codeAnalysis.linesOfCode || 0}
							</span>
						</div>
						{codeAnalysis.issues && codeAnalysis.issues.length > 0 && (
							<div style={{ color: "#ce9178" }}>
								⚠️ {codeAnalysis.issues.length} issue
								{codeAnalysis.issues.length > 1 ? "s" : ""} found
							</div>
						)}
					</div>
				</div>
			)} */}

			{/* Tab Navigation */}
			<div
				style={{
					display: "flex",
					gap: "2px",
					padding: "8px",
					backgroundColor: "#252526",
					borderBottom: "1px solid #2d2d30",
					overflowX: "auto",
				}}
			>
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "6px 12px",
								fontSize: "12px",
								backgroundColor:
									activeTab === tab.id ? "#0e639c" : "transparent",
								color: activeTab === tab.id ? "#ffffff" : "#858585",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								transition: "all 0.2s",
								whiteSpace: "nowrap",
							}}
							onMouseEnter={(e) => {
								if (!isActive)
									e.currentTarget.style.backgroundColor = "#2a2d2e";
							}}
							onMouseLeave={(e) => {
								if (!isActive)
									e.currentTarget.style.backgroundColor = "transparent";
							}}
							title={tab.desc}
						>
							<Icon size={14} />
							<span>{tab.label}</span>
						</button>
					);
				})}
			</div>

			{/* Current Tab Info */}
			<div
				style={{
					backgroundColor: "#252526",
					borderBottom: "1px solid #2d2d30",
					padding: "8px 12px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						fontSize: "11px",
						color: "#858585",
					}}
				>
					{currentTab && (
						<>
							<currentTab.icon size={12} style={{ color: currentTab.color }} />
							<span>{currentTab.desc}</span>
						</>
					)}
				</div>
			</div>

			{/* Messages Area */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "16px",
					display: "flex",
					flexDirection: "column",
					gap: "12px",
				}}
			>
				{chatMessages.length === 0 && !streamingMessage && (
					<div
						style={{
							textAlign: "center",
							color: "#858585",
							fontSize: "13px",
							marginTop: "40px",
						}}
					>
						<Bot size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
						<p>AI Assistant with Project Context</p>
						<p style={{ fontSize: "11px", marginTop: "8px" }}>
							I can see your entire project, errors, and changes
						</p>

						{/* Suggested Prompts */}
						{suggestedPrompts.length > 0 && (
							<div style={{ marginTop: "20px" }}>
								<p
									style={{
										fontSize: "11px",
										color: "#6b7280",
										marginBottom: "8px",
									}}
								>
									Suggested prompts:
								</p>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "6px",
										maxWidth: "320px",
										margin: "0 auto",
									}}
								>
									{suggestedPrompts.map((prompt, i) => (
										<button
											key={i}
											onClick={() => handleAIQuery(activeTab, prompt)}
											style={{
												textAlign: "left",
												padding: "8px 12px",
												backgroundColor: "#252526",
												border: "1px solid #2d2d30",
												borderRadius: "4px",
												fontSize: "12px",
												color: "#cccccc",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "6px",
												transition: "all 0.2s",
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.backgroundColor = "#2a2d2e")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.backgroundColor = "#252526")
											}
										>
											<Zap size={12} style={{ color: "#ce9178" }} />
											{prompt}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Messages */}
				{chatMessages.map((msg, idx) => (
					<div
						key={idx}
						style={{
							display: "flex",
							gap: "10px",
							alignItems: "flex-start",
						}}
					>
						{msg.role !== "user" && (
							<div
								style={{
									width: "24px",
									height: "24px",
									borderRadius: "50%",
									backgroundColor: msg.role === "error" ? "#f48771" : "#4caf50",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<Bot size={14} style={{ color: "white" }} />
							</div>
						)}

						<div style={{ flex: 1 }}>
							<div
								style={{
									fontSize: "12px",
									color: "#cccccc",
									marginBottom: "4px",
									fontWeight: 500,
								}}
							>
								{msg.role === "user"
									? "You"
									: msg.role === "error"
									? "Error"
									: "AI Assistant"}
								{msg.taskType && (
									<span
										style={{
											fontSize: "10px",
											color: "#858585",
											marginLeft: "8px",
											padding: "2px 6px",
											backgroundColor: "#2d2d30",
											borderRadius: "3px",
										}}
									>
										{msg.taskType}
									</span>
								)}
							</div>
							<div
								style={{
									fontSize: "13px",
									color: msg.role === "error" ? "#f48771" : "#d4d4d4",
									lineHeight: "1.6",
									whiteSpace: "pre-wrap",
									backgroundColor: "#252526",
									padding: "10px",
									borderRadius: "6px",
									position: "relative",
								}}
							>
								{msg.content}
								{msg.role === "assistant" && (
									<button
										onClick={() => copyToClipboard(msg.content, idx)}
										style={{
											position: "absolute",
											top: "8px",
											right: "8px",
											background: "none",
											border: "none",
											color: "#858585",
											cursor: "pointer",
											padding: "4px",
											display: "flex",
											alignItems: "center",
											transition: "color 0.2s",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.color = "#cccccc")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.color = "#858585")
										}
										title="Copy to clipboard"
									>
										{copiedIndex === idx ? (
											<Check size={14} style={{ color: "#4caf50" }} />
										) : (
											<Copy size={14} />
										)}
									</button>
								)}
							</div>
						</div>

						{msg.role === "user" && (
							<div
								style={{
									width: "24px",
									height: "24px",
									borderRadius: "50%",
									backgroundColor: "#0e639c",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<span
									style={{
										color: "white",
										fontSize: "12px",
										fontWeight: "bold",
									}}
								>
									{userId?.[0]?.toUpperCase() || "U"}
								</span>
							</div>
						)}
					</div>
				))}

				{/* Streaming Message */}
				{streamingMessage && (
					<div
						style={{
							display: "flex",
							gap: "10px",
							alignItems: "flex-start",
						}}
					>
						<div
							style={{
								width: "24px",
								height: "24px",
								borderRadius: "50%",
								backgroundColor: "#4caf50",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<Bot size={14} style={{ color: "white" }} />
						</div>
						<div style={{ flex: 1 }}>
							<div
								style={{
									fontSize: "12px",
									color: "#cccccc",
									marginBottom: "4px",
									fontWeight: 500,
								}}
							>
								AI Assistant
							</div>
							<div
								style={{
									fontSize: "13px",
									color: "#d4d4d4",
									lineHeight: "1.6",
									whiteSpace: "pre-wrap",
									backgroundColor: "#252526",
									padding: "10px",
									borderRadius: "6px",
								}}
							>
								{streamingMessage}
								<span
									style={{
										display: "inline-block",
										width: "8px",
										height: "14px",
										backgroundColor: "#4caf50",
										marginLeft: "2px",
										animation: "blink 1s infinite",
									}}
								/>
							</div>
						</div>
					</div>
				)}

				<div ref={chatEndRef} />
			</div>

			{/* Input Area */}
			<div
				style={{
					padding: "12px",
					backgroundColor: "#252526",
					borderTop: "1px solid #2d2d30",
					display: "flex",
					gap: "8px",
				}}
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
					placeholder={`Ask about ${currentTab?.label.toLowerCase()}...`}
					disabled={loading}
					style={{
						flex: 1,
						padding: "10px 12px",
						fontSize: "13px",
						backgroundColor: "#1e1e1e",
						color: "#d4d4d4",
						border: "1px solid #3e3e42",
						borderRadius: "4px",
						outline: "none",
					}}
					onFocus={(e) => (e.currentTarget.style.borderColor = "#007acc")}
					onBlur={(e) => (e.currentTarget.style.borderColor = "#3e3e42")}
				/>
				<button
					onClick={handleSubmit}
					disabled={
						loading || (!input && !["review", "refactor"].includes(activeTab))
					}
					style={{
						padding: "10px 16px",
						fontSize: "13px",
						backgroundColor:
							loading || (!input && !["review", "refactor"].includes(activeTab))
								? "#3e3e42"
								: "#0e639c",
						color: "#ffffff",
						border: "none",
						borderRadius: "4px",
						cursor:
							loading || (!input && !["review", "refactor"].includes(activeTab))
								? "not-allowed"
								: "pointer",
						display: "flex",
						alignItems: "center",
						gap: "6px",
						transition: "background 0.2s",
					}}
					onMouseEnter={(e) => {
						if (
							!loading &&
							(input || ["review", "refactor"].includes(activeTab))
						) {
							e.currentTarget.style.backgroundColor = "#1177bb";
						}
					}}
					onMouseLeave={(e) => {
						if (
							!loading &&
							(input || ["review", "refactor"].includes(activeTab))
						) {
							e.currentTarget.style.backgroundColor = "#0e639c";
						}
					}}
				>
					{loading ? (
						<>
							<Loader2
								size={14}
								style={{
									animation: "spin 1s linear infinite",
								}}
							/>
							<span>Thinking...</span>
						</>
					) : (
						<>
							<Send size={14} />
							<span>Send</span>
						</>
					)}
				</button>
			</div>

			<style>{`
				@keyframes blink {
					0%, 50% { opacity: 1; }
					51%, 100% { opacity: 0; }
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
};

export default AIAssistant;
