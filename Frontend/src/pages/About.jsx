// src/pages/About.jsx
import { motion } from "framer-motion";
import man from "../assets/man.png";
import girl from "../assets/girl.png";
import boy from "../assets/boy.png";
import hacker from "../assets/hacker.png";
import { Users, Award, Rocket, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="bg-gray-950 text-gray-300">
      {/* Hero Section */}
      <section className="relative text-center py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-pink-500/10 blur-3xl"></div>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent"
        >
          About <span className="text-white">DevForge</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mt-6 max-w-3xl mx-auto text-lg text-gray-400"
        >
          DevForge is an AI-powered project builder crafted for CSE students. We
          help you <span className="text-cyan-400">learn by building</span> —
          guided by AI, enhanced with modern tools, and optimized for your
          success.
        </motion.p>
      </section>

      {/* Mission + Vision */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-white">🚀 Our Mission</h2>
          <p className="text-gray-400 leading-relaxed">
            To empower students with hands-on learning through real projects,
            blending AI guidance with creativity. DevForge is your companion in
            building projects that matter.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-white">🌟 Our Vision</h2>
          <p className="text-gray-400 leading-relaxed">
            To become the ultimate AI-driven project ecosystem where every CSE
            student builds confidently, learns faster, and achieves greatness.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { icon: <Users size={36} />, value: "5k+", label: "Students" },
            { icon: <Rocket size={36} />, value: "500+", label: "Projects Built" },
            { icon: <Award size={36} />, value: "20+", label: "Awards" },
            { icon: <Zap size={36} />, value: "99%", label: "Satisfaction" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: idx * 0.2 }}
              className="p-6 bg-gray-800 rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition"
            >
              <div className="text-cyan-400 mb-4 flex justify-center">
                {stat.icon}
              </div>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent"
        >
          Meet Our Team
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {[
            { name: "Gourav Tandan", role: "Developer", img: man },
            { name: "Vaibhav Jha", role: "Developer", img: man},
            { name: "Om Singh Mehta", role: "Developer", img: man },
            { name: "Sagar Kumar", role: "Developer", img: man },
          ].map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-pink-500/20 transition group"
            >
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-cyan-400 group-hover:scale-110 transform transition duration-500">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white text-center">
                {member.name}
              </h3>
              <p className="text-gray-400 text-center">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-gray-900 py-20 relative overflow-hidden">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent"
        >
          What Students Say
        </motion.h2>

        <div className="relative max-w-5xl mx-auto overflow-hidden">
          <div className="flex animate-slide space-x-8">
            {[
              {
                name: "Ravi Kumar",
                text: "DevForge helped me build my first AI chatbot project and I landed an internship!",
                img: boy,
              },
              {
                name: "Ananya Sharma",
                text: "Step-by-step tasks and AI mentor made learning so easy and fun.",
                img: girl,
              },
              {
                name: "Vikram Patel",
                text: "The AI auto-checker saved me hours of debugging. Amazing experience!",
                img: hacker,
              },
              // {
              //   name: "Neha Gupta",
              //   text: "Best platform for students who want real-world projects with AI guidance.",
              //   img: "/student4.jpg",
              // },
            ].map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="min-w-[300px] bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-indigo-500/20 transition"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 mb-4">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-300 italic mb-4 text-center">
                  “{t.text}”
                </p>
                <h3 className="text-lg font-semibold text-white">{t.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
