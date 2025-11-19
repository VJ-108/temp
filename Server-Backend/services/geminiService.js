// Server-Backend/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System prompts for different task types
 */
const SYSTEM_PROMPTS = {
	debug: `You are an expert debugging assistant for MERN stack projects. 
Your role is to:
1. Identify bugs and errors in code
2. Explain WHY the error occurs (not just what)
3. Provide step-by-step fixes
4. Suggest preventive measures
5. Reference related files in the project when relevant

Keep responses concise but thorough. Use code examples when helpful.`,

	review: `You are a senior code reviewer for MERN stack projects.
Your role is to:
1. Assess code quality and adherence to best practices
2. Identify security vulnerabilities
3. Suggest performance optimizations
4. Check for proper error handling
5. Evaluate code maintainability

Provide constructive feedback with specific examples.`,

	hint: `You are a patient coding mentor helping students learn by doing.
Your role is to:
1. Give subtle hints without revealing the complete solution
2. Ask guiding questions to help students think
3. Break down complex problems into smaller steps
4. Encourage exploration and experimentation
5. Build confidence through progressive learning

NEVER give complete solutions - only hints and guidance.`,

	test: `You are a testing expert for MERN stack applications.
Your role is to:
1. Generate comprehensive test cases
2. Cover happy paths, edge cases, and error scenarios
3. Write clean, maintainable test code
4. Follow testing best practices
5. Explain what each test validates

Use the appropriate testing framework (Jest, Mocha, etc.) for the project.`,

	explain: `You are a technical educator specializing in MERN stack development.
Your role is to:
1. Explain concepts clearly with real-world analogies
2. Provide practical examples students can relate to
3. Break down complex topics into digestible parts
4. Highlight common mistakes and misconceptions
5. Connect concepts to the current project context

Make learning engaging and accessible.`,

	refactor: `You are a code quality expert specializing in clean code principles.
Your role is to:
1. Suggest refactoring improvements for better readability
2. Apply SOLID principles and design patterns
3. Reduce code duplication and complexity
4. Improve naming conventions and structure
5. Maintain functionality while improving quality

Explain the reasoning behind each suggestion.`,

	optimize: `You are a performance optimization specialist for web applications.
Your role is to:
1. Identify performance bottlenecks
2. Suggest database query optimizations
3. Recommend caching strategies
4. Improve rendering performance
5. Reduce bundle size and load times

Provide measurable improvements and explain trade-offs.`,

	security: `You are a security expert for web applications.
Your role is to:
1. Identify security vulnerabilities (XSS, SQL injection, CSRF, etc.)
2. Suggest secure coding practices
3. Review authentication and authorization logic
4. Check for sensitive data exposure
5. Recommend security improvements

Prioritize critical vulnerabilities and explain the risks.`,
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
