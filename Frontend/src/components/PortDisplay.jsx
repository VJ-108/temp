import { useState, useEffect } from "react";
import { ExternalLink, RefreshCw, Copy, Server } from "lucide-react";

const PortDisplay = ({ socket, userId }) => {
	const [portInfo, setPortInfo] = useState(null);
	const [isExpanded, setIsExpanded] = useState(true);
	const [copiedUrl, setCopiedUrl] = useState(null);

	useEffect(() => {
		if (!socket || !userId) return;

		// Listen for port updates from server
		const handlePortUpdate = (info) => {
			setPortInfo(info);
		};

		const handlePortError = (error) => {
			console.error("Port detection error:", error);
		};

		socket.on("ports:update", handlePortUpdate);
		socket.on("ports:error", handlePortError);

		// Request initial port check
		socket.emit("ports:check");

		return () => {
			socket.off("ports:update", handlePortUpdate);
			socket.off("ports:error", handlePortError);
		};
	}, [socket, userId]);

	const handleRefresh = () => {
		if (socket) {
			socket.emit("ports:check");
		}
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedUrl(text);
			setTimeout(() => setCopiedUrl(null), 2000);
		});
	};

	if (!portInfo) {
		return (
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
						gap: "8px",
						fontSize: "13px",
						color: "#858585",
					}}
				>
					<Server size={16} />
					<span>Detecting ports...</span>
				</div>
			</div>
		);
	}

	const { allocatedRange, services } = portInfo;
	const activeServices = services.filter((s) => s.external);

	return (
		<div
			style={{
				backgroundColor: "#252526",
				borderBottom: "1px solid #2d2d30",
			}}
		>
			{/* Header */}
			<div
				onClick={() => setIsExpanded(!isExpanded)}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 12px",
					cursor: "pointer",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.5px",
					color: "#cccccc",
					userSelect: "none",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<Server size={14} />
					<span>
						Ports {activeServices.length > 0 && `(${activeServices.length})`}
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleRefresh();
						}}
						style={{
							background: "none",
							border: "none",
							color: "#cccccc",
							cursor: "pointer",
							padding: "2px",
							display: "flex",
							alignItems: "center",
							opacity: 0.7,
						}}
						onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
						onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
						title="Refresh ports"
					>
						<RefreshCw size={14} />
					</button>
					<span style={{ fontSize: "12px", opacity: 0.7 }}>
						{isExpanded ? "▼" : "▶"}
					</span>
				</div>
			</div>

			{/* Body */}
			{isExpanded && (
				<div style={{ padding: "0 12px 12px 12px" }}>
					{activeServices.length === 0 ? (
						<div
							style={{
								padding: "16px 8px",
								textAlign: "center",
								fontSize: "12px",
								color: "#858585",
							}}
						>
							<div style={{ marginBottom: "6px" }}>No active services</div>
							<div style={{ fontSize: "11px", opacity: 0.7 }}>
								Start a dev server to see ports here
							</div>
						</div>
					) : (
						<div
							style={{ display: "flex", flexDirection: "column", gap: "6px" }}
						>
							{activeServices.map((service) => (
								<div
									key={service.internal}
									style={{
										backgroundColor: "#2d2d2d",
										border: "1px solid #3e3e3e",
										borderRadius: "3px",
										padding: "8px",
									}}
								>
									{/* Port info */}
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											marginBottom: "6px",
										}}
									>
										<span
											style={{
												fontSize: "11px",
												color: "#858585",
												fontWeight: 500,
											}}
										>
											Port {service.internal}
										</span>
										<div
											style={{
												width: "6px",
												height: "6px",
												borderRadius: "50%",
												backgroundColor: "#4caf50",
											}}
										/>
									</div>

									{/* URL */}
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "6px",
											marginBottom: "6px",
										}}
									>
										<a
											href={service.url}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												flex: 1,
												color: "#4fc3f7",
												textDecoration: "none",
												fontSize: "12px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.textDecoration = "underline")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.textDecoration = "none")
											}
										>
											{service.url}
										</a>
										<button
											onClick={() => copyToClipboard(service.url)}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												padding: "2px 4px",
												display: "flex",
												alignItems: "center",
												color:
													copiedUrl === service.url ? "#4caf50" : "#858585",
												transition: "color 0.2s",
											}}
											onMouseEnter={(e) =>
												copiedUrl !== service.url &&
												(e.currentTarget.style.color = "#cccccc")
											}
											onMouseLeave={(e) =>
												copiedUrl !== service.url &&
												(e.currentTarget.style.color = "#858585")
											}
											title={copiedUrl === service.url ? "Copied!" : "Copy URL"}
										>
											<Copy size={12} />
										</button>
									</div>

									{/* Actions */}
									<div
										style={{
											display: "flex",
											justifyContent: "flex-end",
										}}
									>
										<a
											href={service.url}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												padding: "4px 10px",
												fontSize: "11px",
												backgroundColor: "#0e639c",
												color: "white",
												textDecoration: "none",
												borderRadius: "2px",
												display: "flex",
												alignItems: "center",
												gap: "4px",
												fontWeight: 500,
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.backgroundColor = "#1177bb")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.backgroundColor = "#0e639c")
											}
										>
											<ExternalLink size={12} />
											Open
										</a>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Footer */}
					<div
						style={{
							marginTop: "8px",
							paddingTop: "8px",
							borderTop: "1px solid #2d2d30",
							fontSize: "11px",
							color: "#858585",
							textAlign: "center",
						}}
					>
						Allocated: {allocatedRange[0]}-{allocatedRange[1]}
					</div>
				</div>
			)}
		</div>
	);
};

export default PortDisplay;
