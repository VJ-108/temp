import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
 
const EditorPage = () => {
  const [files, setFiles] = useState([
    { id: 1, name: "index.js", code: "// Start coding here" },
  ]);
  const [activeFileId, setActiveFileId] = useState(1);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [aiWidth, setAiWidth] = useState(300);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const commandHistory = useRef([]);
  const historyIndex = useRef(0);
  const currentCommand = useRef("");
  const aiEndRef = useRef(null);
 
  const isResizingAI = useRef(false);
  const isResizingTerminal = useRef(false);
 
  const activeFile = files.find((file) => file.id === activeFileId);
 
  // File operations
  const addFile = () => {
    const fileName = prompt("Enter file name (e.g., app.js)");
    if (fileName) {
      const newFile = { id: Date.now(), name: fileName, code: "// New file" };
      setFiles([...files, newFile]);
      setActiveFileId(newFile.id);
    }
  };
 
  const deleteFile = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
    if (updatedFiles.length > 0) setActiveFileId(updatedFiles[0].id);
    else setActiveFileId(null);
  };
 
  const updateCode = (newCode) => {
    setFiles(
      files.map((f) => (f.id === activeFileId ? { ...f, code: newCode } : f))
    );
  };
 
  // AI chat
  const sendMessage = () => {
    if (!aiInput.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: aiInput }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `You asked: "${aiInput}". This is a dummy AI reply.`,
        },
      ]);
    }, 500);
    setAiInput("");
  };
 
useEffect(() => {
  if (aiEndRef.current) {
    aiEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",   // only scroll inside container
      inline: "nearest"
    });
  }
}, [messages]);
 
  // AI resize
  const startAIResize = (e) => {
    e.preventDefault();
    isResizingAI.current = true;
    document.addEventListener("mousemove", handleAIResize);
    document.addEventListener("mouseup", stopAIResize);
  };
 
  const handleAIResize = (e) => {
    if (isResizingAI.current) {
      const newWidth = Math.min(
        Math.max(window.innerWidth - e.clientX, 200),
        600
      );
      setAiWidth(newWidth);
    }
  };
 
  const stopAIResize = () => {
    isResizingAI.current = false;
    document.removeEventListener("mousemove", handleAIResize);
    document.removeEventListener("mouseup", stopAIResize);
  };
 
  // Terminal resize
  const startTerminalResize = (e) => {
    e.preventDefault();
    isResizingTerminal.current = true;
    document.addEventListener("mousemove", handleTerminalResize);
    document.addEventListener("mouseup", stopTerminalResize);
  };
 
  const handleTerminalResize = (e) => {
    if (isResizingTerminal.current) {
      const newHeight = Math.min(
        Math.max(window.innerHeight - e.clientY, 100),
        500
      );
      setTerminalHeight(newHeight);
    }
  };
 
  const stopTerminalResize = () => {
    isResizingTerminal.current = false;
    document.removeEventListener("mousemove", handleTerminalResize);
    document.removeEventListener("mouseup", stopTerminalResize);
  };
 
  // Initialize xterm
  useEffect(() => {
    if (terminalOpen && terminalRef.current && !termInstance.current) {
      termInstance.current = new Terminal({
        cols: 80,
        rows: 15,
        theme: { background: "#1f2937", foreground: "#d1d5db" },
        cursorBlink: true,
      });
      termInstance.current.open(terminalRef.current);
      termInstance.current.writeln("Interactive Terminal ready...");
      termInstance.current.write("> ");
 
      termInstance.current.onKey(({ key, domEvent }) => {
        const printable =
          !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
 
        if (domEvent.key === "Enter") {
          termInstance.current.writeln("");
          if (currentCommand.current.trim() !== "") {
            termInstance.current.writeln(
              `Output: Dummy result for "${currentCommand.current}"`
            );
            commandHistory.current.push(currentCommand.current);
            historyIndex.current = commandHistory.current.length;
          }
          currentCommand.current = "";
          termInstance.current.write("> ");
        } else if (domEvent.key === "Backspace") {
          if (currentCommand.current.length > 0) {
            currentCommand.current = currentCommand.current.slice(0, -1);
            termInstance.current.write("\b \b");
          }
        } else if (domEvent.key === "ArrowUp") {
          if (historyIndex.current > 0) {
            historyIndex.current--;
            termInstance.current.write(
              "\x1b[2K\r> " + commandHistory.current[historyIndex.current]
            );
            currentCommand.current =
              commandHistory.current[historyIndex.current];
          }
        } else if (domEvent.key === "ArrowDown") {
          if (historyIndex.current < commandHistory.current.length - 1) {
            historyIndex.current++;
            termInstance.current.write(
              "\x1b[2K\r> " + commandHistory.current[historyIndex.current]
            );
            currentCommand.current =
              commandHistory.current[historyIndex.current];
          } else {
            historyIndex.current = commandHistory.current.length;
            termInstance.current.write("\x1b[2K\r> ");
            currentCommand.current = "";
          }
        } else if (printable) {
          currentCommand.current += key;
          termInstance.current.write(key);
        }
      });
    }
  }, [terminalOpen]);
 
  return (
    <div className="flex flex-col h-[90vh] mt-[74px] bg-gray-800 relative">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
               {sidebarOpen && (
          <div className="bg-gray-900 text-white w-64 flex flex-col border-r border-gray-700 shadow-lg z-40 transition-all duration-300">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <h2 className="font-bold text-lg">📂 Files</h2>
              <button onClick={addFile} className="px-3 py-1 bg-green-600 rounded hover:bg-green-500 transition">+</button>
            </div>
 
            <ul className="flex-1 overflow-y-auto">
              {files.map((file) => (
                <li key={file.id} className={`group flex items-center justify-between px-4 py-2 cursor-pointer transition relative ${file.id === activeFileId ? "bg-gray-700" : "hover:bg-gray-800"}`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <span>{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                    className="absolute right-3 text-red-400 hover:text-red-200 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
 
            <div className="flex flex-col p-3 gap-2">
              <button onClick={() => setAiOpen(!aiOpen)} className="p-2 bg-blue-600 rounded hover:bg-blue-500 transition shadow">
                {aiOpen ? "Close AI" : "Open AI"}
              </button>
              <button onClick={() => setTerminalOpen(!terminalOpen)} className="p-2 bg-purple-600 rounded hover:bg-purple-500 transition shadow">
                {terminalOpen ? "Close Terminal" : "Open Terminal"}
              </button>
            </div>
          </div>
        )}
 
        {/* Sidebar toggle button */}
        <button
          className="absolute top-3 left-3 p-2 bg-gray-700 rounded md:hidden z-50 hover:bg-gray-600"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        {/* Editor + AI */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            {activeFile ? (
              <MonacoEditor
                width="100%"
                height={`calc(100% - ${terminalOpen ? terminalHeight : 0}px)`}
                language="javascript"
                theme="vs-dark"
                value={activeFile.code}
                onChange={updateCode}
                options={{ automaticLayout: true }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No file open
              </div>
            )}
 
            {/* AI Assistant */}
            {aiOpen && (
              <div
                className="absolute top-0 right-0 h-full bg-gray-900 border-l border-gray-700 flex flex-col shadow-xl z-40"
                style={{ width: aiWidth, minWidth: 240 }}
              >
                <div
                  onMouseDown={startAIResize}
                  className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-gray-600 hover:bg-blue-400 z-50"
                />
                <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                  <h2 className="text-white font-bold text-lg">
                    🤖 AI Assistant
                  </h2>
                  <button
                    onClick={() => setAiOpen(false)}
                    className="text-red-400 hover:text-red-200 font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[85%] px-3 py-2 rounded-lg shadow ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-gray-700 text-gray-200 mr-auto"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={aiEndRef} />
                </div>
                <div className="p-3 border-t border-gray-700 flex gap-2 bg-gray-800">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 rounded bg-gray-700 text-white outline-none"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition shadow"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
 
          {/* Terminal */}
          {terminalOpen && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex flex-col shadow-inner"
              style={{ height: terminalHeight, minHeight: 100 }}
            >
              <div
                onMouseDown={startTerminalResize}
                className="h-2 cursor-row-resize bg-gray-700 hover:bg-blue-600"
              />
              <div ref={terminalRef} className="flex-1 overflow-y-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default EditorPage;
