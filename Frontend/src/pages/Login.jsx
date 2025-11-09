import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const res = await fetch(`${API_BASE_URL}/user/login`, {
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

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-lg shadow-md transition flex items-center justify-center ${
            loading
              ? "bg-cyan-300 text-black cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-600 text-black"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
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
          <Link to="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-gray-400">
          Have admin account?{" "}
          <Link to="/adminlogin" className="text-cyan-400 hover:underline">
            Admin Login
          </Link>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#111827] px-2 text-gray-400">OR</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white hover:bg-gray-100 text-black rounded-xl font-semibold text-lg shadow-md transition flex items-center justify-center gap-2"
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
          <span>Login with Google</span>
        </button>
      </form>
    </div>
  );
};

export default Login;
