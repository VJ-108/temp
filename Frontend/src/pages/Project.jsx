import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/constants";
import { PencilIcon, TrashIcon, CheckIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TaskBuilder from "@/components/TaskBuilder";

const Project = () => {
	const [filter, setFilter] = useState("easy");
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	const [projectToDelete, setProjectToDelete] = useState(null);
	const [showConfirm, setShowConfirm] = useState(false);

	const [editingProject, setEditingProject] = useState(null);
	const [editedData, setEditedData] = useState({});
	const [editProjectTasks, setEditProjectTasks] = useState([]);
	const [editProjectObjectives, setEditProjectObjectives] = useState([]);

	const [newProjectTasks, setNewProjectTasks] = useState([]);
	const [newProjectObjectives, setNewProjectObjectives] = useState([]);

	const { user } = useAuth();
	const Navigate = useNavigate();

	// ---------------------- FETCH PROJECTS ----------------------
	const fetchProjects = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/projects`, {
				method: "GET",
				credentials: "include",
			});

			if (!res.ok) throw new Error("Failed to fetch projects");

			const data = await res.json();
			setProjects(data);
		} catch (err) {
			console.error(err);
			setProjects([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	const filteredProjects = projects.filter(
		(p) => p.difficulty.toLowerCase() === filter
	);

	// ---------------------- DELETE HANDLING ----------------------
	const handleDeleteClick = (id) => {
		setProjectToDelete(id);
		setShowConfirm(true);
	};

	const confirmDelete = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/projects/${projectToDelete}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!res.ok) throw new Error("Failed to delete project");

			setProjects(projects.filter((p) => p._id !== projectToDelete));
			setShowConfirm(false);
			setProjectToDelete(null);
		} catch (err) {
			console.error("Error deleting project:", err);
		}
	};

	// ---------------------- EDIT HANDLING ----------------------
	const handleEditToggle = (proj) => {
		if (editingProject === proj._id) {
			setEditingProject(null);
		} else {
			setEditingProject(proj._id);
			setEditedData(proj);

			setEditProjectObjectives(proj.learningObjectives || []);
			setEditProjectTasks(proj.tasks || []);
		}
	};

	const handleSave = async (id) => {
		try {
			const finalData = {
				...editedData,
				learningObjectives: editProjectObjectives,
				tasks: editProjectTasks,
			};

			const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(finalData),
			});

			if (!res.ok) throw new Error("Failed to update project");

			const updated = await res.json();

			setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));

			setEditingProject(null);
		} catch (err) {
			console.error("Error updating project:", err);
		}
	};

	const handleChange = (e, key) => {
		setEditedData({ ...editedData, [key]: e.target.value });
	};

	// ---------------------- CREATE PROJECT ----------------------
	const handleCreateProject = async (e) => {
		e.preventDefault();

		const form = new FormData(e.target);

		const newProject = {
			title: form.get("title"),
			description: form.get("description"),
			techStack: form
				.get("techStack")
				.split(",")
				.map((t) => t.trim()),
			difficulty: form.get("difficulty"),
			templateRepo: form.get("templateRepo") || "",
			learningObjectives: newProjectObjectives,
			tasks: newProjectTasks,
		};

		try {
			const res = await fetch(`${API_BASE_URL}/projects`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(newProject),
			});

			if (!res.ok) throw new Error("Failed to create project");

			const created = await res.json();
			setProjects((prev) => [...prev, created]);

			setNewProjectTasks([]);
			setNewProjectObjectives([]);

			document.getElementById("addProjectModal").close();
		} catch (err) {
			console.error("Error creating project:", err);
		}
	};

	// ---------------------- SKELETON LOADER ----------------------
	const SkeletonCard = () => (
		<div className="bg-[#111827] border border-[#374151] rounded-2xl shadow-lg p-6 animate-pulse">
			<div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
			<div className="space-y-3 mb-5">
				<div className="h-4 bg-gray-700 rounded w-full"></div>
				<div className="h-4 bg-gray-700 rounded w-5/6"></div>
				<div className="h-4 bg-gray-700 rounded w-2/3"></div>
			</div>
			<div className="h-6 bg-gray-700 rounded w-20"></div>
		</div>
	);

	// ============================================================
	// ======================= RETURN ==============================
	// ============================================================

	return (
		<div className="p-8 py-24 min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#111827] to-[#1f2937] text-[#F9FAFB]">
			{/* ---------------- FILTER + ADD BUTTON ---------------- */}
			<div
				className={`flex ${
					user?.role === "admin" ? "justify-between" : "justify-center"
				} mb-10`}
			>
				{/* Difficulty Filter */}
				<div className="flex gap-6">
					{["easy", "medium", "hard"].map((level) => (
						<button
							key={level}
							onClick={() => setFilter(level)}
							className={`px-6 py-2 rounded-full font-semibold transition-all shadow-md
                ${
									filter === level
										? level === "easy"
											? "bg-green-500 text-black"
											: level === "medium"
											? "bg-yellow-400 text-black"
											: "bg-red-500 text-white"
										: "bg-gray-800 text-gray-300 hover:bg-gray-600"
								}`}
						>
							{level.charAt(0).toUpperCase() + level.slice(1)}
						</button>
					))}
				</div>

				{/* ADD PROJECT BUTTON */}
				{user?.role === "admin" && (
					<button
						className="px-5 py-2 bg-[#06B6D4] hover:bg-[#9333EA] rounded-full font-semibold shadow-md"
						onClick={() =>
							document.getElementById("addProjectModal").showModal()
						}
					>
						+ Add Project
					</button>
				)}
			</div>

			{/* ---------------- ADD PROJECT MODAL ---------------- */}
			{user?.role === "admin" && (
				<dialog id="addProjectModal" className="modal">
					<div className="modal-box bg-[#111827] text-white border border-[#374151]">
						<h3 className="text-2xl font-bold text-[#06B6D4] mb-4">
							Create Project
						</h3>

						<form method="dialog" onSubmit={handleCreateProject}>
							<label className="font-semibold">Title</label>
							<input
								name="title"
								className="input input-bordered w-full bg-transparent mb-4"
								required
							/>

							<label className="font-semibold">Description</label>
							<textarea
								name="description"
								className="textarea textarea-bordered w-full bg-transparent mb-4"
								required
							></textarea>

							<label className="font-semibold">Tech Stack</label>
							<input
								name="techStack"
								placeholder="React, Node.js"
								className="input input-bordered w-full bg-transparent mb-4"
								required
							/>

							<label className="font-semibold">Difficulty</label>
							<select
								name="difficulty"
								className="select select-bordered w-full bg-transparent mb-4"
							>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>

							<label className="font-semibold">Template Repo (optional)</label>
							<input
								name="templateRepo"
								className="input input-bordered w-full bg-transparent mb-4"
							/>

							{/* Task Builder */}
							<TaskBuilder
								tasks={newProjectTasks}
								setTasks={setNewProjectTasks}
								learningObjectives={newProjectObjectives}
								setLearningObjectives={setNewProjectObjectives}
							/>

							<div className="modal-action">
								<button className="btn bg-[#06B6D4]">Create</button>
								<button
									type="button"
									onClick={() =>
										document.getElementById("addProjectModal").close()
									}
									className="btn bg-gray-600"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</dialog>
			)}

			{/* ---------------- PROJECT GRID ---------------- */}
			<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{loading
					? Array(6)
							.fill(0)
							.map((_, i) => <SkeletonCard key={i} />)
					: filteredProjects.map((proj) => {
							const isEditing = editingProject === proj._id;

							return (
								<div
									key={proj._id}
									className="bg-[#111827] border border-[#374151] rounded-2xl shadow-lg p-6 hover:shadow-cyan-500/40"
								>
									{/* Title + Admin Controls */}
									<div className="flex justify-between mb-3">
										{isEditing ? (
											<input
												value={editedData.title}
												onChange={(e) => handleChange(e, "title")}
												className="input input-sm bg-transparent border-[#374151] text-cyan-400"
											/>
										) : (
											<Link
												to={`/editor/${proj._id}/${proj.title.replace(
													/\s+/g,
													"-"
												)}`}
												className="text-2xl font-bold text-cyan-400 hover:text-cyan-300"
											>
												{proj.title}
											</Link>
										)}

										{user?.role === "admin" && (
											<div className="flex gap-2">
												{isEditing ? (
													<button
														onClick={() => handleSave(proj._id)}
														className="p-2 rounded-full hover:bg-green-500/20"
													>
														<CheckIcon className="text-green-400" size={20} />
													</button>
												) : (
													<button
														onClick={() => handleEditToggle(proj)}
														className="p-2 rounded-full hover:bg-purple-500/20"
													>
														<PencilIcon className="text-purple-400" size={20} />
													</button>
												)}

												<button
													onClick={() => handleDeleteClick(proj._id)}
													className="p-2 rounded-full hover:bg-red-500/20"
												>
													<TrashIcon className="text-red-400" size={20} />
												</button>
											</div>
										)}
									</div>

									{/* Delete Confirmation */}
									{showConfirm && (
										<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
											<div className="bg-[#1f2937] p-8 rounded-xl border border-gray-600">
												<h2 className="text-xl mb-4 font-semibold">
													Confirm Delete
												</h2>
												<p className="text-gray-300 mb-4">
													This action cannot be undone.
												</p>
												<div className="flex gap-4">
													<button
														onClick={confirmDelete}
														className="px-6 py-2 bg-red-500 text-white rounded"
													>
														Delete
													</button>
													<button
														onClick={() => setShowConfirm(false)}
														className="px-6 py-2 bg-gray-600 text-white rounded"
													>
														Cancel
													</button>
												</div>
											</div>
										</div>
									)}

									{/* Description */}
									{isEditing ? (
										<textarea
											value={editedData.description}
											onChange={(e) => handleChange(e, "description")}
											className="textarea textarea-bordered w-full bg-transparent border-[#374151] text-gray-300 mb-4"
										/>
									) : (
										<p
											className="text-gray-300 mb-6 cursor-pointer line-clamp-3"
											onClick={() =>
												user?.role === "student" &&
												Navigate(`/editor/${proj.title.replace(/\s+/g, "-")}`)
											}
										>
											{proj.description}
										</p>
									)}

									{/* Difficulty */}
									{isEditing ? (
										<select
											value={editedData.difficulty}
											onChange={(e) => handleChange(e, "difficulty")}
											className="select select-sm bg-transparent border-[#374151] text-white"
										>
											<option value="easy">Easy</option>
											<option value="medium">Medium</option>
											<option value="hard">Hard</option>
										</select>
									) : (
										<span
											className={`px-4 py-1 text-sm rounded-full font-semibold ${
												proj.difficulty === "easy"
													? "bg-green-600/30 text-green-400"
													: proj.difficulty === "medium"
													? "bg-yellow-600/30 text-yellow-400"
													: "bg-red-600/30 text-red-400"
											}`}
										>
											{proj.difficulty}
										</span>
									)}

									{/* Task Builder During Editing */}
									{isEditing && (
										<div className="mt-4">
											<TaskBuilder
												tasks={editProjectTasks}
												setTasks={setEditProjectTasks}
												learningObjectives={editProjectObjectives}
												setLearningObjectives={setEditProjectObjectives}
											/>
										</div>
									)}
								</div>
							);
					  })}
			</div>
		</div>
	);
};

export default Project;
