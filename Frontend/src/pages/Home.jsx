
// src/pages/Home.jsx
import AI from "../assets/AI.jpg";
import Smart from "../assets/smart.jpg";
import web from "../assets/Website.jpg";
import HeroSection from "../components/HeroSection";

const Home = () => {
  return (
    <>
      {/* Navbar */}
    

      {/* Hero Section */}
      <HeroSection />

      {/* Wavy Divider */}
      <div className="wave-wrapper">
        <svg
          className="absolute bottom-0 w-full h-24 text-gray-900"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,160L40,154.7C80,149,160,139,240,144C320,149,400,171,480,186.7C560,203,640,213,720,186.7C800,160,880,96,960,106.7C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192V320H0Z"
          ></path>
        </svg>
      </div>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-900 text-white text-center relative z-10">
        <h2 className="text-4xl font-extrabold mb-12 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
          {[
            { step: "1", title: "Choose Project", desc: "Pick from AI/ML powered project ideas." },
            { step: "2", title: "AI Generates Template", desc: "Get auto-created code templates & folder structures." },
            { step: "3", title: "Build Step by Step", desc: "Complete features guided by AI mentor." },
            { step: "4", title: "Get Certified", desc: "Earn badges & showcase your project." },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 bg-gray-800 border border-transparent hover:border-cyan-400 rounded-xl shadow-lg hover:shadow-[0_0_25px_#06b6d4] transition transform hover:-translate-y-2"
            >
              <div className="text-4xl font-bold text-indigo-400 mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wave-wrapper">
        <svg
          className="absolute top-0 w-full h-24 text-gray-950"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,133.3C672,128,768,96,864,117.3C960,139,1056,213,1152,224C1248,235,1344,181,1392,154.7L1440,128V320H0Z"
          ></path>
        </svg>
      </div>

      {/* Key Features Section */}
      <section className="py-24 bg-gray-950 text-white text-center relative z-10">
        <h2 className="text-4xl font-extrabold mb-12 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {[
            { title: "AI Mentor 🤖", desc: "Debugs errors, explains code, and gives hints." },
            { title: "Built-in Code Editor ⌨️", desc: "Code directly inside the platform." },
            { title: "Step-by-Step Tasks 📑", desc: "Projects broken into achievable steps." },
            { title: "Code Auto-Checking ✅", desc: "AI tests your code in real-time." },
            { title: "SDG Linking 🌍", desc: "Projects aligned with UN SDGs." },
            { title: "ML Project Templates ⚡", desc: "Auto-generated boilerplate & roadmap." },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-[0_0_25px_#06b6d4] transition transform hover:-translate-y-2"
            >
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">{f.title}</h3>
              <p className="text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="relative">
        <svg
          className="absolute top-0 w-full h-24 text-gray-900"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,96L80,128C160,160,320,224,480,229.3C640,235,800,181,960,181.3C1120,181,1280,235,1360,261.3L1440,288V0H0Z"
          ></path>
        </svg>
      </div>

      {/* Popular Projects Section */}
      <section className="py-24 bg-gray-900 text-white text-center relative z-10">
        <h2 className="text-4xl font-extrabold mb-12 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Popular Projects
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {[
            { title: "Real-time chat applications", img: AI },
            { title: "Social media platforms", img: Smart },
            { title: "E-commerce Website", img: web  },
          ].map((p) => (
            <div
              key={p.title}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-[0_0_25px_#9333ea] transition transform hover:-translate-y-2"
            >
              <img src={p.img} alt={p.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{p.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* More sections (Why Choose Us, Testimonials, CTA) would also get wave dividers */}
      {/* You can repeat the same SVG technique for them as above */}

      {/* Footer */}
      
    </>
  );
};

export default Home;

