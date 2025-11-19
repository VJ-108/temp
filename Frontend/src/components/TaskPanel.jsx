// Frontend/src/components/TaskPanel.jsx
import { useState, useEffect } from "react";
import {
	CheckCircle,
	Circle,
	Book,
	ExternalLink,
	ChevronDown,
	ChevronRight,
	Target,
} from "lucide-react";
import { API_BASE_URL } from "@/utils/constants";

const TaskPanel = ({ projectId, userId, onTaskSelect }) => {
	const [tasks, setTasks] = useState([]);
	const [completedTasks, setCompletedTasks] = useState([]);
	const [currentTaskId, setCurrentTaskId] = useState(1);
	const [selectedTask, setSelectedTask] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isExpanded, setIsExpanded] = useState(true); // Collapsible state

	useEffect(() => {
		if (projectId) {
			loadTasks();
		}
	}, [projectId]);

	const loadTasks = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/tasks/${projectId}`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				setTasks(data.tasks || []);
				setCompletedTasks(data.completedTasks || []);
				setCurrentTaskId(data.currentTask || 1);

				// Auto-select current task
				const currentTask = data.tasks.find((t) => t.id === data.currentTask);
				if (currentTask) {
					setSelectedTask(currentTask);
					onTaskSelect?.(currentTask);
				}
			}
		} catch (error) {
			console.error("Error loading tasks:", error);
		}
	};

	const handleTaskComplete = async (taskId) => {
		setLoading(true);
		try {
			const response = await fetch(
				`${API_BASE_URL}/tasks/${projectId}/complete/${taskId}`,
				{
					method: "POST",
					credentials: "include",
				}
			);

			if (response.ok) {
				const data = await response.json();
				setCompletedTasks(data.completedTasks);
				setCurrentTaskId(data.currentTask);

				// Move to next task
				const nextTask = tasks.find((t) => t.id === data.currentTask);
				if (nextTask) {
					setSelectedTask(nextTask);
					onTaskSelect?.(nextTask);
				}
			}
		} catch (error) {
			console.error("Error completing task:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleTaskClick = (task) => {
		setSelectedTask(task);
		onTaskSelect?.(task);
	};

	const isTaskCompleted = (taskId) => completedTasks.includes(taskId);
	const isTaskCurrent = (taskId) => taskId === currentTaskId;

	if (tasks.length === 0) return null;

	return (
		<div
			style={{
				height: "100%",
				backgroundColor: "#252526",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			{/* Header - Collapsible */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				style={{
					padding: "8px 12px",
					borderBottom: "1px solid #2d2d30",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.5px",
					color: "#cccccc",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "8px",
					backgroundColor: "transparent",
					border: "none",
					borderBottom: "1px solid #2d2d30",
					cursor: "pointer",
					width: "100%",
					textAlign: "left",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<Target size={14} />
					<span>Project Tasks</span>
					<span style={{ fontSize: "10px", color: "#858585" }}>
						({completedTasks.length}/{tasks.length})
					</span>
				</div>
				{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
			</button>

			{/* Task List - Collapsible */}
			{isExpanded && (
				<div style={{ flex: 1, overflowY: "auto" }}>
					<div style={{ padding: "8px 0" }}>
						{tasks.map((task) => {
							const isCompleted = isTaskCompleted(task.id);
							const isCurrent = isTaskCurrent(task.id);
							const isSelected = selectedTask?.id === task.id;

							return (
								<div
									key={task.id}
									onClick={() => handleTaskClick(task)}
									style={{
										padding: "10px 12px",
										cursor: "pointer",
										backgroundColor: isSelected ? "#37373d" : "transparent",
										borderLeft: isCurrent
											? "3px solid #0e639c"
											: "3px solid transparent",
										transition: "all 0.2s",
									}}
									onMouseEnter={(e) => {
										if (!isSelected)
											e.currentTarget.style.backgroundColor = "#2a2d2e";
									}}
									onMouseLeave={(e) => {
										if (!isSelected)
											e.currentTarget.style.backgroundColor = "transparent";
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "flex-start",
											gap: "8px",
										}}
									>
										{isCompleted ? (
											<CheckCircle size={16} style={{ color: "#4caf50" }} />
										) : (
											<Circle size={16} style={{ color: "#858585" }} />
										)}
										<div style={{ flex: 1 }}>
											<div
												style={{
													fontSize: "13px",
													color: isCompleted ? "#4caf50" : "#cccccc",
													fontWeight: isCurrent ? 600 : 400,
													marginBottom: "4px",
												}}
											>
												{task.title}
											</div>
											<div
												style={{
													fontSize: "11px",
													color: "#858585",
													marginBottom: "6px",
												}}
											>
												{task.description}
											</div>
											{isCurrent && !isCompleted && (
												<div
													style={{
														fontSize: "10px",
														color: "#0e639c",
														padding: "2px 6px",
														backgroundColor: "#0e639c20",
														borderRadius: "3px",
														display: "inline-block",
													}}
												>
													Current Task
												</div>
											)}
										</div>
									</div>

									{/* Task Actions (shown when selected) */}
									{isSelected && (
										<div
											style={{
												marginTop: "8px",
												paddingTop: "8px",
												borderTop: "1px solid #2d2d30",
											}}
										>
											{/* Concept Label */}
											<div
												style={{
													fontSize: "10px",
													color: "#858585",
													marginBottom: "6px",
												}}
											>
												📚 Learning:{" "}
												<span style={{ color: "#ce9178" }}>{task.concept}</span>
											</div>

											{!isCompleted && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleTaskComplete(task.id);
													}}
													disabled={loading}
													style={{
														width: "100%",
														padding: "6px 12px",
														fontSize: "12px",
														backgroundColor: "#0e639c",
														color: "white",
														border: "none",
														borderRadius: "3px",
														cursor: loading ? "not-allowed" : "pointer",
														marginBottom: "6px",
													}}
												>
													{loading ? "Marking..." : "Mark Complete"}
												</button>
											)}

											{task.resources && task.resources.length > 0 && (
												<div style={{ fontSize: "11px", color: "#858585" }}>
													<div
														style={{
															marginBottom: "4px",
															display: "flex",
															alignItems: "center",
															gap: "4px",
														}}
													>
														<Book size={12} />
														<span>Resources:</span>
													</div>
													{task.resources.map((resource, idx) => (
														<a
															key={idx}
															href={resource.url}
															target="_blank"
															rel="noopener noreferrer"
															style={{
																display: "flex",
																alignItems: "center",
																gap: "4px",
																color: "#4fc3f7",
																textDecoration: "none",
																padding: "4px 0",
																fontSize: "11px",
															}}
															onMouseEnter={(e) =>
																(e.currentTarget.style.textDecoration =
																	"underline")
															}
															onMouseLeave={(e) =>
																(e.currentTarget.style.textDecoration = "none")
															}
														>
															<ExternalLink size={10} />
															<span>{resource.title}</span>
														</a>
													))}
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Progress Footer */}
			{isExpanded && (
				<div
					style={{
						padding: "8px 12px",
						borderTop: "1px solid #2d2d30",
						backgroundColor: "#1e1e1e",
						fontSize: "11px",
						color: "#858585",
					}}
				>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span>Progress:</span>
						<span style={{ color: "#4caf50" }}>
							{completedTasks.length}/{tasks.length} tasks
						</span>
					</div>
					<div
						style={{
							marginTop: "6px",
							height: "4px",
							backgroundColor: "#2d2d30",
							borderRadius: "2px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${(completedTasks.length / tasks.length) * 100}%`,
								backgroundColor: "#4caf50",
								transition: "width 0.3s",
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default TaskPanel;
