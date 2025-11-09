// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/utils/constants";

import hacker from "../assets/hacker.png";
import boy from "../assets/boy.png";
import girl from "../assets/girl.png";
import human from "../assets/human.png";
import man from "../assets/man.png";
import woman from "../assets/woman.png";

// Predefined avatar URLs
const avatarOptions = [boy, woman, hacker, girl, man, human];

// 🦴 Skeleton Loader Component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-700 rounded-md ${className}`}></div>
);

const Profile = () => {
  const { user, loading: authLoading, fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    bio: "",
    avatar: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync form with user context
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || user.name || "",
        email: user.email || "",
        company: user.preferences?.company || "",
        role: user.preferences?.role || "",
        bio: user.preferences?.bio || "",
        avatar: user.avatar || "",
      });
      setLoading(false);
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle avatar selection
  const handleAvatarSelect = (avatar) =>
    setFormData((prev) => ({ ...prev, avatar }));

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          avatar: formData.avatar,
          preferences: {
            company: formData.company,
            role: formData.role,
            bio: formData.bio,
          },
        }),
      });

      if (res.ok) {
        await fetchUser();
        setIsEditing(false);
      } else console.error("Failed to save profile");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // 🦴 Skeleton loader while data loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-6 py-20">
        <div className="max-w-4xl w-full bg-gray-900 rounded-2xl shadow-lg p-8 animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="w-1/3 h-6" />
              <Skeleton className="w-1/4 h-5" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </div>

          <Skeleton className="w-full h-24 mt-6" />
        </div>
      </div>
    );
  }

  // ✅ Actual profile UI
  return (
    <div className="bg-gray-950 min-h-screen text-gray-300 px-4 sm:px-6 py-24 sm:py-20">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-cyan-400 flex items-center justify-center bg-gray-800 shrink-0">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-3xl">👤</span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
              {formData.name}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">{formData.role}</p>
            <p className="text-cyan-400 text-sm sm:text-base">
              {formData.company}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 break-words">
              📧 {formData.email}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        {!isEditing && (
          <div className="mt-6 text-center md:text-right">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 sm:px-5 py-2 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition text-sm sm:text-base"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSave}
            className="mt-8 space-y-6"
          >
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Select an Avatar
              </label>
              <div className="flex flex-wrap gap-4 mt-3">
                {avatarOptions.map((avatar, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                      formData.avatar === avatar
                        ? "border-cyan-400"
                        : "border-gray-700"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            {["name", "company", "role", "bio"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-400 capitalize">
                  {field}
                </label>
                {field === "bio" ? (
                  <textarea
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-400 focus:ring focus:ring-cyan-500/40 outline-none text-sm sm:text-base"
                  ></textarea>
                ) : (
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-400 focus:ring focus:ring-cyan-500/40 outline-none text-sm sm:text-base"
                  />
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 sm:px-5 py-2 rounded-lg border border-gray-500 text-gray-400 hover:bg-gray-700 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-white hover:opacity-90 transition text-sm sm:text-base"
              >
                Save Changes
              </button>
            </div>
          </motion.form>
        )}

        {!isEditing && (
          <p className="mt-8 text-gray-400 leading-relaxed text-sm sm:text-base break-words">
            {formData.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
