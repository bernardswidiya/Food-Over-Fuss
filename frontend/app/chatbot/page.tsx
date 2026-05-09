"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendChatMessage, getMe, ChatMessage as ApiChatMessage } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarProvider";

// ── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;       // text shown in bubble (may be empty for image-only)
  apiContent?: string;   // text sent to API (includes default prompt)
  imageUrls?: string[];  // base64 compressed images
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

const ERROR_REPLY = "Maaf, terjadi kesalahan saat menghubungi asisten. Coba lagi sebentar ya! 🙏";
const IMAGE_ONLY_PROMPT = "Tolong analisa gambar ini dan rekomendasikan resep yang sesuai.";

// ── Compress image via Canvas ──────────────────────────────────────────────

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 800;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

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

// ── Avatars ────────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
        restaurant
      </span>
    </div>
  );
}

function UserAvatar({ picUrl }: { picUrl: string | null }) {
  if (picUrl) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100">
        <Image src={picUrl} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-muted text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
        person
      </span>
    </div>
  );
}

// ── AI Message with Markdown ───────────────────────────────────────────────

function AiBubble({ content }: { content: string }) {
  return (
    <div className="bg-white text-text-main border border-gray-100 shadow-sm rounded-3xl rounded-bl-md px-4 py-3 text-sm leading-relaxed prose prose-sm max-w-none
      prose-headings:font-heading prose-headings:text-text-main prose-headings:mb-2 prose-headings:mt-3
      prose-p:my-1 prose-p:leading-relaxed
      prose-strong:text-text-main prose-strong:font-bold
      prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
      prose-ol:my-1 prose-ol:pl-4
      prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs
      prose-hr:my-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

// ── Chat Header ───────────────────────────────────────────────────────────

function ChatHeader() {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3 z-10">
      {/* Hamburger — desktop only */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-muted hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Back button — mobile only */}
      <Link
        href="/dashboard"
        className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-text-main">arrow_back</span>
      </Link>

      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          restaurant
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-heading font-bold leading-tight">Foodie Assistant</h1>
        <p className="text-[11px] text-primary font-semibold">● Online · Siap bantu masak!</p>
      </div>
      <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-gray-100 transition-colors shrink-0">
        <span className="material-symbols-outlined text-xl">info</span>
      </button>
    </header>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

function ChatbotContent() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [userPicture, setUserPicture] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch user profile picture ───────────────────────────────────────────

  useEffect(() => {
    getMe().then((u) => setUserPicture(u.profile_picture)).catch(() => {});
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────────────────────

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

  // ── Remove one preview image ─────────────────────────────────────────────

  const removeImage = (idx: number) => {
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const typedText = inputValue.trim();
    const hasImages = uploadedImageUrls.length > 0;
    if ((!typedText && !hasImages) || isTyping) return;

    // What to show in the bubble vs what to send to API
    const displayContent = typedText;
    const apiContent = typedText || IMAGE_ONLY_PROMPT;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: displayContent,
      apiContent,
      imageUrls: hasImages ? [...uploadedImageUrls] : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setUploadedImageUrls([]);
    setIsTyping(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Build API history — exclude welcome message
    const history: ApiChatMessage[] = updatedMessages
      .filter((m) => m.id !== "welcome")
      .flatMap((m): ApiChatMessage[] => {
        if (m.role === "user") {
          const text = m.apiContent ?? m.content;
          if (m.imageUrls && m.imageUrls.length > 0) {
            return m.imageUrls.map((url, i) => ({
              role: "user",
              content: i === m.imageUrls!.length - 1 ? text : "",
              image_url: url,
            }));
          }
          return [{ role: "user", content: text }];
        }
        return [{ role: "assistant", content: m.content }];
      });

    let replyContent = ERROR_REPLY;
    try {
      const res = await sendChatMessage(history);
      replyContent = res.message;
    } catch {
      replyContent = ERROR_REPLY;
    }

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-ai`, role: "ai", content: replyContent },
    ]);
    setIsTyping(false);
  }, [inputValue, isTyping, uploadedImageUrls, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    const compressed = await Promise.all(files.map(compressImage));
    setUploadedImageUrls((prev) => [...prev, ...compressed]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-background-light font-body text-text-main">

      <ChatHeader />

      {/* ── Chat History ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">Hari ini</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "ai" && <BotAvatar />}

              <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>

                {/* Image grid */}
                {msg.imageUrls && msg.imageUrls.length > 0 && (
                  <div className={`grid gap-1.5 ${msg.imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {msg.imageUrls.map((url, i) => (
                      <div key={i} className={`overflow-hidden shadow-soft ${msg.role === "user" ? "rounded-3xl rounded-br-md" : "rounded-3xl rounded-bl-md"}`}>
                        <Image
                          src={url}
                          alt={`Foto ${i + 1}`}
                          width={200}
                          height={150}
                          className="object-cover block"
                          style={{ maxWidth: 200, maxHeight: 150 }}
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Text bubble — hidden if empty (image-only message) */}
                {msg.content && (
                  msg.role === "ai" ? (
                    <AiBubble content={msg.content} />
                  ) : (
                    <div className="bg-primary text-white rounded-3xl rounded-br-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-soft">
                      {msg.content}
                    </div>
                  )
                )}
              </div>

              {msg.role === "user" && <UserAvatar picUrl={userPicture} />}
            </div>
          ))}

          {isTyping && <TypingDots />}
          <div ref={chatBottomRef} className="h-1" />
        </div>
      </div>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-3 pb-5 safe-area-bottom">
        <div className="max-w-2xl mx-auto space-y-2">

          {/* Multi-image preview grid */}
          {uploadedImageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedImageUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      width={80}
                      height={64}
                      className="object-cover block"
                      style={{ width: 80, height: 64 }}
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[11px] leading-none">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-2.5 shadow-soft">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload foto bahan makanan"
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 mb-0.5 ${
                uploadedImageUrls.length > 0
                  ? "text-primary bg-primary/10"
                  : "text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20"
              }`}
            >
              <span className="material-symbols-outlined text-xl">photo_camera</span>
            </button>

            {/* multiple allows selecting many files at once */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <textarea
              ref={textareaRef}
              value={inputValue}
              rows={1}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={resizeTextarea}
              onKeyDown={handleKeyDown}
              placeholder={
                uploadedImageUrls.length > 0
                  ? "Tambahkan pertanyaan tentang foto ini..."
                  : "Tanya resep, atau tulis bahan yang kamu punya..."
              }
              className="flex-1 bg-transparent border-none resize-none text-sm text-text-main placeholder:text-muted focus:outline-none py-1.5 max-h-40 leading-relaxed"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={(!inputValue.trim() && uploadedImageUrls.length === 0) || isTyping}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 mb-0.5 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_upward
              </span>
            </button>
          </div>

          <p className="text-center text-[10px] text-muted">
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-mono">Enter</kbd> kirim ·{" "}
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-mono">Shift+Enter</kbd> baris baru ·{" "}
            <span className="text-primary font-medium">📷 bisa multi-foto</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper: Sidebar + Chat (desktop only sidebar) ───────────────────

export default function ChatbotPage() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen font-body text-text-main overflow-hidden">
        {/* Sidebar — desktop only, starts closed */}
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <ChatbotContent />
        </main>
      </div>
    </SidebarProvider>
  );
}
