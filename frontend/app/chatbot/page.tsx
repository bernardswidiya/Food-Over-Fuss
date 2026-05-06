"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "ai",
    content:
      "Halo! Saya Foodie Assistant 🍳 Ceritakan bahan makanan yang kamu punya, atau tanyakan ide menu apa pun — saya siap bantu carikan resep yang pas!",
  },
];

const MOCK_REPLY =
  "Ini adalah balasan sementara. Backend AI sedang disiapkan! Nantikan fitur rekomendasi resep berbasis AI yang canggih ya! 🚀";

// ── Typing Indicator ───────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex gap-3 justify-start items-end">
      <BotAvatar />
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl rounded-bl-lg px-5 py-4 flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-2 h-2 bg-muted rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span
        className="material-symbols-outlined text-primary text-lg"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        restaurant
      </span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <span
        className="material-symbols-outlined text-muted text-lg"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        person
      </span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll to latest message ───────────────────────────────────────

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  // ── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: uploadedFileName ? `📷 ${uploadedFileName}\n${content}` : content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setUploadedFileName(null);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const aiMsg: Message = {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: MOCK_REPLY,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  }, [inputValue, isTyping, uploadedFileName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    e.target.value = "";
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background-light font-body text-text-main">

      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-text-main">arrow_back</span>
        </Link>

        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-primary text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            restaurant
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-heading font-bold leading-tight">Foodie Assistant</h1>
          <p className="text-[11px] text-primary font-semibold">● Online · Siap bantu masak!</p>
        </div>

        {/* Info button (placeholder) */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-gray-100 transition-colors shrink-0">
          <span className="material-symbols-outlined text-xl">info</span>
        </button>
      </header>

      {/* ── Chat History ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* Date separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">
              Hari ini
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && <BotAvatar />}

              <div
                className={`
                  max-w-[80%] sm:max-w-[70%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                  ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-3xl rounded-br-md shadow-soft"
                      : "bg-white text-text-main border border-gray-100 shadow-sm rounded-3xl rounded-bl-md"
                  }
                `}
              >
                {msg.content}
              </div>

              {msg.role === "user" && <UserAvatar />}
            </div>
          ))}

          {/* AI typing indicator */}
          {isTyping && <TypingDots />}

          {/* Scroll anchor */}
          <div ref={chatBottomRef} className="h-1" />
        </div>
      </div>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-5 safe-area-bottom">
        <div className="max-w-2xl mx-auto space-y-2">

          {/* Image preview pill */}
          {uploadedFileName && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-4 py-2 w-fit max-w-full">
              <span
                className="material-symbols-outlined text-primary text-base shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                image
              </span>
              <span className="text-xs font-medium text-text-main truncate">{uploadedFileName}</span>
              <button
                type="button"
                onClick={() => setUploadedFileName(null)}
                className="text-muted hover:text-red-500 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2 bg-surface rounded-3xl border border-gray-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-2.5">

            {/* Camera / Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload foto bahan makanan (Snap-to-Recipe)"
              className="w-9 h-9 flex items-center justify-center rounded-full text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-all shrink-0 mb-0.5"
            >
              <span className="material-symbols-outlined text-xl">photo_camera</span>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              rows={1}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={resizeTextarea}
              onKeyDown={handleKeyDown}
              placeholder="Tanya resep, atau tulis bahan yang kamu punya..."
              className="flex-1 bg-transparent border-none resize-none text-sm text-text-main placeholder:text-muted focus:outline-none py-1.5 max-h-40 leading-relaxed"
            />

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 mb-0.5 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover"
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                arrow_upward
              </span>
            </button>
          </div>

          {/* Hint text */}
          <p className="text-center text-[10px] text-muted">
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-mono">Enter</kbd> kirim ·{" "}
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-mono">Shift+Enter</kbd> baris baru ·{" "}
            <span className="text-primary font-medium">📷 untuk Snap-to-Recipe</span>
          </p>
        </div>
      </div>
    </div>
  );
}
