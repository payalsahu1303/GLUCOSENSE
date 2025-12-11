import React from "react";
import ReactMarkdown from "react-markdown";

const ChatHistory = ({ chatHistory }) => {
  return (
    <>
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`flex w-full ${message.type === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs p-3 rounded-xl text-sm ${
              message.type === "user"
                ? "bg-[#d9d1ee] text-gray-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <ReactMarkdown>{message.message}</ReactMarkdown>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatHistory;
