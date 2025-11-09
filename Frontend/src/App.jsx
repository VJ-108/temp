import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Contact from "./pages/ContactUs";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Project from "./pages/Project";
import EditorPage from "./pages/EditorPage";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import ScrollToTop from "./components/ScrollToTop";
import Editor from "./pages/Editor";


function App() {
	return (
		<>
			<ScrollToTop />

			<Toaster
				position="bottom-right"
				toastOptions={{
					style: {
						background: "#1f2937", 
						color: "#fff",
						borderRadius: "8px",
						padding: "12px 16px",
					},
				}}
			/>

			{/* App Routes */}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/projects" element={<div><Project /></div>} />
				<Route path="/about" element={<div><About /></div>} />
				<Route path="/dashboard" element={<div><Dashboard /></div>} />
				<Route path="/profile" element={<div><Profile /></div>} />
				<Route path="/contact" element={<div><Contact /></div>} />
				<Route path="/login" element={<div><Login /></div>} />
				<Route path="/signup" element={<div><SignUp /></div>} />
				<Route path="/adminlogin" element={<div><AdminLogin /></div>} />
				<Route path="/adminsignup" element={<div><AdminSignUp/></div>} />
				{/* <Route path="/editor/:projectId" element={<EditorPage />} /> */}
				<Route path="/editor" element={<Editor />} />
			</Routes>
		</>
	);
}

export default App;
