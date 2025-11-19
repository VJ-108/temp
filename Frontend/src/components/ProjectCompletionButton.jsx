import { useState } from "react";
import { Check, Trophy, Loader2, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "@/utils/constants";
import toast from "react-hot-toast";

const ProjectCompletionButton = ({ userProjectId, currentStatus, onStatusChange }) => {
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const isCompleted = currentStatus === "completed";

	const handleMarkComplete = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${API_BASE_URL}/user-projects/${userProjectId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						status: "completed",
						completedAt: new Date().toISOString(),
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				toast.success("🎉 Project completed!");
				setShowModal(false);
				if (onStatusChange) onStatusChange("completed");
			} else {
				toast.error("Failed to mark project as complete");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const handleMarkInProgress = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${API_BASE_URL}/user-projects/${userProjectId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						status: "in-progress",
						completedAt: null,
					}),
				}
			);

			if (response.ok) {
				toast.success("Project reopened");
				if (onStatusChange) onStatusChange("in-progress");
			} else {
				toast.error("Failed to update status");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	if (isCompleted) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					padding: "6px 10px",
					backgroundColor: "#1e3a1e",
					border: "1px solid #2d5a2d",
					borderRadius: "3px",
					fontSize: "12px",
					color: "#4caf50",
				}}
			>
				<Trophy size={14} />
				<span>Completed</span>
				<button
					onClick={handleMarkInProgress}
					disabled={loading}
					style={{
						marginLeft: "4px",
						padding: "2px 6px",
						fontSize: "11px",
						backgroundColor: "#3e3e42",
						color: "#cccccc",
						border: "none",
						borderRadius: "2px",
						cursor: loading ? "not-allowed" : "pointer",
						display: "flex",
						alignItems: "center",
						gap: "4px",
					}}
				>
					<RotateCcw size={10} />
					{loading ? "..." : "Reopen"}
				</button>
			</div>
		);
	}

	return (
		<>
			<button
				onClick={() => setShowModal(true)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					padding: "6px 10px",
					backgroundColor: "#0e639c",
					color: "white",
					border: "none",
					borderRadius: "3px",
					fontSize: "12px",
					cursor: "pointer",
					transition: "background 0.2s",
				}}
				onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1177bb")}
				onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0e639c")}
			>
				<Check size={14} />
				<span>Mark Complete</span>
			</button>

			{/* Modal */}
			{showModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.7)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
					onClick={() => setShowModal(false)}
				>
					<div
						style={{
							backgroundColor: "#252526",
							border: "1px solid #2d2d30",
							borderRadius: "6px",
							padding: "20px",
							maxWidth: "360px",
							width: "90%",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								marginBottom: "12px",
							}}
						>
							<div
								style={{
									width: "40px",
									height: "40px",
									borderRadius: "50%",
									backgroundColor: "#1e3a1e",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Trophy size={20} style={{ color: "#4caf50" }} />
							</div>
							<h3
								style={{
									fontSize: "16px",
									fontWeight: "bold",
									color: "#cccccc",
									margin: 0,
								}}
							>
								Complete Project?
							</h3>
						</div>

						<p
							style={{
								fontSize: "13px",
								color: "#858585",
								lineHeight: "1.5",
								marginBottom: "16px",
							}}
						>
							Mark this project as completed? This will update your dashboard.
						</p>

						<div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
							<button
								onClick={() => setShowModal(false)}
								disabled={loading}
								style={{
									padding: "6px 12px",
									fontSize: "12px",
									backgroundColor: "#3e3e42",
									color: "#cccccc",
									border: "none",
									borderRadius: "3px",
									cursor: loading ? "not-allowed" : "pointer",
								}}
							>
								Cancel
							</button>
							<button
								onClick={handleMarkComplete}
								disabled={loading}
								style={{
									padding: "6px 12px",
									fontSize: "12px",
									backgroundColor: "#0e639c",
									color: "white",
									border: "none",
									borderRadius: "3px",
									cursor: loading ? "not-allowed" : "pointer",
									display: "flex",
									alignItems: "center",
									gap: "4px",
								}}
							>
								{loading ? (
									<>
										<Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
										<span>...</span>
									</>
								) : (
									<>
										<Check size={12} />
										<span>Complete</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<style>{`
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
		</>
	);
};

export default ProjectCompletionButton;