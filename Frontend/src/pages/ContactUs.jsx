import React, { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import emailjs from "@emailjs/browser";
import toast, { Toaster } from "react-hot-toast";

const ContactUs = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);

  // Floating animation for particles
  useEffect(() => {
    const particles = document.querySelectorAll(".particle");
    const interval = setInterval(() => {
      particles.forEach((p) => {
        p.style.transform = `translate(${Math.random() * 30 - 15}px, ${
          Math.random() * 30 - 15
        }px)`;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle EmailJS Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    toast.loading("Sending your message...", { id: "contact-toast" });

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          toast.success("Message sent successfully 🎉", { id: "contact-toast" });
          formRef.current.reset();
          setLoading(false);
        },
        (error) => {
          console.error("EmailJS Error:", error);
          toast.error("Failed to send message. Please try again 😢", {
            id: "contact-toast",
          });
          setLoading(false);
        }
      );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B17] text-gray-100 px-4 sm:px-6 md:px-8 py-24 flex flex-col items-center justify-center">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Glowing background effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="particle absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full opacity-40 blur-sm transition-transform duration-[4000ms]"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        ></div>
      ))}

      {/* Header */}
      <div className="relative z-10 max-w-6xl w-full text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Have questions, feedback, or collaboration ideas? Reach out and let's
          build something amazing together.
        </p>
      </div>

      {/* Info Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16 w-full max-w-6xl">
        {[
          {
            icon: <Mail className="w-10 h-10 text-cyan-400" />,
            label: "Email",
            value: "support@devforge.com",
            border: "hover:border-cyan-400",
          },
          {
            icon: <Phone className="w-10 h-10 text-purple-400" />,
            label: "Phone",
            value: "+91 98765 43210",
            border: "hover:border-purple-400",
          },
          {
            icon: <MapPin className="w-10 h-10 text-pink-400" />,
            label: "Location",
            value: "Bengaluru, India",
            border: "hover:border-pink-400",
          },
        ].map((info, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-2xl bg-[#0F1629]/80 backdrop-blur-md border border-gray-700 transition-all transform hover:scale-105 shadow-lg ${info.border}`}
          >
            <div className="flex justify-center mb-4">{info.icon}</div>
            <h3 className="text-xl font-semibold text-white text-center">
              {info.label}
            </h3>
            <p className="text-gray-400 mt-2 text-center">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative z-10 max-w-3xl w-full bg-[#0F1629]/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              type="text"
              name="from_name"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="from_email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none transition"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm text-gray-400 mb-2">Message</label>
          <textarea
            rows="5"
            name="message"
            placeholder="Write your message here..."
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-pink-400 outline-none transition"
            required
          ></textarea>
        </div>

        {/* Hidden date field */}
        <input
          type="hidden"
          name="date"
          value={new Date().toLocaleString()}
        />

        <button
          type="submit"
          disabled={loading}
          className={`mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-black font-semibold text-lg transition-all duration-300 ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]"
          }`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
