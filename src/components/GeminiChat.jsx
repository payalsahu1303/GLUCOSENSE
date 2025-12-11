import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LoaderCircle } from "lucide-react";
import ChatHistory from "./ChatHistory";
import { SendHorizontal } from "lucide-react";


const GeminiChat = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "bot",
      message: "Hi👋 I'm your AI Health Assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { type: "user", message: userInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const result = await model.generateContent(userInput);
      const response = await result.response;
      const botMessage = { type: "bot", message: response.text() };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", message: "⚠️ Something went wrong. Try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col max-w-lg mx-auto border rounded-lg shadow-md h-[40vh] bg-white">
    {/* Chat Display */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <ChatHistory chatHistory={chatHistory} />
        {loading && (
          <div className="flex items-start px-4 py-2 text-[#0f4656] bg-blue-100 rounded-lg">
            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
            <span>GlucoSense AI is typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

        {/* Input Box */}
        <div className="flex gap-2 p-3 border-t bg-gray-50">
        <input
            type="text"
            placeholder="Type your question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring"
        />
        <button
            onClick={sendMessage}
            className="p-2 text-gray-700 bg-[#d9d1ee] rounded-full hover:bg-[#b2acc2]"
        >
            <SendHorizontal className="w-5 h-5" />
        </button>
        </div>
    </div>
  );
};

export default GeminiChat;
