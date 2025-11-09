import React, { useEffect, useState } from "react";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/utils/constants";

const Dashboard = () => {
	const { user, loading: authLoading } = useAuth();
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchProjects = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/user-projects`, {
				method: "GET",
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				setProjects(data);
			}
		} catch (err) {
			console.error("Error fetching projects", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	// Skeleton Component (reusable)
	const SkeletonBox = ({ className }) => (
		<div
			className={`animate-pulse bg-gray-700/40 rounded-md ${className}`}
		></div>
	);

	if (authLoading || loading) {
		return (
			<div className="p-8 py-20 min-h-screen bg-[#0A0F1C] text-[#F9FAFB]">
				{/* Header Skeleton */}
				<div className="flex items-center gap-4 mb-8">
					<SkeletonBox className="w-12 h-12 rounded-full" />
					<div>
						<SkeletonBox className="w-40 h-6 mb-2" />
						<SkeletonBox className="w-64 h-4" />
					</div>
				</div>

				{/* Cards Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
					{Array(3)
						.fill()
						.map((_, i) => (
							<div
								key={i}
								className="bg-[#111827] border border-[#374151] shadow-xl p-4 rounded-lg"
							>
								<SkeletonBox className="w-32 h-5 mb-3" />
								<SkeletonBox className="w-16 h-8" />
							</div>
						))}
				</div>

				{/* Table Skeleton */}
				<div className="overflow-x-auto mb-10">
					<table className="table w-full bg-[#111827] border border-[#374151] shadow-xl rounded-lg">
						<thead className="bg-gradient-to-r from-cyan-900 via-indigo-700 to-pink-900">
							<tr className="text-cyan-300">
								<th>S.No</th>
								<th>Project Name</th>
								<th>Difficulty</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{Array(5)
								.fill()
								.map((_, i) => (
									<tr key={i} className="hover:bg-[#1f2937]/50">
										<td><SkeletonBox className="w-6 h-4" /></td>
										<td><SkeletonBox className="w-32 h-4" /></td>
										<td><SkeletonBox className="w-20 h-4" /></td>
										<td><SkeletonBox className="w-24 h-4" /></td>
									</tr>
								))}
						</tbody>
					</table>
				</div>

				{/* Charts Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{Array(2)
						.fill()
						.map((_, i) => (
							<div
								key={i}
								className="bg-[#111827] border border-[#374151] shadow-xl p-4 rounded-lg"
							>
								<SkeletonBox className="w-48 h-5 mb-3" />
								<SkeletonBox className="w-full h-[300px]" />
							</div>
						))}
				</div>
			</div>
		);
	}

	// Data after loading
	const difficultyCount = [
		{
			name: "easy",
			value: projects.filter((p) => p.project.difficulty === "easy").length,
		},
		{
			name: "medium",
			value: projects.filter((p) => p.project.difficulty === "medium").length,
		},
		{
			name: "hard",
			value: projects.filter((p) => p.project.difficulty === "hard").length,
		},
	];

	const COLORS = ["#22C55E", "#EAB308", "#EF4444"];

	return (
		<div className="p-8 py-20 min-h-screen bg-[#0A0F1C] text-[#F9FAFB]">
			{/* Header */}
			<div className="mb-8 flex items-center gap-4">
				{user.avatar ? (
					<img
						src={user.avatar}
						alt="Avatar"
						className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
					/>
				) : (
					<span className="text-3xl">👤</span>
				)}
				<div>
					<h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
						Dashboard
					</h1>
					<p className="text-lg">
						Welcome,{" "}
						<span className="font-semibold text-pink-400">
							{user.name || user.username}
						</span>{" "}
						| <span className="text-gray-400">{user.email}</span>
					</p>
				</div>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
				<div className="card bg-[#111827] border border-[#374151] shadow-xl p-4 hover:shadow-cyan-500/30 transition">
					<h2 className="font-bold text-xl mb-2 text-cyan-400">
						Total Projects
					</h2>
					<p className="text-3xl">{projects.length}</p>
				</div>
				<div className="card bg-[#111827] border border-[#374151] shadow-xl p-4 hover:shadow-purple-500/30 transition">
					<h2 className="font-bold text-xl mb-2 text-purple-400">Completed</h2>
					<p className="text-3xl">
						{projects.filter((p) => p.status === "completed").length}
					</p>
				</div>
				<div className="card bg-[#111827] border border-[#374151] shadow-xl p-4 hover:shadow-pink-500/30 transition">
					<h2 className="font-bold text-xl mb-2 text-pink-400">In Progress</h2>
					<p className="text-3xl">
						{projects.filter((p) => p.status !== "completed").length}
					</p>
				</div>
			</div>

			{/* Project table */}
			<div className="overflow-x-auto mb-10">
				<table className="table w-full bg-[#111827] border border-[#374151] shadow-xl rounded-lg">
					<thead className="bg-gradient-to-r from-cyan-900 via-indigo-700 to-pink-900 ">
						<tr className="text-cyan-300">
							<th>S.No</th>
							<th>Project Name</th>
							<th>Difficulty</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{projects.map((proj, idx) => (
							<tr key={proj._id} className="hover:bg-[#1f2937]/50">
								<td>{idx + 1}</td>
								<td>{proj.project.title}</td>
								<td>
									<span
										className={`px-3 py-1 rounded-full text-sm font-semibold ${
											proj.project.difficulty === "easy"
												? "bg-green-600/30 text-green-400"
												: proj.project.difficulty === "medium"
												? "bg-yellow-600/30 text-yellow-400"
												: "bg-red-600/30 text-red-400"
										}`}
									>
										{proj.project.difficulty}
									</span>
								</td>
								<td>{proj.status}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="card bg-[#111827] border border-[#374151] shadow-xl p-4">
					<h2 className="font-bold text-xl mb-2 text-purple-400">
						Completion Bar Chart
					</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={projects.map((p, idx) => ({
								id: idx + 1,
								completion: p.progress || (p.status === "completed" ? 100 : 0),
							}))}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
							<XAxis dataKey="id" />
							<YAxis stroke="#D1D5DB" />
							<Tooltip
								contentStyle={{
									backgroundColor: "#111827",
									border: "1px solid #374151",
									color: "#F9FAFB",
								}}
							/>
							<Bar dataKey="completion" fill="#06B6D4" radius={[6, 6, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>

				<div className="card bg-[#111827] border border-[#374151] shadow-xl p-4">
					<h2 className="font-bold text-xl mb-2 text-cyan-400">
						Projects by Difficulty
					</h2>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={difficultyCount}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								outerRadius={100}
								label
							>
								{difficultyCount.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index]} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "white",
									border: "1px solid #374151",
									color: "#111827",
								}}
							/>
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
