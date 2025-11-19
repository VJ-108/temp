import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // ✅ Scroll effect
  useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [location.pathname]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle logout action
  const handleLogout = async () => {
    try {
      await logout(); // call from AuthContext
      setShowLogoutModal(false);
      setDropdownOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${
          location.pathname === "/"
            ? scrolled
              ? "bg-gray-900/95 backdrop-blur-md shadow-lg border-gray-800"
              : "bg-transparent border-transparent"
            : "bg-gray-900/95 backdrop-blur-md shadow-lg border-gray-800"
        }`}
        style={{
          willChange: "background, box-shadow",
          minHeight: "72px",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent"
          >
            DevForge
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 text-lg font-medium">
            {["Home", "About", "Projects", "Contact"].map((item, idx) => (
              <Link
                key={idx}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className={`relative group ${
                  location.pathname ===
                  (item === "Home" ? "/" : `/${item.toLowerCase()}`)
                    ? "text-cyan-400"
                    : "text-white"
                } transition`}
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex space-x-4 relative">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 hover:scale-105 transition-transform shadow-md"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 py-2 animate-fadeInScale origin-top-right">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-200 hover:bg-cyan-500/10 rounded-lg transition"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-200 hover:bg-cyan-500/10 rounded-lg transition"
                    >
                      Dashboard
                    </Link>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-white hover:opacity-90 hover:shadow-[0_0_15px_#06b6d4] transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 px-6 py-6 space-y-6 animate-slideDown rounded-b-3xl shadow-2xl">
            <div className="flex flex-col items-center space-y-4 text-lg font-medium">
              {["Home", "About", "Projects", "Contact"].map((item, idx) => (
                <Link
                  key={idx}
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className={`relative group w-full text-center ${
                    location.pathname ===
                    (item === "Home" ? "/" : `/${item.toLowerCase()}`)
                      ? "text-cyan-400"
                      : "text-white"
                  }`}
                >
                  {item}
                  <span className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-1/2"></span>
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="mt-4 text-red-400 border border-red-400 px-4 py-2 rounded-xl hover:bg-red-500/20 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ✅ Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center shadow-2xl max-w-sm w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-xl text-white hover:opacity-90 transition"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Animations */}
      <style>{`
        .animate-slideDown {
          animation: slideDown 0.35s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.25s ease-in-out;
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
