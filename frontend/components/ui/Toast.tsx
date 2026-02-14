"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info" | "default";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastContextValue = {
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: "border-[var(--accent)]/50 bg-[var(--accent-dim)] text-[var(--text)]",
  error: "border-red-500/50 bg-red-500/10 text-red-200",
  info: "border-sky-500/50 bg-sky-500/10 text-sky-200",
  default: "border-white/10 bg-white/5 text-zinc-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="right">
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => !open && remove(t.id)}
            className={cn(
              "rounded-lg border p-4 shadow-lg grid gap-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full",
              typeStyles[t.type]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <ToastPrimitive.Title className="font-medium text-sm">
                  {t.title}
                </ToastPrimitive.Title>
                {t.description && (
                  <ToastPrimitive.Description className="text-xs opacity-90 mt-0.5">
                    {t.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close
                className="rounded p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </ToastPrimitive.Close>
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[380px] gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return {
    toast: (title: string, description?: string) =>
      ctx.add({ title, description, type: "default" }),
    success: (title: string, description?: string) =>
      ctx.add({ title, description, type: "success" }),
    error: (title: string, description?: string) =>
      ctx.add({ title, description, type: "error" }),
    info: (title: string, description?: string) =>
      ctx.add({ title, description, type: "info" }),
  };
}
