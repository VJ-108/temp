import { useState } from "react";
import socket from "../socket";

const CommandInput = ({ userId }) => {
	const [cmd, setCmd] = useState("");

	const runCommand = () => {
		if (!cmd.trim()) return;
		socket.emit("terminal:run", { command: cmd });
		setCmd("");
	};

	return (
		<div style={{ display: "flex", marginBottom: "5px" }}>
			<input
				type="text"
				value={cmd}
				onChange={(e) => setCmd(e.target.value)}
				placeholder="Enter command"
				style={{ flex: 1 }}
			/>
			<button onClick={runCommand}>Run</button>
		</div>
	);
};

export default CommandInput;
