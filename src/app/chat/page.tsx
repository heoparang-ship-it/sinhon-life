"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QUICK_QUESTIONS } from "@/lib/constants";
import type { ChatMessage, ChatBubble } from "@/lib/types";

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[-*]\s/gm, "")
    .replace(/^\d+\.\s/gm, "")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1");
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayBubbles, setDisplayBubbles] = useState<ChatBubble[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [displayBubbles, showTyping, scrollToBottom]);

  const showBubblesSequentially = useCallback(async (text: string, messageId: string) => {
    const cleaned = stripMarkdown(text);
    const parts = cleaned.split(/\n\n+/).filter((p) => p.trim());
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        setShowTyping(true);
        await new Promise((r) => setTimeout(r, Math.min(600 + parts[i].length * 8, 1200)));
        setShowTyping(false);
      }
      setDisplayBubbles((prev) => [...prev, { id: `${messageId}-${i}`, text: parts[i].trim(), isVisible: true }]);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setDisplayBubbles((prev) => [...prev, { id: userMsg.id, text: userMsg.content, isVisible: true }]);
    setInput("");
    setIsLoading(true);
    setShowTyping(true);
    try {
      const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: allMessages }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "응답을 받지 못했어요");
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: data.message, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
      setShowTyping(false);
      await showBubblesSequentially(data.message, assistantMsg.id);
    } catch (err) {
      setShowTyping(false);
      const errorMsg = err instanceof Error ? err.message : "네트워크 오류가 발생했어요";
      setDisplayBubbles((prev) => [...prev, { id: `error-${Date.now()}`, text: errorMsg, isVisible: true }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, showBubblesSequentially]);

  useEffect(() => {
    if (initialQuery && !hasSentInitial) { setHasSentInitial(true); sendMessage(initialQuery); }
  }, [initialQuery, hasSentInitial, sendMessage]);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <header className="flex items-center gap-3 px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        <Link href="/" className="text-warm-text-secondary active:scale-90 transition-transform"><ArrowLeft size={20} /></Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">신</span>
          </div>
          <div>
            <h1 className="text-sm font-bold">신혼생활 AI</h1>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              <p className="text-[10px] text-mint font-medium">응답 가능</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-warm-bg">
        {displayBubbles.length === 0 && !showTyping && (
          <div className="space-y-4">
            <div className="animate-bubble-in">
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] border border-warm-border shadow-sm">
                <p className="text-sm leading-relaxed">안녕하세요! 신혼생활 상담사예요.</p>
              </div>
            </div>
            <div className="animate-bubble-in" style={{ animationDelay: "0.5s", opacity: 0 }}>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] border border-warm-border shadow-sm">
                <p className="text-sm leading-relaxed">새집 마련, 공공임대, 출산 지원금 등 궁금한 거 편하게 물어봐주세요!</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="block w-full text-left bg-white border border-coral/15 rounded-xl px-4 py-3 text-[13px] text-coral font-medium active:scale-[0.98] transition-transform hover:bg-coral-50">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {displayBubbles.map((bubble) => {
          const role = bubble.id.startsWith("error") ? "assistant"
            : messages.find((m) => bubble.id === m.id)?.role ?? (messages.find((m) => bubble.id.startsWith(m.id))?.role ?? "assistant");
          return (
            <div key={bubble.id} className={`flex ${role === "user" ? "justify-end" : "justify-start"} animate-bubble-in`}>
              <div className={`max-w-[85%] px-4 py-3 ${role === "user" ? "bg-coral text-white rounded-2xl rounded-tr-md" : "bg-white rounded-2xl rounded-tl-md border border-warm-border shadow-sm"}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{bubble.text}</p>
              </div>
            </div>
          );
        })}
        {showTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 border border-warm-border shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-warm-text-muted typing-dot" />
                <div className="w-2 h-2 rounded-full bg-warm-text-muted typing-dot" />
                <div className="w-2 h-2 rounded-full bg-warm-text-muted typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-warm-border pb-safe">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="궁금한 거 뭐든 물어보세요" className="flex-1 bg-warm-bg rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-coral/30 placeholder:text-warm-text-muted" disabled={isLoading} />
        <button type="submit" disabled={!input.trim() || isLoading} className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return <Suspense fallback={null}><ChatContent /></Suspense>;
}
