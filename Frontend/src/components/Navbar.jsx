import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
	const { user, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();
	const dropdownRef = useRef(null);

	// Scroll styling
	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(e) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			setShowLogoutModal(false);
			navigate("/", { replace: true });
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const navItems = [
		{ name: "Home", link: "/" },
		{ name: "About", link: "/about" },
		{ name: "Projects", link: "/projects" },
		{ name: "Contact", link: "/contact" },
	];

	return (
		<>
			<nav
				className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
					scrolled
						? "bg-gray-900/95 backdrop-blur-md shadow-lg border-gray-800"
						: "bg-transparent border-transparent"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex justify-between items-center">
					{/* Logo */}
					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent"
					>
						DevForge
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex space-x-8 text-lg">
						{navItems.map((item) => (
							<Link
								key={item.name}
								to={item.link}
								className={`relative group ${
									location.pathname === item.link
										? "text-cyan-400"
										: "text-white"
								}`}
							>
								{item.name}
								<span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
							</Link>
						))}
					</div>

					{/* Desktop Auth */}
					<div className="hidden md:flex items-center gap-4 relative">
						{user ? (
							<div ref={dropdownRef} className="relative">
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 hover:scale-105 transition"
								>
									{user.avatar ? (
										<img
											src={user.avatar}
											alt=""
											className="object-cover w-full h-full"
										/>
									) : (
										<span className="flex items-center justify-center w-full h-full bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold">
											{user.username?.charAt(0).toUpperCase()}
										</span>
									)}
								</button>

								{dropdownOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 shadow-xl rounded-xl p-2 animate-fadeIn">
										<Link
											to="/profile"
											className="block px-4 py-2 text-white hover:bg-gray-800 rounded-lg"
											onClick={() => setDropdownOpen(false)}
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
										<button
											onClick={() => {
												setDropdownOpen(false);
												setShowLogoutModal(true);
											}}
											className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg"
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
									className="text-cyan-400 border border-cyan-400 px-4 py-2 rounded-xl hover:bg-cyan-400/10"
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:opacity-90"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Toggle */}
					<button
						className="md:hidden text-white"
						onClick={() => setIsOpen(!isOpen)}
					>
						{isOpen ? <X size={28} /> : <Menu size={28} />}
					</button>
				</div>

				{/* Mobile Menu */}
				{isOpen && (
					<div className="md:hidden px-6 py-6 bg-gray-900/95 border-t border-gray-700 space-y-4 animate-slideDown">
						{navItems.map((item) => (
							<Link
								key={item.name}
								to={item.link}
								onClick={() => setIsOpen(false)}
								className={`block text-center text-lg ${
									location.pathname === item.link
										? "text-cyan-400"
										: "text-white"
								}`}
							>
								{item.name}
							</Link>
						))}

						<div className="pt-2 border-t border-gray-700">
							{user ? (
								<>
									<Link
										to="/profile"
										onClick={() => setIsOpen(false)}
										className="block py-2 text-center border border-cyan-400 rounded-xl text-cyan-400"
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

									<button
										onClick={() => {
											setIsOpen(false);
											setShowLogoutModal(true);
										}}
										className="mt-3 w-full py-2 border border-red-400 text-red-400 rounded-xl"
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										to="/login"
										onClick={() => setIsOpen(false)}
										className="block py-2 border border-cyan-400 text-center rounded-xl text-cyan-400"
									>
										Login
									</Link>

									<Link
										to="/signup"
										onClick={() => setIsOpen(false)}
										className="mt-3 block py-2 text-center rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-white"
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</nav>

			{/* Logout Modal */}
			{showLogoutModal && (
				<div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-[100]">
					<div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center w-[90%] max-w-sm">
						<h2 className="text-white text-xl font-semibold">Are you sure?</h2>
						<p className="text-gray-400 mt-2 mb-5">Do you want to logout?</p>

						<div className="flex justify-center gap-4">
							<button
								onClick={handleLogout}
								className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-white hover:opacity-90"
							>
								Logout
							</button>
							<button
								onClick={() => setShowLogoutModal(false)}
								className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			<style>{`
        .animate-slideDown {
          animation: slideDown .3s ease-out;
        }
        @keyframes slideDown {
          from {opacity: 0; transform: translateY(-10px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn .25s ease-in-out;
        }
        @keyframes fadeIn {
          from {opacity: 0; transform: scale(.95);}
          to {opacity: 1; transform: scale(1);}
        }
      `}</style>
		</>
	);
};

export default Navbar;
