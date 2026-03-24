import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return; //to avoid blank msgs

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]); //to update UI

    const userInput = input;
    setInput("");

    try {
      const formattedMessages = [
        ...messages,
        userMessage
      ].map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          contents: formattedMessages
        },
        {
          // required for authentication
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyDqRPYl0Z_D1EcNflLoANW5T1lhbofLTSo"
          }
        }
      );

      // get actual text from API response 
      const botText =
        res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

        // to show AI reply in UI
      const botReply = {
        text: botText,
        sender: "bot"
      };

      setMessages(prev => [...prev, botReply]);

    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);

      setMessages(prev => [
        ...prev,
        { text: "⚠️ Error getting response from AI", sender: "bot" }
      ]);
    }
  };

  return (
  <div className="flex flex-col h-screen bg-gray-100">

    {/* Header */}
    <div className="bg-blue-500 underline text-white text-center p-4 text-3xl font-semibold shadow">
      Chat-Box
    </div>

    {/* Chat Area */}
    <div className="flex-1 overflow-y-auto px-3 py-4 md:px-10 space-y-3">

      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl shadow 
            max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%]
            break-words whitespace-pre-wrap
            ${
              msg.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}

    </div>

    {/* Input */}
    <div className="p-3 md:p-4 bg-white border-t flex gap-2 items-center">

      <input
        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />

      <button
        onClick={sendMessage}
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition"
      >
        Send
      </button>

    </div>
  </div>
  );
}

