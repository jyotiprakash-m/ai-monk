
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, User, Bot } from "lucide-react";

interface ChatRagMessengerProps {
  card: {
    collection_name: string;
    database: string;
    file: string;
    type: string;
    created_at: string;
  };
  idx: number;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

const now = () => new Date().toLocaleString();
const initialMessages: Message[] = [
  { id: 1, text: "Hi! How can I help you with this collection?", sender: "ai", timestamp: now() },
  { id: 2, text: "Show me the latest documents.", sender: "user", timestamp: now() },
  { id: 3, text: "Here are the 3 most recent documents from your collection.", sender: "ai", timestamp: now() },
];

const ChatRagMessenger: React.FC<ChatRagMessengerProps> = ({ card, idx }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    const timestamp = now();
    setMessages((msgs) => [
      ...msgs,
      { id: msgs.length + 1, text: input, sender: "user", timestamp },
    ]);
    setInput("");
    setLoading(true);
    // Simulate AI response delay
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { id: msgs.length + 1, text: "(AI) Response to: " + input, sender: "ai", timestamp: now() },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b flex items-center gap-4">
        <MessageCircle className="text-blue-500 w-8 h-8 mr-2" />
        <div className="flex-1">
          <div className="font-bold text-xl">{card.collection_name || `Index ${idx + 1}`}</div>
          <div className="text-xs text-gray-500">Database: {card.database} | File: {card.file}</div>
        </div>
        <div className="text-xs text-gray-400">Created: {card.created_at}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col items-end gap-1 ${msg.sender === "user" ? "justify-end" : "items-start"}`}
          >
            <div className={`flex items-end gap-2 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "ai" && (
                <div className="flex-shrink-0">
                  <Bot className="w-7 h-7 text-blue-400 bg-white rounded-full border p-1" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2 max-w-[70%] text-sm shadow flex flex-col
                  ${msg.sender === "user" ? "bg-blue-500 text-white items-end" : "bg-white border text-gray-800 items-start"}`}
              >
                <span>{msg.text}</span>
              </div>
              {msg.sender === "user" && (
                <div className="flex-shrink-0">
                  <User className="w-7 h-7 text-gray-400 bg-white rounded-full border p-1" />
                </div>
              )}
            </div>
            <div className={`w-full`}>
              <span className={`text-xs text-gray-400 pl-10 pr-10 block ${msg.sender === "user" ? "text-right" : "text-left"}`}>{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 pl-10">
            <Bot className="w-7 h-7 text-blue-300 bg-white rounded-full border p-1" />
            <span className="text-sm text-gray-400 animate-pulse">AI is typing<span className="animate-bounce inline-block w-2">...</span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-8 py-6 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-blue-500 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-blue-600 transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRagMessenger;