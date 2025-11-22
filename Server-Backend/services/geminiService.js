// Server-Backend/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System prompts for different task types
 */
const SYSTEM_PROMPTS = {
	debug: `You are an expert debugging assistant for HTML, CSS, JavaScript, and lightweight Node.js projects (Express and small utility packages only).
Your role is to:
1. Identify bugs and errors in front-end code or lightweight backend code
2. Explain WHY the error occurs (not just what)
3. Provide step-by-step fixes
4. Suggest preventive measures
5. Reference related files in the project when relevant

Avoid giving solutions requiring heavy frameworks such as React, MongoDB, or full MERN stack.
Keep responses concise but thorough. Use code examples when helpful.`,

	review: `You are a senior code reviewer for HTML, CSS, JavaScript, and lightweight Node.js (Express) applications.
Your role is to:
1. Assess code quality and adherence to best practices
2. Identify security vulnerabilities
3. Suggest performance optimizations
4. Check for proper error handling
5. Evaluate code maintainability

DO NOT recommend MERN stack patterns or technologies (React, MongoDB, Mongoose, etc.).
Provide constructive feedback with specific examples.`,

	hint: `You are a patient coding mentor helping students learn HTML, CSS, JS, and small-scale Node.js.
Your role is to:
1. Give subtle hints without revealing the complete solution
2. Ask guiding questions to help students think
3. Break down complex problems into smaller steps
4. Encourage exploration and experimentation
5. Build confidence through progressive learning

Never suggest MERN stack solutions. Never give complete solutions—only hints and guidance.`,

	test: `You are a testing expert for HTML/CSS/JS and lightweight Node.js applications.
Your role is to:
1. Generate test cases for browser logic or Node.js functions
2. Cover happy paths, edge cases, and error scenarios
3. Write clean, maintainable test code (Jest or similar lightweight tools)
4. Follow testing best practices
5. Explain what each test validates

Avoid recommending MERN-related tools, libraries, or patterns.`,

	explain: `You are a technical educator specializing in front-end development (HTML, CSS, JS) and simple backend logic using Express.
Your role is to:
1. Explain concepts clearly with real-world analogies
2. Provide practical examples
3. Break down complex topics into digestible parts
4. Highlight common mistakes and misconceptions
5. Connect concepts to the student's current project

Never reference React, MongoDB, or MERN stack concepts. Keep the context simple and lightweight.`,

	refactor: `You are a code quality expert specializing in clean, maintainable code for HTML, CSS, JavaScript, and lightweight Express apps.
Your role is to:
1. Suggest refactoring for better readability
2. Apply clean code principles
3. Reduce duplication and complexity
4. Improve naming conventions and structure
5. Maintain functionality while improving quality

Avoid recommending MERN-stack or enterprise patterns. Keep solutions simple.`,

	optimize: `You are a performance optimization specialist for front-end (HTML, CSS, JS) and simple Express servers.
Your role is to:
1. Identify performance bottlenecks
2. Suggest efficient DOM usage and reduced JS blocking
3. Recommend simple caching or lightweight improvements
4. Improve loading and rendering performance
5. Minimize file size and unnecessary dependencies

Never recommend optimizations tied to React, MongoDB, or any MERN tools.`,

	security: `You are a security expert for front-end JavaScript and small Express servers.
Your role is to:
1. Identify vulnerabilities (XSS, CSRF, insecure input handling, etc.)
2. Suggest secure coding practices
3. Review simple authentication/authorization logic when applicable
4. Check for sensitive data exposure
5. Recommend improvements that work WITHOUT heavy frameworks or databases

Avoid any solution involving MERN stack technologies or patterns.`,
};

/**
 * Build context-aware prompt
 */
function buildContextPrompt(taskType, query, projectContext) {
	const systemPrompt = SYSTEM_PROMPTS[taskType] || SYSTEM_PROMPTS.explain;

	let prompt = `${systemPrompt}\n\n`;
	prompt += `=== PROJECT CONTEXT ===\n`;
	prompt += `Project: ${projectContext.project.title}\n`;
	prompt += `Description: ${projectContext.project.description}\n`;
	prompt += `Tech Stack: ${projectContext.project.techStack.join(", ")}\n`;
	prompt += `Difficulty: ${projectContext.project.difficulty}\n\n`;

	// Add current file context
	if (projectContext.currentFile) {
		prompt += `=== CURRENT FILE: ${projectContext.currentFile.path} ===\n`;
		prompt += `\`\`\`\n${projectContext.currentFile.content}\n\`\`\`\n\n`;
	}

	// Add file structure
	if (projectContext.fileStructure) {
		prompt += `=== PROJECT STRUCTURE ===\n`;
		prompt += `${projectContext.fileStructure}\n\n`;
	}

	// Add recent errors
	if (
		projectContext.recentActivity?.errors &&
		projectContext.recentActivity.errors.length > 0
	) {
		prompt += `=== RECENT ERRORS ===\n`;
		projectContext.recentActivity.errors.forEach((err, i) => {
			prompt += `${i + 1}. ${err}\n`;
		});
		prompt += `\n`;
	}

	// Add terminal output
	if (
		projectContext.recentActivity?.terminalOutput &&
		projectContext.recentActivity.terminalOutput.length > 0
	) {
		prompt += `=== RECENT TERMINAL OUTPUT ===\n`;
		prompt += projectContext.recentActivity.terminalOutput.join("\n");
		prompt += `\n\n`;
	}

	// Add related files (up to 3 most relevant)
	if (projectContext.allFiles && projectContext.allFiles.length > 0) {
		prompt += `=== RELATED FILES ===\n`;
		const relatedFiles = projectContext.allFiles
			.filter((f) => f.path !== projectContext.currentFile?.path)
			.slice(0, 3);

		relatedFiles.forEach((file) => {
			prompt += `\n--- ${file.path} ---\n`;
			const preview = file.content.slice(0, 800);
			prompt += `\`\`\`\n${preview}${
				preview.length < file.content.length ? "\n..." : ""
			}\n\`\`\`\n`;
		});
		prompt += `\n`;
	}

	// Add the actual query
	prompt += `=== STUDENT QUERY ===\n`;
	prompt += `${query}\n\n`;

	prompt += `Provide a helpful, context-aware response that references the specific files and code shown above.`;

	return prompt;
}

/**
 * Generate AI response using Gemini
 */
export async function generateAIResponse(taskType, query, projectContext) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			generationConfig: {
				temperature: taskType === "hint" ? 0.7 : 0.4,
				topP: 0.95,
				topK: 40,
				maxOutputTokens: 2048,
			},
		});

		const prompt = buildContextPrompt(taskType, query, projectContext);

		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		return {
			success: true,
			response: text,
			tokensUsed: response.usageMetadata?.totalTokenCount || 0,
		};
	} catch (error) {
		console.error("Gemini API Error:", error);
		return {
			success: false,
			error: error.message,
			response: "Sorry, I encountered an error. Please try again.",
		};
	}
}

/**
 * Generate streaming AI response
 */
export async function generateAIResponseStream(
	taskType,
	query,
	projectContext
) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			generationConfig: {
				temperature: taskType === "hint" ? 0.7 : 0.4,
				topP: 0.95,
				topK: 40,
				maxOutputTokens: 2048,
			},
		});

		const prompt = buildContextPrompt(taskType, query, projectContext);

		const result = await model.generateContentStream(prompt);

		return result.stream;
	} catch (error) {
		console.error("Gemini Streaming Error:", error);
		throw error;
	}
}

/**
 * Quick code suggestions (like Copilot but context-aware)
 */
export async function getCodeSuggestions(
	currentCode,
	cursorPosition,
	projectContext
) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			generationConfig: {
				temperature: 0.3, // Lower for more predictable suggestions
				topP: 0.9,
				maxOutputTokens: 200,
			},
		});

		const lines = currentCode.split("\n");
		const currentLine = lines[cursorPosition.line] || "";
		const previousLines = lines
			.slice(Math.max(0, cursorPosition.line - 5), cursorPosition.line)
			.join("\n");

		const prompt = `You are an intelligent code completion assistant for ${projectContext.project.techStack.join(
			", "
		)}.

Project: ${projectContext.project.title}
Current file: ${projectContext.currentFile?.path || "unknown"}

Previous code:
\`\`\`
${previousLines}
\`\`\`

Current incomplete line:
\`\`\`
${currentLine}
\`\`\`

Provide ONLY the code completion for the current line. No explanations.
If the line seems complete, suggest the next logical line of code.
Consider the project context and follow the existing code style.`;

		const result = await model.generateContent(prompt);
		const suggestion = result.response.text().trim();

		return {
			success: true,
			suggestion: suggestion.replace(/```[\s\S]*?```/g, "").trim(),
		};
	} catch (error) {
		console.error("Code suggestion error:", error);
		return { success: false, suggestion: "" };
	}
}

/**
 * Analyze code complexity and suggest improvements
 */
export async function analyzeCodeComplexity(code, filePath, projectContext) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			generationConfig: {
				temperature: 0.3,
				topP: 0.95,
				maxOutputTokens: 1024,
			},
		});

		const prompt = `Analyze the code complexity and quality of this file:

File: ${filePath}
Project: ${projectContext.project.title}

\`\`\`
${code}
\`\`\`

Provide:
1. Complexity Score (1-10, where 10 is most complex)
2. Lines of Code
3. Potential Issues (max 3)
4. Quick Improvements (max 3)

Format as JSON:
{
  "complexityScore": number,
  "linesOfCode": number,
  "issues": ["issue1", "issue2"],
  "improvements": ["improvement1", "improvement2"]
}`;

		const result = await model.generateContent(prompt);
		const text = result.response.text();

		// Extract JSON from response
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return {
				success: true,
				analysis: JSON.parse(jsonMatch[0]),
			};
		}

		return { success: false, error: "Could not parse analysis" };
	} catch (error) {
		console.error("Complexity analysis error:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Generate commit message based on changes
 */
export async function generateCommitMessage(changes, projectContext) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			generationConfig: {
				temperature: 0.5,
				maxOutputTokens: 100,
			},
		});

		const changedFiles = changes
			.map((c) => `${c.type}: ${c.filePath}`)
			.join("\n");

		const prompt = `Generate a concise commit message (max 50 chars) for these changes:

${changedFiles}

Project: ${projectContext.project.title}

Follow conventional commits format (feat/fix/refactor/docs/etc).
ONLY output the commit message, nothing else.`;

		const result = await model.generateContent(prompt);
		const message = result.response.text().trim();

		return {
			success: true,
			message: message.split("\n")[0], // First line only
		};
	} catch (error) {
		console.error("Commit message generation error:", error);
		return { success: false, message: "Update code" };
	}
}

export default {
	generateAIResponse,
	generateAIResponseStream,
	getCodeSuggestions,
	analyzeCodeComplexity,
	generateCommitMessage,
};
