import { apiGet, apiPost, apiPatch } from "@/lib/api";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string | null;
};

export type ConversationSummary = {
  id: string;
  other_user_id: string;
  other_name: string;
  other_role: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string | null;
};

export type ConversationWith = {
  id: string;
  other_user_id: string;
  other_name: string;
  other_role: string;
};

export async function listConversations(token: string | null): Promise<ConversationSummary[]> {
  return apiGet<ConversationSummary[]>("/messaging/conversations", token);
}

export async function getOrCreateConversation(
  otherUserId: string,
  token: string | null
): Promise<ConversationWith> {
  return apiGet<ConversationWith>(`/messaging/conversations/with/${otherUserId}`, token);
}

export async function listMessages(
  conversationId: string,
  token: string | null,
  before?: string,
  limit = 50
): Promise<Message[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  return apiGet<Message[]>(
    `/messaging/conversations/${conversationId}/messages?${params}`,
    token
  );
}

export async function sendMessage(
  conversationId: string,
  content: string,
  token: string | null
): Promise<Message> {
  return apiPost<Message>(
    `/messaging/conversations/${conversationId}/messages`,
    { content },
    token
  );
}

export async function markMessageRead(messageId: string, token: string | null): Promise<void> {
  await apiPatch(`/messaging/messages/${messageId}/read`, {}, token);
}
