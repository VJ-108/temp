import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast"; // ✅ Toast

const AdminSignUp = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
        adminPassKey: "",
	});
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("");
	const [showOtp, setShowOtp] = useState(false);
	const [otp, setOtp] = useState("");

	const navigate = useNavigate();
	const { setUser, user } = useAuth();

	useEffect(() => {
		if (user) navigate("/");
	}, [user, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setStatus("Signing up...");
		try {
			const res = await fetch(`${API_BASE_URL}/user/adminsignup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success("🎉 Signup successful! Check email for OTP.");
				setShowOtp(true);
			} else {
				toast.error(data.message || "❌ Signup failed.");
			}
		} catch (error) {
			console.error("Signup error:", error);
			toast.error("⚠️ Error signing up. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async () => {
		if (!otp) return setStatus("Enter OTP");
		setLoading(true);
		setStatus("Verifying OTP...");
		try {
			const res = await fetch(`${API_BASE_URL}/user/verifyOTP`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: formData.email, otp }),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success("✅ Email verified! You can now log in.");
				setShowOtp(false);
				setOtp("");
				setFormData({ username: "", email: "", password: "" });
				navigate("/login");
			} else {
				toast.error(data.message || "❌ Invalid OTP.");
			}
		} catch (error) {
			console.error("OTP verification error:", error);
			toast.error("⚠️ Error verifying OTP.");
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		setLoading(true);
		setStatus("Resending OTP...");
		try {
			const res = await fetch(`${API_BASE_URL}/user/resendOTP`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: formData.email }),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success("📩 OTP resent to your email.");
			} else {
				toast.error(data.message || "❌ Error resending OTP.");
			}
		} catch (error) {
			console.error("Resend OTP error:", error);
			toast.error("⚠️ Failed to resend OTP.");
		} finally {
			setLoading(false);
		}
	};


	return (
		<div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-gray-100 px-4 py-24">
			<form className="w-full max-w-md bg-[#111827] border border-[#374151] shadow-xl rounded-2xl p-6 sm:p-8">
				<h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-cyan-400">
					Create Account ✨
				</h2>

				{!showOtp ? (
					<>
						{/* Username */}
						<div className="mb-4">
							<label className="block text-sm text-gray-400 mb-2">Username</label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								placeholder="Enter your username"
								className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
								required
							/>
						</div>

						{/* Email */}
						<div className="mb-4">
							<label className="block text-sm text-gray-400 mb-2">Email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
								className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
								required
							/>
						</div>

						{/* Password */}
						<div className="mb-6">
							<label className="block text-sm text-gray-400 mb-2">Password</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter your password"
								className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
								required
							/>
						</div>

                        {/* Admin Pass Key */}
						<div className="mb-6">
							<label className="block text-sm text-gray-400 mb-2">Admin PassKey</label>
							<input
								type="password"
								name="adminPassKey"
								value={formData.adminPassKey}
								onChange={handleChange}
								placeholder="Enter Admin PassKey"
								className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
								required
							/>
						</div>

						{/* Sign Up Button */}
						<button
							onClick={handleSubmit}
							disabled={loading}
							className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-semibold text-lg text-black shadow-md transition flex items-center justify-center"
						>
							{loading ? "Signing up..." : "Admin Sign Up"}
						</button>
					</>
				) : (
					<div className="mb-6">
						{/* OTP Input */}
						<label className="block text-sm text-gray-400 mb-2">Enter OTP</label>
						<input
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Enter 6-digit OTP"
							className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
						/>

						{/* Verify Button */}
						<button
							onClick={handleVerifyOtp}
							disabled={loading}
							className="mt-3 w-full py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-black shadow-md transition"
						>
							Verify OTP
						</button>

						{/* Resend Button */}
						<button
							onClick={handleResendOtp}
							disabled={loading}
							className="mt-2 w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-semibold text-black shadow-md transition"
						>
							Resend OTP
						</button>
					</div>
				)}

				{/* Status Message */}
				{status && (
					<p className="mt-4 text-center text-sm text-gray-300">{status}</p>
				)}

				{/* Login Link */}
				<p className="mt-6 text-center text-sm text-gray-400">
					Already have an account?{" "}
					<Link to="/adminlogin" className="text-cyan-400 hover:underline">
						Admin Login
					</Link>
				</p>
			</form>
		</div>
	);
};

export default AdminSignUp;
