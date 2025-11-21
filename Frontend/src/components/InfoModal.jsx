import React, { useEffect } from "react";
import "./infoModal.css";

const InfoModal = ({ open, onClose }) => {
	if (!open) return null;

	// Enable copy functionality
	useEffect(() => {
		const blocks = document.querySelectorAll(".code-block");
		blocks.forEach((block) => {
			const btn = block.querySelector(".copy-btn");
			const code = block.querySelector("code").innerText;

			btn.onclick = () => {
				navigator.clipboard.writeText(code);
				btn.innerText = "Copied!";
				btn.classList.add("copied");
				setTimeout(() => {
					btn.innerText = "Copy";
					btn.classList.remove("copied");
				}, 1500);
			};
		});
	}, []);

	return (
		<div className="info-overlay show">
			<div className="info-modal animate-popup">
				<button className="close-btn" onClick={onClose}>
					✕
				</button>

				<div className="info-header">
					<h2>📘 Website Project Setup Guide</h2>
					<p>
						This guide will help you set up and run your basic website project.
					</p>
				</div>

				<div className="info-content">
					{/* ========================================================= */}
					{/* 🔹 1. Go to Your Project Folder */}
					{/* ========================================================= */}

					<section>
						<h2>📂 1. Navigate to Your Project Folder</h2>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>cd your-project-folder</code>
							</pre>
						</div>

						<p>
							Make sure you are inside the correct folder before creating files.
						</p>
					</section>

					{/* ========================================================= */}
					{/* 🔹 2. Create index.html */}
					{/* ========================================================= */}

					<section>
						<h2>📝 2. Create Your index.html File</h2>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="styles.css">
  <meta http-equiv="refresh" content="3">
</head>
<body>
  <h1>Hello, world!</h1>
  <p>Your website is running.</p>
  <script src="script.js"></script>
</body>
</html>`}</code>
							</pre>
						</div>
					</section>

					{/* ========================================================= */}
					{/* 🔹 3. Create main.js Server File */}
					{/* ========================================================= */}

					<section>
						<h2>🚀 3. Create Your main.js File</h2>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>{`import http from "http";
import fs from "fs";
import path from "path";

const PORT = your_allocated_port_number;

http.createServer((req, res) => {
  let filePath = req.url === "/" ? "index.html" : req.url.slice(1);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript"
    };

    res.writeHead(200, { "Content-Type": types[ext] || "text/plain" });
    res.end(data);
  });
}).listen(PORT, () =>
  console.log(\`Server running at http://localhost:\${PORT}\`)
);`}</code>
							</pre>
						</div>

						<h3>Run your server:</h3>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>node main.js</code>
							</pre>
						</div>

						<p>Open in browser:</p>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>http://localhost:your_allocated_port_number</code>
							</pre>
						</div>
					</section>

					{/* ========================================================= */}
					{/* 🔹 4. Create styles.css */}
					{/* ========================================================= */}

					<section>
						<h2>🎨 4. Example styles.css</h2>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>{`body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  padding: 20px;
}

h1 {
  color: #333;
}

p {
  font-size: 18px;
}`}</code>
							</pre>
						</div>
					</section>

					{/* ========================================================= */}
					{/* 🔹 5. Create script.js */}
					{/* ========================================================= */}

					<section>
						<h2>⚙ 5. Example script.js</h2>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>{`console.log("Script loaded successfully!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page is ready!");
});`}</code>
							</pre>
						</div>
					</section>

					{/* ========================================================= */}
					{/* 🔹 6. Installing npm Packages */}
					{/* ========================================================= */}

					<section>
						<h2>📦 6. Installing Packages</h2>
						<p>You can install Node.js packages anytime using:</p>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>npm install package_name</code>
							</pre>
						</div>

						<p>Example:</p>

						<div className="code-block">
							<button className="copy-btn">Copy</button>
							<pre>
								<code>npm install express</code>
							</pre>
						</div>
					</section>

					{/* ========================================================= */}
					{/* DONE */}
					{/* ========================================================= */}

					<h2 className="footer-note">
						🎉 You're Ready to Start Coding Your Website!
					</h2>
				</div>
			</div>
		</div>
	);
};

export default InfoModal;
