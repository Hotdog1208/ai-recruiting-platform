"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  listConversations,
  getOrCreateConversation,
  type ConversationSummary,
  type ConversationWith,
} from "@/lib/messaging";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ChatWindow } from "@/components/messaging/ChatWindow";

export default function MessagesPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWith | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);

  const loadConversations = useCallback(() => {
    if (!token) {
      setConversations([]);
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    listConversations(token)
      .then(setConversations)
      .finally(() => setLoadingList(false));
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!withUserId || !token) {
      if (!withUserId) setSelectedConversation(null);
      return;
    }
    setLoadingConv(true);
    getOrCreateConversation(withUserId, token)
      .then((conv) => {
        setSelectedConversation(conv);
        setLoadingList(true);
        listConversations(token).then(setConversations).finally(() => setLoadingList(false));
      })
      .finally(() => setLoadingConv(false));
  }, [withUserId, token]);

  const handleSelectConversation = (conversationId: string) => {
    const summary = conversations.find((c) => c.id === conversationId);
    if (summary) {
      setSelectedConversation({
        id: summary.id,
        other_user_id: summary.other_user_id,
        other_name: summary.other_name,
        other_role: summary.other_role,
      });
    }
  };

  const selectedId = selectedConversation?.id ?? null;

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[400px] flex flex-col">
      <h1 className="text-xl font-semibold text-[var(--text)] mb-4">Messages</h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-secondary)]">
        <div className="md:col-span-1 flex flex-col min-h-0 border-r border-[var(--border)]">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
            loading={loadingList}
          />
        </div>
        <div className="md:col-span-2 flex flex-col min-h-0 p-2">
          {loadingConv ? (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
              Loading conversation…
            </div>
          ) : selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onSent={loadConversations}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
              Select a conversation or start one from a job application.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
