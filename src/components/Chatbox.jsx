import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([ // store full chat history
    { text: "Hello! How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState(""); // store current type msgs
  const [loading, setLoading] = useState(false); 

  const sendMessage = async () => { // get response from api
    if (!input.trim()) return; // not able to snd empty msgs

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]); // optimistic ui updatet

    setInput("");
    setLoading(true);

    try {
      const formattedMessages = [ // maintain conversation 
        ...messages,
        userMessage
      ].map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          contents: formattedMessages
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyAgmbQHCBEcH7Xa2nrpu0YXpFXSGM1GyaE"
          }
        }
      );

      const botText =
        res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      const botReply = {
        text: botText,
        sender: "bot"
      };

      setMessages((prev) => [...prev, botReply]); // add bot reply

    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);

      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Error getting response from AI", sender: "bot" }
      ]);
    } finally {
      setLoading(false); 
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
        
        {messages.map((msg, i) => ( //render all msgs
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start" //alignment
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

        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 px-4 py-2 rounded-2xl shadow">
              Thinking...
            </div>
          </div>
        )}

      </div>

      {/* Input */}
      <div className="p-3 md:p-4 bg-white border-t flex gap-2 items-center">
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input} // control input and synced with state
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