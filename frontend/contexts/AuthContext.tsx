"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { apiGet } from "@/lib/api";

type AuthState = {
  user: SupabaseUser | null;
  session: Session | null;
  role: "candidate" | "employer" | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  role: null,
  loading: true,
});

async function resolveRole(session: Session | null): Promise<"candidate" | "employer" | null> {
  if (!session?.user) return null;
  const metaRole = session.user.user_metadata?.role as "candidate" | "employer" | undefined;
  if (metaRole) return metaRole;
  const token = session?.access_token;
  try {
    const data = await apiGet<{ role: string }>(`/users/${session.user.id}`, token);
    return data.role === "employer" ? "employer" : "candidate";
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    if (!supabase) {
      const id = setTimeout(() => setState((s) => ({ ...s, loading: false })), 0);
      return () => clearTimeout(id);
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const role = await resolveRole(session);
      setState({
        user: session?.user ?? null,
        session,
        role,
        loading: false,
      });
    }).catch(() => {
      setState((s) => ({ ...s, loading: false }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const role = await resolveRole(session);
      setState({
        user: session?.user ?? null,
        session,
        role,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
