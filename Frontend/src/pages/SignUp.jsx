import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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
      const endpoint = isAdmin ? "/admin/signup" : "/user/signup";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🎉 Signup successful! Check your email for OTP.");
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
      const endpoint = isAdmin ? "/admin/verifyOTP" : "/user/verifyOTP";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      const endpoint = isAdmin ? "/admin/resendOTP" : "/user/resendOTP";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  const handleGoogleSignUp = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050B1A] via-[#0A0F1C] to-[#111827] px-4 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#0D1528]/80 backdrop-blur-xl border border-[#24324B] shadow-[0_0_40px_rgba(0,255,255,0.1)] rounded-3xl p-6 sm:p-8 text-gray-100 transition-transform duration-500 hover:scale-[1.02]"
      >
        {/* --- GLOWING TOGGLE --- */}
        <p className="text-center text-gray-400 mb-6">
  Admin?{" "}
  <Link
    to="/adminsignup"
    className="text-pink-400 hover:underline font-semibold"
  >
    Create admin account
  </Link>
</p>

        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
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
                className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-500 transition-all duration-200 hover:border-cyan-400"
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
                className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-500 transition-all duration-200 hover:border-cyan-400"
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
                className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-500 transition-all duration-200 hover:border-cyan-400"
                required
              />
            </div>

            {/* Sign Up Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-300 flex items-center justify-center ${
                loading
                  ? "bg-gradient-to-r from-cyan-300 to-blue-300 text-black cursor-not-allowed"
                  : isAdmin
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] text-white"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] text-black"
              }`}
            >
              {loading
                ? isAdmin
                  ? "Creating Admin..."
                  : "Signing up..."
                : isAdmin
                ? "Admin Sign Up"
                : "Sign Up"}
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
              className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-500 transition-all duration-200 hover:border-cyan-400"
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
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#0D1528] px-2 text-gray-400">OR</span>
          </div>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full py-3 bg-white hover:bg-gray-100 text-black rounded-xl font-semibold text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            viewBox="0 0 488 512"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M488 261.8c0-17.8-1.6-35.6-4.9-52.8H249v99.9h134.7c-5.8 31.3-23.6 57.9-50.1 75.6v62h80.9c47.3-43.6 74.5-107.8 74.5-184.7z" />
            <path d="M249 492c67 0 123.4-22.1 164.5-60.2l-80.9-62c-22.5 15-51.2 23.9-83.6 23.9-64.2 0-118.7-43.4-138.3-101.6H25v63.7C66.6 426.4 151.3 492 249 492z" />
            <path d="M110.7 291.1c-4.7-13.9-7.4-28.7-7.4-44s2.7-30.1 7.4-44v-63.7H25C9 170.3 0 208 0 247.1s9 76.8 25 108.8l85.7-64.8z" />
            <path d="M249 97.5c36.4 0 69 12.5 94.7 36.9l71.1-71.1C372.4 28.1 316 0 249 0 151.3 0 66.6 65.6 25 165.1l85.7 64.8C130.3 140.9 184.8 97.5 249 97.5z" />
          </svg>
          <span>Sign Up with Google</span>
        </button>
      </form>
    </div>
  );
};

export default SignUp;
