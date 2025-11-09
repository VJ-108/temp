// src/components/HeroSection.jsx
import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { ReactTyped } from "react-typed";
import { useNavigate } from "react-router-dom";

/* ---------- HoloGlobe (3D visual) ---------- */
function HoloGlobe({ radius = 1.6 }) {
  const group = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.25;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
  });

  const positions = useMemo(() => {
    const arr = [];
    const count = 250;
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.82 + Math.random() * 0.36);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr.push(x, y, z);
    }
    return new Float32Array(arr);
  }, [radius]);

  return (
    <group ref={group}>
      {/* outer wireframe sphere */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* inner glow shell */}
      <mesh scale={[0.98, 0.98, 0.98]}>
        <sphereGeometry args={[radius * 0.95, 32, 32]} />
        <meshStandardMaterial
          color="#0b1220"
          emissive="#9333ea"
          emissiveIntensity={0.18}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* glowing points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            itemSize={3}
            count={positions.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.02} sizeAttenuation color="#ec4899" />
      </points>

      {/* holographic ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.04, radius * 1.16, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/* ---------- HeroSection (page UI) ---------- */
export default function HeroSection() {
  const navigate=useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#0a0a1a] text-white min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* neon blobs */}
      <div className="absolute top-12 left-8 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-12 right-8 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-28 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
        {/* LEFT */}
        <div className="md:w-1/2 space-y-6 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
              DevForge
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="text-2xl md:text-3xl font-semibold text-cyan-300 flex items-center gap-3"
          >
            <span className="text-xl">🤖</span>
            <ReactTyped
              strings={[
                "Your Personal AI Coding Mentor",
                "Build Smarter Projects with AI",
                "Code Faster. Learn Better. 🚀",
              ]}
              typeSpeed={60}
              backSpeed={40}
              loop
            />
          </motion.div>

          <p className="text-gray-400 max-w-md">
            DevForge helps CSE students build real projects step-by-step — AI-generated templates, a built-in editor, and a smart mentor to guide you.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button onClick={()=>navigate('/projects')} className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_20px_#06b6d4] hover:scale-105 transition">
              Get Started
            </button>
            <button className="px-6 py-3 border border-cyan-400 text-cyan-400 rounded-xl hover:bg-cyan-400/10 hover:shadow-[0_0_15px_#06b6d4] transition">
              Learn More
            </button>
          </div>
        </div>

        {/* RIGHT: Globe */}
        <div className="md:w-1/2 w-full h-[420px] md:h-[520px]">
          <Canvas dpr={[1, 1.3]} camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <Suspense fallback={null}>
              <HoloGlobe radius={1.6} />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>
      </div>
    </section>
  );
}
