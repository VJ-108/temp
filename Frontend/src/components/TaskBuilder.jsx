import { PencilIcon, TrashIcon, X } from "lucide-react";
import { useState } from "react";

// Task Builder Component
const TaskBuilder = ({
	tasks,
	setTasks,
	learningObjectives,
	setLearningObjectives,
}) => {
	const [showTaskForm, setShowTaskForm] = useState(false);
	const [editingTaskIndex, setEditingTaskIndex] = useState(null);
	const [currentTask, setCurrentTask] = useState({
		id: 1,
		title: "",
		description: "",
		concept: "",
		hints: ["", "", ""],
		resources: [{ title: "", url: "" }],
	});

	const handleAddTask = () => {
		if (
			!currentTask.title ||
			!currentTask.description ||
			!currentTask.concept
		) {
			alert("Please fill in title, description, and concept");
			return;
		}

		if (editingTaskIndex !== null) {
			// Update existing task
			const updatedTasks = [...tasks];
			updatedTasks[editingTaskIndex] = {
				...currentTask,
				id: editingTaskIndex + 1,
			};
			setTasks(updatedTasks);
			setEditingTaskIndex(null);
		} else {
			// Add new task
			setTasks([...tasks, { ...currentTask, id: tasks.length + 1 }]);
		}

		// Reset form
		setCurrentTask({
			id: tasks.length + 2,
			title: "",
			description: "",
			concept: "",
			hints: ["", "", ""],
			resources: [{ title: "", url: "" }],
		});
		setShowTaskForm(false);
	};

	const handleEditTask = (index) => {
		setCurrentTask(tasks[index]);
		setEditingTaskIndex(index);
		setShowTaskForm(true);
	};

	const handleDeleteTask = (index) => {
		setTasks(tasks.filter((_, i) => i !== index));
	};

	const handleHintChange = (index, value) => {
		const newHints = [...currentTask.hints];
		newHints[index] = value;
		setCurrentTask({ ...currentTask, hints: newHints });
	};

	const handleResourceChange = (index, field, value) => {
		const newResources = [...currentTask.resources];
		newResources[index][field] = value;
		setCurrentTask({ ...currentTask, resources: newResources });
	};

	const addResource = () => {
		setCurrentTask({
			...currentTask,
			resources: [...currentTask.resources, { title: "", url: "" }],
		});
	};

	const removeResource = (index) => {
		setCurrentTask({
			...currentTask,
			resources: currentTask.resources.filter((_, i) => i !== index),
		});
	};

	return (
		<div className="space-y-4">
			{/* Learning Objectives */}
			<div>
				<label className="block text-sm font-semibold text-gray-300 mb-2">
					Learning Objectives (comma separated)
				</label>
				<input
					type="text"
					value={learningObjectives.join(", ")}
					onChange={(e) =>
						setLearningObjectives(
							e.target.value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean)
						)
					}
					placeholder="DOM Manipulation, Event Handling, API Integration"
					className="input input-bordered w-full bg-transparent border-[#374151] focus:border-[#06B6D4] text-gray-100"
				/>
			</div>

			{/* Task List */}
			<div>
				<div className="flex justify-between items-center mb-2">
					<label className="block text-sm font-semibold text-gray-300">
						Tasks ({tasks.length})
					</label>
					<button
						type="button"
						onClick={() => setShowTaskForm(!showTaskForm)}
						className="btn btn-sm bg-cyan-600 hover:bg-cyan-700 border-none text-white"
					>
						{showTaskForm ? "Cancel" : "+ Add Task"}
					</button>
				</div>

				{/* Existing Tasks */}
				<div className="space-y-2 mb-4">
					{tasks.map((task, index) => (
						<div
							key={index}
							className="bg-gray-800 p-3 rounded-lg flex justify-between items-start"
						>
							<div className="flex-1">
								<div className="font-semibold text-white">
									{index + 1}. {task.title}
								</div>
								<div className="text-sm text-gray-400 mt-1">
									Concept: {task.concept}
								</div>
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => handleEditTask(index)}
									className="text-blue-400 hover:text-blue-300"
								>
									<PencilIcon size={16} />
								</button>
								<button
									type="button"
									onClick={() => handleDeleteTask(index)}
									className="text-red-400 hover:text-red-300"
								>
									<TrashIcon size={16} />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Task Form */}
				{showTaskForm && (
					<div className="bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-700">
						<h4 className="font-semibold text-white">
							{editingTaskIndex !== null ? "Edit Task" : "New Task"}
						</h4>

						{/* Title */}
						<input
							type="text"
							placeholder="Task Title"
							value={currentTask.title}
							onChange={(e) =>
								setCurrentTask({ ...currentTask, title: e.target.value })
							}
							className="input input-bordered w-full bg-gray-900 border-gray-700 text-white"
						/>

						{/* Description */}
						<textarea
							placeholder="Task Description"
							value={currentTask.description}
							onChange={(e) =>
								setCurrentTask({ ...currentTask, description: e.target.value })
							}
							className="textarea textarea-bordered w-full bg-gray-900 border-gray-700 text-white"
							rows="2"
						/>

						{/* Concept */}
						<input
							type="text"
							placeholder="Concept (e.g., DOM Manipulation)"
							value={currentTask.concept}
							onChange={(e) =>
								setCurrentTask({ ...currentTask, concept: e.target.value })
							}
							className="input input-bordered w-full bg-gray-900 border-gray-700 text-white"
						/>

						{/* Hints */}
						<div>
							<label className="text-sm text-gray-400 mb-1 block">
								Hints (3 levels)
							</label>
							{[0, 1, 2].map((index) => (
								<input
									key={index}
									type="text"
									placeholder={`Hint ${index + 1}`}
									value={currentTask.hints[index]}
									onChange={(e) => handleHintChange(index, e.target.value)}
									className="input input-bordered w-full bg-gray-900 border-gray-700 text-white mb-2"
								/>
							))}
						</div>

						{/* Resources */}
						<div>
							<div className="flex justify-between items-center mb-1">
								<label className="text-sm text-gray-400">Resources</label>
								<button
									type="button"
									onClick={addResource}
									className="text-xs text-cyan-400 hover:text-cyan-300"
								>
									+ Add Resource
								</button>
							</div>
							{currentTask.resources.map((resource, index) => (
								<div key={index} className="flex gap-2 mb-2">
									<input
										type="text"
										placeholder="Title (e.g., MDN: Arrays)"
										value={resource.title}
										onChange={(e) =>
											handleResourceChange(index, "title", e.target.value)
										}
										className="input input-bordered flex-1 bg-gray-900 border-gray-700 text-white"
									/>
									<input
										type="url"
										placeholder="URL"
										value={resource.url}
										onChange={(e) =>
											handleResourceChange(index, "url", e.target.value)
										}
										className="input input-bordered flex-1 bg-gray-900 border-gray-700 text-white"
									/>
									{currentTask.resources.length > 1 && (
										<button
											type="button"
											onClick={() => removeResource(index)}
											className="btn btn-sm btn-error"
										>
											<X size={16} />
										</button>
									)}
								</div>
							))}
						</div>

						{/* Action Buttons */}
						<div className="flex gap-2 justify-end">
							<button
								type="button"
								onClick={() => {
									setShowTaskForm(false);
									setEditingTaskIndex(null);
									setCurrentTask({
										id: tasks.length + 1,
										title: "",
										description: "",
										concept: "",
										hints: ["", "", ""],
										resources: [{ title: "", url: "" }],
									});
								}}
								className="btn btn-sm bg-gray-700 hover:bg-gray-600 border-none text-white"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleAddTask}
								className="btn btn-sm bg-green-600 hover:bg-green-700 border-none text-white"
							>
								{editingTaskIndex !== null ? "Update" : "Add"} Task
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default TaskBuilder;
