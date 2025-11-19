import { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { getSocket } from "../socket.js";
import { Plus, X, Terminal as TerminalIcon } from "lucide-react";

const Terminal = ({ userId }) => {
  const [terminals, setTerminals] = useState([]);
  const [activeTerminalId, setActiveTerminalId] = useState("default");
  const terminalInstances = useRef(new Map());
  const containerRefs = useRef(new Map());
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️  Terminal: No userId provided");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.error("❌ Terminal: Socket not initialized");
      return;
    }

    const initialize = () => {
      if (terminalInstances.current.size > 0) return;
      console.log("🖥️  Initializing terminal for user:", userId);

      setTerminals([{ id: "default", name: "Terminal 1" }]);
      setTimeout(() => initializeTerminal("default"), 100);
    };

    if (socket.connected) initialize();
    else socket.once("connect", initialize);

    socket.on("terminal:data", ({ terminalId, data }) => {
      const instance = terminalInstances.current.get(terminalId);
      instance?.term?.write(data);
    });

    socket.on("terminal:closed", ({ terminalId }) => {
      handleServerTerminalClose(terminalId);
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners("terminal:data");
      socket.removeAllListeners("terminal:closed");
      terminalInstances.current.forEach(({ term }) => term.dispose());
      terminalInstances.current.clear();
    };
  }, [userId]);

  // ✅ Fully scroll-stable terminal initializer
  const initializeTerminal = (terminalId) => {
    const tryInit = () => {
      const container = containerRefs.current.get(terminalId);
      if (!container) return false;
      if (terminalInstances.current.has(terminalId)) return true;

      try {
        const term = new XTerminal({
          rows: 30,
          cols: 80,
          convertEol: true,
          cursorBlink: true,
          cursorStyle: "block",
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: 14,
          scrollback: 1000,
          theme: {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
            cursor: "#ffffff",
          },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(container);

        // 🧠 Step 1: Prevent xterm focus scroll
        setTimeout(() => {
          if (document.activeElement === container.querySelector("textarea")) {
            document.activeElement.blur();
          }
        }, 0);

        // 🧠 Step 2: Lock scroll at top temporarily during initialization
        const lockScroll = () => window.scrollTo({ top: 0, behavior: "auto" });
        window.addEventListener("scroll", lockScroll);

        // 🧠 Step 3: Fit terminal and restore scroll position
        setTimeout(() => {
          try {
            fitAddon.fit();
          } catch (err) {
            console.error("FitAddon error:", err);
          }
          window.scrollTo({ top: 0, behavior: "auto" });
          window.removeEventListener("scroll", lockScroll);
        }, 400);

        // Handle input
        term.onData((data) => {
          const socket = getSocket();
          if (socket?.connected) {
            socket.emit("terminal:write", { terminalId, input: data });
          }
        });

        terminalInstances.current.set(terminalId, { term, fitAddon });
        console.log(`✅ Terminal ${terminalId} initialized`);
        return true;
      } catch (err) {
        console.error("❌ Error initializing terminal:", err);
        return false;
      }
    };

    let attempts = 0;
    const maxAttempts = 10;
    const retry = () => {
      if (tryInit()) return;
      if (++attempts < maxAttempts) setTimeout(retry, 100);
    };
    retry();
  };

  const createNewTerminal = () => {
    if (terminals.length >= 5) {
      alert("Maximum 5 terminals allowed");
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) {
      alert("Socket not connected");
      return;
    }

    const terminalId = `terminal_${Date.now()}`;
    const name = `Terminal ${terminals.length + 1}`;
    setTerminals((prev) => [...prev, { id: terminalId, name }]);

    setTimeout(() => initializeTerminal(terminalId), 100);
    setActiveTerminalId(terminalId);

    socket.emit("terminal:create", { terminalId });
  };

  const handleServerTerminalClose = (terminalId) => {
    const instance = terminalInstances.current.get(terminalId);
    instance?.term?.dispose();
    terminalInstances.current.delete(terminalId);
    containerRefs.current.delete(terminalId);
    setTerminals((prev) => prev.filter((t) => t.id !== terminalId));
    if (activeTerminalId === terminalId) setActiveTerminalId("default");
  };

  const closeTerminal = (terminalId) => {
    if (terminalId === "default") {
      alert("Cannot close default terminal");
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) return;

    const instance = terminalInstances.current.get(terminalId);
    instance?.term?.dispose();
    terminalInstances.current.delete(terminalId);
    containerRefs.current.delete(terminalId);
    setTerminals((prev) => prev.filter((t) => t.id !== terminalId));
    if (activeTerminalId === terminalId) setActiveTerminalId("default");

    socket.emit("terminal:close", { terminalId });
  };

  // ✅ Focus only when switching, not on load
  const switchTerminal = (terminalId) => {
    setActiveTerminalId(terminalId);
    setTimeout(() => {
      const instance = terminalInstances.current.get(terminalId);
      if (instance?.fitAddon) {
        try {
          instance.fitAddon.fit();
          instance.term.focus();
        } catch {}
      }
    }, 100);
  };

  // Auto-fit on window resize
  useEffect(() => {
    const handleResize = () => {
      terminalInstances.current.forEach(({ fitAddon }) => {
        try {
          fitAddon.fit();
        } catch {}
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!userId)
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Waiting for user authentication...
      </div>
    );

  const socket = getSocket();
  if (!socket?.connected)
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Connecting to terminal...
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1e1e1e] border-b border-[#2d2d30] px-2 overflow-x-auto flex-shrink-0">
        {terminals.map((t) => (
          <div
            key={t.id}
            onClick={() => switchTerminal(t.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-t-md cursor-pointer whitespace-nowrap transition-all ${
              activeTerminalId === t.id
                ? "bg-[#252526] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TerminalIcon size={14} />
            <span>{t.name}</span>
            {t.id !== "default" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(t.id);
                }}
                className="text-gray-500 hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {/* New Terminal Button */}
        <button
          onClick={createNewTerminal}
          disabled={terminals.length >= 5}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-all ${
            terminals.length >= 5
              ? "text-gray-600 cursor-not-allowed"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Plus size={14} />
          <span>New</span>
        </button>
      </div>

      {/* Terminal Containers */}
      <div className="flex-1 relative overflow-hidden">
        {terminals.map((t) => (
          <div
            key={t.id}
            ref={(el) => el && containerRefs.current.set(t.id, el)}
            className="absolute inset-0 p-2 bg-[#1e1e1e]"
            style={{ display: activeTerminalId === t.id ? "block" : "none" }}
          />
        ))}
      </div>
    </div>
  );
};

export default Terminal;
