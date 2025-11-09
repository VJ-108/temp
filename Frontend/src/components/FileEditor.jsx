// components/FileEditor.js
import { useState, useEffect } from "react";
import socket from "../socket";
import axios from "axios";
import AceEditor from "react-ace";
import { getFileMode } from "../utils/getFileMode";

import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";

const FileEditor = ({ userId, filePath }) => {
	const [content, setContent] = useState("");
	const [code, setCode] = useState("");
	const isSaved = content === code;

	// Fetch file content
	useEffect(() => {
		if (!filePath) return;
		const fetchContent = async () => {
			try {
				const res = await axios.get(
					`http://localhost:3000/files/content?userId=${userId}&path=${filePath}`
				);
				setContent(res.data.content);
			} catch (err) {
				console.error("Failed to load file:", err);
			}
		};
		fetchContent();
	}, [filePath, userId]);

	// Set code when content changes
	useEffect(() => {
		setCode(content);
	}, [content]);

	// Auto-save after 5 seconds of inactivity
	useEffect(() => {
		if (!isSaved && code) {
			const timer = setTimeout(() => {
				socket.emit("file:change", { path: filePath, content: code });
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [code, filePath, isSaved]);

	if (!filePath) return <div>Select a file to edit</div>;

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<p>
				{filePath.replaceAll("/", " > ")} {isSaved ? "Saved" : "Unsaved"}
			</p>
			<AceEditor
				width="100%"
				height="100%"
				mode={getFileMode({ selectedFile: filePath })}
				theme="github"
				value={code}
				onChange={(val) => setCode(val)}
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
				}}
			/>
		</div>
	);
};

export default FileEditor;
