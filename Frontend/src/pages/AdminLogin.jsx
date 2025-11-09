import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "", adminPassKey: ""});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useAuth();
  const statusRef = useRef(null);

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

    try {
      const res = await fetch(`${API_BASE_URL}/user/adminlogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Login successful!");
        setUser(data.user);
        setTimeout(() => navigate("/"), 1000); // Redirect after delay
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] px-4 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#111827] border border-[#374151] shadow-2xl rounded-2xl p-6 sm:p-8 text-gray-100"
        aria-describedby="statusMessage"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          Welcome Back 👋
        </h2>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-gray-400 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
            required
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm text-gray-400 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="adminPassKey" className="block text-sm text-gray-400 mb-2">
            Admin PassKey
          </label>
          <input
            id="adminPassKey"
            type="password"
            name="adminPassKey"
            value={formData.adminPassKey}
            onChange={handleChange}
            placeholder="Enter Admin Passkey"
            // autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-lg shadow-md transition flex items-center justify-center ${
            loading
              ? "bg-cyan-300 text-black cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-600 text-black"
          }`}
        >
          {loading ? "Logging in..." : "Admin Login"}
        </button>

        {/* Screen reader live region */}
        <p
          id="statusMessage"
          ref={statusRef}
          className="sr-only"
          aria-live="polite"
        >
          {loading ? "Logging in..." : ""}
        </p>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/adminsignup" className="text-cyan-400 hover:underline">
            Admin Sign up
          </Link>
        </p>

        
        </form>
    </div>
  );
};

export default AdminLogin;
