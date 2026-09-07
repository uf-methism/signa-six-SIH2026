/* VolunteerChatDrawer.tsx — Simulated in-app chat with community volunteers */
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone, Send, X, Wifi } from "lucide-react";
import type { Guide } from "@/lib/guidesData";

interface Message {
  id: string;
  from: "user" | "volunteer";
  text: string;
  time: string;
}

interface VolunteerChatDrawerProps {
  volunteer: Guide;
  onClose: () => void;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function VolunteerChatDrawer({ volunteer, onClose }: VolunteerChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      from: "volunteer",
      text: volunteer.chatReplies?.[0] ?? `Hi! I'm ${volunteer.name}. How can I help you today?`,
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const replyIndexRef = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      from: "user",
      text: trimmed,
      time: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate volunteer typing delay
    setIsTyping(true);
    const delay = 900 + Math.random() * 900;
    setTimeout(() => {
      const replies = volunteer.chatReplies ?? [];
      const idx = replyIndexRef.current;
      const replyText =
        replies[idx % replies.length] ??
        "I'm here to help! Feel free to ask me anything about Jaipur. 😊";
      replyIndexRef.current = idx + 1;

      const volMsg: Message = {
        id: `v-${Date.now()}`,
        from: "volunteer",
        text: replyText,
        time: nowTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, volMsg]);
    }, delay);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-enter"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#FAF8F5] shadow-2xl animate-enter">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-ink/10 bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-slate-100">
            <img src={volunteer.photo} alt={volunteer.name} className="h-full w-full object-cover" />
            {volunteer.available && (
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-bold leading-tight truncate">{volunteer.name}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-0.5">
              <Wifi size={10} />
              <span>{volunteer.availabilityText}</span>
            </div>
          </div>
          <a
            href={`tel:${volunteer.phone}`}
            className="rounded-xl bg-teal/10 p-2.5 text-teal hover:bg-teal hover:text-white transition border border-teal/20"
            title={`Call ${volunteer.name}`}
          >
            <Phone size={16} />
          </a>
          <button
            onClick={onClose}
            className="rounded-xl bg-paper p-2.5 text-ink/50 hover:bg-ink/8 transition"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
          <p className="text-[10px] text-amber-700 font-semibold text-center">
            🌟 Free Community Volunteer · Replies are simulated for demo purposes
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.from === "volunteer" && (
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-slate-100 mt-1">
                  <img src={volunteer.photo} alt={volunteer.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className={`max-w-[78%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.from === "user"
                      ? "bg-teal text-white rounded-tr-sm"
                      : "bg-white border border-ink/8 text-ink rounded-tl-sm shadow-sm"
                    }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-ink/35 font-medium px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 items-end">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-slate-100">
                <img src={volunteer.photo} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-ink/8 px-4 py-3 shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/40 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-ink/10 bg-white px-4 py-3">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask ${volunteer.name.split(" ")[0]} anything…`}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-ink/12 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-teal placeholder:text-ink/35 min-h-[42px] max-h-[120px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-white shadow-sm transition hover:bg-teal/90 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 justify-center">
            <MessageCircle size={10} className="text-ink/30" />
            <span className="text-[9px] text-ink/30 font-medium">
              Chat is free · No booking required
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
