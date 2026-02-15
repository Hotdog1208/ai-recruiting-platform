"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  listMessages,
  sendMessage,
  type Message,
  type ConversationWith,
} from "@/lib/messaging";
import { MessageList } from "./MessageList";
import { Button } from "@/components/ui/Button";

type Props = {
  conversation: ConversationWith;
  onSent?: () => void;
};

export function ChatWindow({ conversation, onSent }: Props) {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const load = useCallback(() => {
    if (!token || !conversation.id) return;
    setLoading(true);
    listMessages(conversation.id, token)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [conversation.id, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token || !conversation.id) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load, token, conversation.id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token || !conversation.id || sending) return;
    setSending(true);
    setInput("");
    try {
      const sent = await sendMessage(conversation.id, text, token);
      setMessages((prev) => [...prev, sent]);
      onSent?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)]">
      <div className="shrink-0 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] rounded-t-xl">
        <h3 className="font-semibold text-[var(--text)]">{conversation.other_name}</h3>
        <p className="text-xs text-[var(--text-muted)] capitalize">{conversation.other_role}</p>
      </div>
      <MessageList messages={messages} loading={loading} />
      <div className="shrink-0 p-3 border-t border-[var(--border)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-h-[2.5rem] px-4 py-2 rounded-[var(--radius-input)] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50"
            maxLength={10000}
          />
          <Button type="submit" disabled={sending || !input.trim()}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
