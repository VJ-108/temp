import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/constants";
import { PencilIcon, TrashIcon, CheckIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
 
const Project = () => {
  const [filter, setFilter] = useState("easy");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editedData, setEditedData] = useState({});
  const { user } = useAuth();
 
  const Navigate = useNavigate();
 
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
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading projects...
      </div>
    );
  }
 
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
 
  // Handle Edit toggle
  const handleEditToggle = (proj) => {
    if (editingProject === proj._id) {
      setEditingProject(null);
    } else {
      setEditingProject(proj._id);
      setEditedData(proj);
    }
  };
 
  // Handle Save (Update)
  const handleSave = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editedData),
      });
 
      if (!res.ok) {
        throw new Error("Failed to update project");
      }
 
      const updatedProject = await res.json();
      setProjects(projects.map((p) => (p._id === id ? updatedProject : p)));
      setEditingProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };
 
  const handleChange = (e, key) => {
    setEditedData({
      ...editedData,
      [key]: e.target.value,
    });
  };
 
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProject = {
      title: formData.get("title"),
      description: formData.get("description"),
      techStack: formData
        .get("techStack")
        .split(",")
        .map((t) => t.trim()),
      difficulty: formData.get("difficulty"),
      templateRepo: formData.get("templateRepo") || "",
    };
 
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newProject),
      });
 
      if (!res.ok) throw new Error("Failed to create project");
 
      const createdProject = await res.json();
      setProjects((prev) => [...prev, createdProject]);
      document.getElementById("addProjectModal").close();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };
 
  return (
    <div className="p-8 py-24 min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#111827] to-[#1f2937] text-[#F9FAFB]">
      {/* Difficulty Filter & Add Project Button */}
      <div
        className={`flex ${
          user?.role === "admin" ? "justify-between" : "justify-center"
        } items-center mb-10`}
      >
        {/* Filter Buttons (left) */}
        <div
          className={`flex ${
            user?.role === "admin" ? "mx-auto" : ""
          } justify-center gap-6`}
        >
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
 
        {/* Add Project Button for Admin */}
        {user?.role === "admin" && (
          <>
            <button
              className="flex items-center gap-2 px-5 py-2 bg-[#06B6D4] hover:bg-[#9333EA] rounded-full font-semibold shadow-md transition-all text-white"
              onClick={() =>
                document.getElementById("addProjectModal").showModal()
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Project
            </button>
 
            {/* Add Project Modal */}
            <dialog id="addProjectModal" className="modal">
              <div className="modal-box bg-[#111827] text-[#F9FAFB] border border-[#374151]">
                <h3 className="font-bold text-2xl text-[#06B6D4] mb-4">
                  Add New Project
                </h3>
 
                <form method="dialog" onSubmit={handleCreateProject}>
                  {/* Title */}
                  <label className="block mb-2 font-semibold">Title</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="Enter project title"
                    className="input input-bordered w-full mb-4 bg-transparent border-[#374151] focus:border-[#06B6D4]"
                    required
                  />
 
                  {/* Description */}
                  <label className="block mb-2 font-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter project description"
                    className="textarea textarea-bordered w-full mb-4 bg-transparent border-[#374151] focus:border-[#06B6D4]"
                    required
                  ></textarea>
 
                  {/* Tech Stack */}
                  <label className="block mb-2 font-semibold">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    name="techStack"
                    type="text"
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="input input-bordered w-full mb-4 bg-transparent border-[#374151] focus:border-[#9333EA]"
                    required
                  />
 
                  {/* Difficulty */}
                  <label className="block mb-2 font-semibold">Difficulty</label>
                  <select
                    name="difficulty"
                    className="select select-bordered w-full mb-4 bg-transparent border-[#374151] focus:border-[#9333EA] text-[#F9FAFB]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
 
                  {/* Repo Link */}
                  <label className="block mb-2 font-semibold">
                    Template Repo (optional)
                  </label>
                  <input
                    name="templateRepo"
                    type="text"
                    placeholder="https://github.com/user/repo"
                    className="input input-bordered w-full mb-4 bg-transparent border-[#374151] focus:border-[#06B6D4]"
                  />
 
                  {/* Action Buttons */}
                  <div className="modal-action">
                    <button
                      type="submit"
                      className="btn bg-[#06B6D4] border-none hover:bg-[#9333EA] text-white"
                    >
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("addProjectModal").close()
                      }
                      className="btn bg-gray-700 border-none hover:bg-gray-600 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </dialog>
          </>
        )}
      </div>
 
      {/* Project Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((proj) => {
          const isEditing = editingProject === proj._id;
 
          return (
            <div
              key={proj._id}
              className="bg-[#111827] border border-[#374151] rounded-2xl shadow-lg p-6 transition-all hover:shadow-cyan-500/40"
            >
              {/* Header Row (Project Name + Admin Controls) */}
              <div className="flex justify-between items-center mb-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.title}
                    onChange={(e) => handleChange(e, "title")}
                    className="input input-sm w-full bg-transparent border-[#374151] focus:border-[#06B6D4] text-cyan-400 font-bold"
                  />
                ) : (
                  <Link
                    to={`/editor/${proj.title.replace(/\s+/g, "-")}`}
                    className="relative text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors group"
                  >
                    {proj.title}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
 
                {/* Admin Buttons */}
                {user?.role === "admin" && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <button
                        onClick={() => handleSave(proj._id)}
                        className="p-2 rounded-full hover:bg-green-600/20"
                        title="Save Changes"
                      >
                        <CheckIcon size={20} className="text-green-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditToggle(proj)}
                        className="p-2 rounded-full hover:bg-purple-600/20"
                        title="Edit Project"
                      >
                        <PencilIcon size={20} className="text-purple-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(proj._id)}
                      className="p-2 rounded-full hover:bg-red-600/20"
                      title="Delete Project"
                    >
                      <TrashIcon size={20} className="text-red-400" />
                    </button>
                  </div>
                )}
 
                {/* Confirmation Dialog */}
                {showConfirm && (
                  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 ">
                    <div className="bg-[#1f2937] p-8 rounded-2xl shadow-2xl border border-gray-600 max-w-sm w-full text-center">
                      <h2 className="text-xl font-semibold text-gray-100 mb-4">
                        Confirm Deletion
                      </h2>
                      <p className="text-gray-300 mb-6">
                        Are you sure you want to delete this project? This
                        action cannot be undone.
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={confirmDelete}
                          className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg text-white font-semibold shadow-md"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg text-white font-semibold shadow-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
 
              {/* Description */}
              {isEditing ? (
                <textarea
                  value={editedData.description}
                  onChange={(e) => handleChange(e, "description")}
                  className="textarea textarea-bordered w-full bg-transparent border-[#374151] focus:border-[#06B6D4] text-gray-300 mb-4"
                />
              ) : (
                <p
                  onClick={() =>
                    user?.role === "student" &&
                    Navigate(`/editor/${proj.title.replace(/\s+/g, "-")}`)
                  }
                  className="text-gray-300 mb-6 leading-relaxed line-clamp-3 cursor-pointer"
                >
                  {proj.description}
                </p>
              )}
 
              {/* Difficulty */}
              {isEditing ? (
                <select
                  value={editedData.difficulty}
                  onChange={(e) => handleChange(e, "difficulty")}
                  className="select select-sm bg-transparent border-[#374151] text-gray-200 focus:border-[#9333EA]"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              ) : (
                <span
                  className={`px-4 py-1 text-sm rounded-full font-semibold 
                    ${
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
            </div>
          );
        })}
      </div>
    </div>
  );
 
	// Skeleton Loader Component
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
 
	return (
		<div className="p-8 py-24 min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#111827] to-[#1f2937] text-[#F9FAFB]">
			{/* Difficulty Filter */}
			<div className="flex justify-center gap-6 mb-10">
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
 
			{/* Project Cards */}
			<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{loading
					? Array(6)
							.fill(0)
							.map((_, i) => <SkeletonCard key={i} />)
					: filteredProjects.map((proj) => (
							<div
								key={proj._id}
								className="bg-[#111827] border border-[#374151] rounded-2xl shadow-lg p-6 transition-all hover:shadow-cyan-500/40"
							>
								<Link
									to={`/editor/${proj.title.replace(/\s+/g, "-")}`}
									className="relative text-2xl font-bold mb-3 text-cyan-400 hover:text-cyan-300 transition-colors inline-block group"
								>
									{proj.title}
									<span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
								</Link>
 
								<p className="text-gray-300 mb-6 leading-relaxed line-clamp-3">
									{proj.description}
								</p>
 
								<span
									className={`px-4 py-1 text-sm rounded-full font-semibold 
                    ${
											proj.difficulty === "easy"
												? "bg-green-600/30 text-green-400"
												: proj.difficulty === "medium"
												? "bg-yellow-600/30 text-yellow-400"
												: "bg-red-600/30 text-red-400"
										}`}
								>
									{proj.difficulty}
								</span>
							</div>
					  ))}
			</div>
		</div>
	);
};
 
export default Project;