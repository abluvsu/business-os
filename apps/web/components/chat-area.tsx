"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowRight, Terminal } from "lucide-react";
import { ChartConfig } from "./visualization-panel";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface ChatAreaProps {
  onUpdateVisualization: (chart: ChartConfig | null, recommendations: string[]) => void;
}

const API_BASE = "http://127.0.0.1:4000";

export default function ChatArea({ onUpdateVisualization }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Hello! I am your local Business OS AI assistant. I have connected to your active Instagram container. Try asking me: **'How are my last 5 campaigns?'** and I will compile a metric analysis report and chart for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      const assistantMessageId = `a-${Date.now()}`;
      const fullText = data.text;
      
      // Initialize empty assistant message
      setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", text: "" }]);

      // Simulate streaming/typing effect for a premium feel
      let currentIdx = 0;
      const speed = 10; // ms per character
      const timer = setInterval(() => {
        if (currentIdx < fullText.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, text: fullText.slice(0, currentIdx + 1) }
                : msg
            )
          );
          currentIdx++;
        } else {
          clearInterval(timer);
          setLoading(false);
          // Pass the chart metadata to parent dashboard
          onUpdateVisualization(data.chart, data.recommendations);
        }
      }, speed);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "⚠️ Connection to local LLM gateway timed out. Please ensure Fastify server is running on port 4000.",
        },
      ]);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-full flex flex-col bg-[#070709] border-r border-white/5">
      {/* Scrollable Chat Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-2xl ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar indicator */}
            <div
              className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                msg.role === "user"
                  ? "bg-white/10 border-white/20 text-neutral-300"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              {msg.role === "user" ? "ME" : "AI"}
            </div>

            {/* Message Bubble */}
            <div
              className={`p-4 rounded-xl text-sm leading-relaxed border ${
                msg.role === "user"
                  ? "bg-white/3 border-white/5 text-neutral-200"
                  : "bg-[#0b0b0e] border-white/5 text-neutral-300"
              }`}
            >
              {/* Basic Markdown rendering for bold text in mock answers */}
              <p className="whitespace-pre-line">
                {msg.text.split("**").map((chunk, idx) =>
                  idx % 2 === 1 ? <strong key={idx} className="text-white font-semibold">{chunk}</strong> : chunk
                )}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex gap-4 max-w-2xl mr-auto">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-xs font-bold font-mono">
              AI
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#0b0b0e] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 flex flex-wrap gap-2 border-t border-white/5 bg-[#08080a]">
          <button
            onClick={() => sendMessage("How are my last 5 campaigns?")}
            className="flex items-center gap-2 text-xs border border-white/10 hover:border-blue-500/30 bg-white/3 hover:bg-blue-500/5 text-neutral-400 hover:text-blue-400 px-3 py-1.5 rounded-lg transition-all font-mono group"
          >
            <Sparkles className="h-3 w-3 text-yellow-400" />
            "How are my last 5 campaigns?"
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}

      {/* Input panel */}
      <div className="p-4 bg-[#08080a] border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            required
            disabled={loading}
            placeholder="Ask anything about your campaigns, CTR, or channels..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-white/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-neutral-200 hover:bg-white disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-600 h-11 w-11 rounded-xl flex items-center justify-center transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
