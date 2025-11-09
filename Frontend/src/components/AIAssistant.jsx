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
	X,
	Copy,
	Check,
} from "lucide-react";

const AI_API_URL = "http://localhost:8000";

const AIAssistant = ({ userId, selectedFile, code }) => {
	const [activeTab, setActiveTab] = useState("chat");
	const [chatMessages, setChatMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [aiHealth, setAiHealth] = useState(null);
	const [streamingMessage, setStreamingMessage] = useState("");
	const [copiedIndex, setCopiedIndex] = useState(null);

	const chatEndRef = useRef(null);
	const abortControllerRef = useRef(null);

	// Check AI health on mount
	useEffect(() => {
		checkHealth();
	}, []);

	// Auto-scroll chat
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages, streamingMessage]);

	const checkHealth = async () => {
		try {
			const response = await fetch(`${AI_API_URL}/health`, {
				method: "GET",
			});
			const data = await response.json();
			setAiHealth(data);
		} catch (error) {
			console.error("AI health check failed:", error);
			setAiHealth({ available: false });
		}
	};

	const handleStreamingRequest = async (endpoint, body) => {
		setLoading(true);
		setStreamingMessage("");

		try {
			// Add user message
			const userMessage = {
				role: "user",
				content: body.question || body.message || body.problem || body.concept,
				timestamp: new Date().toISOString(),
			};
			setChatMessages((prev) => [...prev, userMessage]);

			abortControllerRef.current = new AbortController();

			const response = await fetch(`${AI_API_URL}/${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...body, userId }),
				signal: abortControllerRef.current.signal,
			});

			if (!response.ok) {
				throw new Error("AI request failed");
			}

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

							if (data.token) {
								fullResponse += data.token;
								setStreamingMessage(fullResponse);
							}

							if (data.done) {
								setChatMessages((prev) => [
									...prev,
									{
										role: "assistant",
										content: fullResponse,
										timestamp: new Date().toISOString(),
									},
								]);
								setStreamingMessage("");
							}

							if (data.error) {
								throw new Error(data.error);
							}
						} catch (e) {
							// Skip invalid JSON
						}
					}
				}
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error("Streaming error:", error);
				setChatMessages((prev) => [
					...prev,
					{
						role: "error",
						content: `Error: ${error.message}`,
						timestamp: new Date().toISOString(),
					},
				]);
			}
		} finally {
			setLoading(false);
			setStreamingMessage("");
		}
	};

	const handleNonStreamingRequest = async (endpoint, body) => {
		setLoading(true);

		try {
			const userMessage = {
				role: "user",
				content: body.question || body.problem || body.concept,
				timestamp: new Date().toISOString(),
			};
			setChatMessages((prev) => [...prev, userMessage]);

			const response = await fetch(`${AI_API_URL}/${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...body, userId }),
			});

			if (!response.ok) {
				throw new Error("AI request failed");
			}

			const data = await response.json();
			const content =
				data.answer ||
				data.review ||
				data.hint ||
				data.test_cases ||
				data.explanation ||
				data.guidance ||
				data.response;

			setChatMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content,
					timestamp: new Date().toISOString(),
					metadata: data,
				},
			]);
		} catch (error) {
			console.error("Request error:", error);
			setChatMessages((prev) => [
				...prev,
				{
					role: "error",
					content: `Error: ${error.message}`,
					timestamp: new Date().toISOString(),
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	// Tab handlers
	const handleDebug = () => {
		if (!code) {
			alert("Please select a file with code first");
			return;
		}
		handleStreamingRequest("debug-stream", {
			question: input || "Find and explain any bugs in this code",
			code,
		});
		setInput("");
	};

	const handleReview = () => {
		if (!code) {
			alert("Please select a file with code first");
			return;
		}
		handleStreamingRequest("review-stream", {
			code,
			context: selectedFile?.split(".").pop() || "",
		});
	};

	const handleHint = () => {
		if (!input) return;
		handleNonStreamingRequest("hint", {
			problem: input,
			currentCode: code || "",
		});
		setInput("");
	};

	const handleTests = () => {
		if (!code) {
			alert("Please select a file with code first");
			return;
		}
		handleNonStreamingRequest("tests", {
			code,
			functionality: input || "",
			framework: "jest",
		});
		setInput("");
	};

	const handleExplain = () => {
		if (!input) return;
		handleStreamingRequest("explain-stream", {
			concept: input,
			level: "intermediate",
		});
		setInput("");
	};

	const handleChat = () => {
		if (!input) return;
		handleStreamingRequest("chat-stream", {
			message: input,
		});
		setInput("");
	};

	const copyToClipboard = (text, index) => {
		navigator.clipboard.writeText(text);
		setCopiedIndex(index);
		setTimeout(() => setCopiedIndex(null), 2000);
	};

	const tabs = [
		{ id: "chat", label: "Chat", icon: MessageCircle, action: handleChat },
		{ id: "debug", label: "Debug", icon: Bug, action: handleDebug },
		{ id: "review", label: "Review", icon: FileSearch, action: handleReview },
		{ id: "hint", label: "Hint", icon: Lightbulb, action: handleHint },
		{ id: "test", label: "Tests", icon: TestTube, action: handleTests },
		{ id: "explain", label: "Explain", icon: BookOpen, action: handleExplain },
	];

	const handleSubmit = (e) => {
		e.preventDefault();
		const currentTab = tabs.find((t) => t.id === activeTab);
		if (currentTab?.action) {
			currentTab.action();
		}
	};

	if (aiHealth?.status !== "healthy") {
		return (
			<div
				style={{
					padding: "20px",
					textAlign: "center",
					color: "#858585",
					fontSize: "13px",
				}}
			>
				<Bot size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
				<p>AI Assistant Unavailable</p>
				<p style={{ fontSize: "11px", marginTop: "8px" }}>
					Make sure the AI API is running on port 8000
				</p>
			</div>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				backgroundColor: "#1e1e1e",
			}}
		>
			{/* Tabs */}
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
						>
							<Icon size={14} />
							<span>{tab.label}</span>
						</button>
					);
				})}
			</div>

			{/* Messages */}
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
						<p>AI Assistant Ready</p>
						<p style={{ fontSize: "11px", marginTop: "8px" }}>
							Select a tab and ask a question
						</p>
					</div>
				)}

				{chatMessages.map((msg, idx) => (
					<div
						key={idx}
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
								backgroundColor:
									msg.role === "user"
										? "#0e639c"
										: msg.role === "error"
										? "#f48771"
										: "#4caf50",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							{msg.role === "user" ? (
								<span style={{ fontSize: "12px" }}>👤</span>
							) : (
								<Bot size={14} />
							)}
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
								{msg.role === "user"
									? "You"
									: msg.role === "error"
									? "Error"
									: "AI Assistant"}
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
							{msg.metadata && (
								<div
									style={{
										fontSize: "11px",
										color: "#858585",
										marginTop: "4px",
									}}
								>
									⏱️ {msg.metadata.time_seconds}s
								</div>
							)}
						</div>
					</div>
				))}

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
							<Bot size={14} />
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

			{/* Input */}
			<form
				onSubmit={handleSubmit}
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
					placeholder={
						activeTab === "debug"
							? "Describe the issue or leave empty for automatic analysis"
							: activeTab === "review"
							? "Click 'Review' to analyze current code"
							: activeTab === "hint"
							? "What are you stuck on?"
							: activeTab === "test"
							? "Describe functionality (optional)"
							: activeTab === "explain"
							? "What concept do you want to learn?"
							: "Ask me anything..."
					}
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
				/>
				<button
					type="submit"
					disabled={loading || (activeTab !== "review" && !input && activeTab !== "debug")}
					style={{
						padding: "10px 16px",
						fontSize: "13px",
						backgroundColor:
							loading || (!input && activeTab !== "review" && activeTab !== "debug")
								? "#3e3e42"
								: "#0e639c",
						color: "#ffffff",
						border: "none",
						borderRadius: "4px",
						cursor:
							loading || (!input && activeTab !== "review" && activeTab !== "debug")
								? "not-allowed"
								: "pointer",
						display: "flex",
						alignItems: "center",
						gap: "6px",
						transition: "background 0.2s",
					}}
				>
					{loading ? (
						<>
							<Loader2 size={14} className="spin" />
							<span>Thinking...</span>
						</>
					) : (
						<>
							<Send size={14} />
							<span>Send</span>
						</>
					)}
				</button>
			</form>

			<style>{`
				@keyframes blink {
					0%, 50% { opacity: 1; }
					51%, 100% { opacity: 0; }
				}
				.spin {
					animation: spin 1s linear infinite;
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