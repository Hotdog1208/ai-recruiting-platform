"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/messaging";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Props = {
  messages: Message[];
  loading?: boolean;
};

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageList({ messages, loading }: Props) {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-[var(--text-muted)] text-sm">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => {
        const isMe = currentUserId === m.sender_id;
        return (
          <div
            key={m.id}
            className={cn(
              "flex",
              isMe ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5",
                isMe
                  ? "bg-[var(--accent)] text-[#080808] rounded-br-md"
                  : "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] rounded-bl-md"
              )}
            >
              <p className="text-[15px] whitespace-pre-wrap break-words">{m.content}</p>
              <p className={cn(
                "text-[11px] mt-1",
                isMe ? "text-[#080808]/70" : "text-[var(--text-muted)]"
              )}>
                {formatTime(m.created_at)}
                {isMe && (m.read ? " · Read" : "")}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
