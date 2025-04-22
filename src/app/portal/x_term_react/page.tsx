"use client";

import React, { useRef, useEffect, useState } from "react";
import "xterm/css/xterm.css";
import WebTerminal from "./addons/overlay";

const Terminal = () => {
  const xtermRef = useRef<any>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentInput, setCurrentInput] = useState("");
  const [highlighted, setHighlighted] = useState(false);


  useEffect(() => {
    const terminal = xtermRef.current;
    if (terminal) {
      terminal.terminal.writeln("Welcome to XTerm in Next.js!");
      terminal.terminal.write("> ");
    }
  }, []);

  const handleData = (data: string) => {
    const term = xtermRef.current?.terminal;
  
    switch (data) {
      case "\u0001": // Ctrl+A (simulate highlight all)
        setHighlighted(true);
        break;
  
      case "\u007F": // Backspace
      case "\u001B[3~": // Delete (if supported by terminal)
        if (highlighted) {
          setHighlighted(false);
        } else if (currentInput.length > 0) {
          term?.write("\b \b");
          setCurrentInput((prev) => prev.slice(0, -1));
        }
        break;
  
      case "\r": // Enter
        term?.write("\r\n");
        handleCommand(currentInput.trim());
        setCommandHistory((prev) => [...prev, currentInput]);
        setHistoryIndex(-1);
        setCurrentInput("");
        setHighlighted(false);
        term?.write("> ");
        break;
  
      case "\u001B[A": // Arrow Up
        if (commandHistory.length > 0) {
          const newIndex = Math.min(
            historyIndex + 1,
            commandHistory.length - 1
          );
          const cmd = commandHistory[commandHistory.length - 1 - newIndex];
          replaceInput(cmd as any);
          setHistoryIndex(newIndex);
        }
        break;
  
      case "\u001B[B": // Arrow Down
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const cmd = commandHistory[commandHistory.length - 1 - newIndex];
          replaceInput(cmd as any);
          setHistoryIndex(newIndex);
        } else {
          clearInput();
          setHistoryIndex(-1);
        }
        break;
  
      default:
        if (data >= " " && data <= "~") {
          if (highlighted) {
            clearInput(() => {
              term?.write(data);
              setCurrentInput(data);
            });
            setHighlighted(false);
          } else {
            term?.write(data);
            setCurrentInput((prev) => prev + data);
          }
        }
        break;
    }
  };
  

  const handleCommand = (input: string) => {
    const term = xtermRef.current?.terminal;
    if (!input) return;
  
    switch (input) {
      case "help":
        term?.writeln("Available commands: help, echo, clear, reset-line, reset-all");
        break;
  
      case "clear":
      case "reset-all":
        term?.clear();
        break;
  
      // case "reset-line":
      //   clearCurrentLine();
      //   break;
  
      default:
        if (input.startsWith("echo ")) {
          term?.writeln(input.slice(5));
        } else {
          term?.writeln(`Command not found: ${input}`);
        }
        break;
    }
  };
  

  const replaceInput = (text: string) => {
    clearInput(() => {
      xtermRef.current?.terminal.write(text);
      setCurrentInput(text);
    });
  };

  const clearInput = (callback?: () => void) => {
    const term = xtermRef.current?.terminal;
    for (let i = 0; i < currentInput.length; i++) {
      term?.write("\b \b");
    }
    setCurrentInput("");
    callback?.();
  };
  // style={{ height: "100%", width: "100%", backgroundColor: "#000", marginTop: "20px", marginLeft: "20px" }}

  return (
    // <div className="h-full w-full background-#000 mt-4 ml-2 mr-2">
    //   <XTerm
    //     className="h-full w-full"
    //     ref={xtermRef}
    //     onData={handleData}
    //     options={{
    //       fontSize: 14,
    //       theme: {
    //         background: "#000000",
    //         foreground: "#00FF00",
    //       },
    //     }}
    //   />
    // </div>
    <WebTerminal/>
  );
};

export default Terminal;
