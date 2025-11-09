// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/constants";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const fetchUser = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/user/get-profile`, {
				method: "GET",
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				setUser(data.user);
			} else {
				setUser(null);
			}
		} catch (err) {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	const logout = async () => {
		try {
			await fetch(`${API_BASE_URL}/user/logout`, {
				method: "POST",
				credentials: "include",
			});
			navigate("/");
		} catch (err) {}
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, setUser, loading, logout, fetchUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
