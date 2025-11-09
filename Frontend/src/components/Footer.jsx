// src/components/Footer.jsx
import { Github, Twitter, Linkedin, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gray-950 text-gray-300 pt-20 pb-10 overflow-hidden">
      {/* Wave Divider on top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-20 text-gray-900"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,229.3C672,245,768,235,864,202.7C960,171,1056,117,1152,128C1248,139,1344,213,1392,250.7L1440,288V0H0Z"
          ></path>
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 relative z-10">
        
        {/* Brand + About */}
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
            DevForge
          </h2>
          <p className="mt-4 text-gray-400 leading-relaxed">
            AI-powered project builder for CSE students. Learn by doing, guided by AI.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { name: "Home", link: "/" },
              { name: "About", link: "/About" },
              { name: "Projects", link: "/projects" },
              { name: "Contact", link: "/contact" },
            ].map((item) => (
              <li key={item.name}>
                <a
                  href={item.link}
                  className="hover:text-cyan-400 transition-colors duration-300"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
          <div className="flex space-x-4">
            {[
              { icon: <Globe size={20} />, link: "#" },
              { icon: <Twitter size={20} />, link: "#" },
              { icon: <Linkedin size={20} />, link: "#" },
              { icon: <Github size={20} />, link: "#" },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.link}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-400 relative group transition-all duration-300"
              >
                {/* Gradient ring glow */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-md transition duration-500"></span>
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  {social.icon}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative mt-12 pt-6 text-center text-gray-500 text-sm z-10">
        {/* Gradient Top Border */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 animate-pulse"></div>
        <p className="relative z-10">
          © {new Date().getFullYear()} DevForge. All rights reserved.
        </p>
      </div>

      {/* Animated Neon Wave at Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-indigo-500 animate-[pulse_3s_infinite_alternate] blur-sm opacity-70"></div>
    </footer>
  );
};

export default Footer;
