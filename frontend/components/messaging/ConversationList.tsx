"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { ConversationSummary } from "@/lib/messaging";
import { cn } from "@/lib/utils";

type Props = {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
};

export function ConversationList({ conversations, selectedId, onSelect, loading }: Props) {
  useAuth();

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--text-muted)] text-sm">
        No conversations yet. Start one from a job application or candidate profile.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex flex-col gap-0.5",
              selectedId === c.id && "bg-[var(--accent-dim)]/30"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-[var(--text)] truncate">{c.other_name}</span>
              {c.unread_count > 0 && (
                <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[var(--accent)] text-[#080808] text-xs font-semibold flex items-center justify-center">
                  {c.unread_count}
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--text-muted)] capitalize">{c.other_role}</span>
            {c.last_message_preview && (
              <p className="text-sm text-[var(--text-dim)] truncate mt-0.5">
                {c.last_message_preview}
              </p>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
