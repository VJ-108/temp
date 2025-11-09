import fs from "fs/promises";
import { joinPath } from "./utils.js";
import { execSync } from "child_process";
import { generateFileTree } from "./fileManager.js";

export async function initProject(
	containerName,
	userDir,
	{ projectType, projectName },
	socket
) {
	try {
		const projectDir = path.join(userDir, projectName || "my-app");

		let initCommand = "";
		switch (projectType) {
			case "react":
				initCommand = `npx create-react-app ${
					projectName || "my-app"
				} --template minimal`;
				break;
			case "express":
				initCommand = `mkdir -p ${projectName || "my-app"} && cd ${
					projectName || "my-app"
				} && npm init -y && npm install express`;
				break;
			case "html":
				// Create basic HTML structure
				await fs.mkdir(projectDir, { recursive: true });
				await fs.writeFile(
					path.join(projectDir, "index.html"),
					`<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src="script.js"></script>\n</body>\n</html>`
				);
				await fs.writeFile(
					path.join(projectDir, "style.css"),
					`body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n`
				);
				await fs.writeFile(
					path.join(projectDir, "script.js"),
					`console.log('Hello World');\n`
				);
				break;
			default:
				throw new Error("Unknown project type");
		}

		if (initCommand) {
			execSync(
				`docker exec ${containerName} bash -c "cd /workspace && ${initCommand}"`,
				{ timeout: 120000 }
			);
		}

		const tree = generateFileTree(containerName);
		socket.emit("file:refresh", tree);
		socket.emit("project:init:success", { projectName });
	} catch (error) {
		console.error("❌ Error initializing project:", error);
		socket.emit("project:init:error", { error: error.message });
	}
}
