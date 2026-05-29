// Minimal Toaster component using fixed positioning
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for when used outside provider
    return {
      toast: (t: Omit<Toast, 'id'>) => console.log('Toast:', t.title),
      toasts: [],
      dismiss: () => {},
    };
  }
  return ctx;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Expose globally via window for external use
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__checkmate_toast = toast;
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-elevated backdrop-blur-xl animate-fade-in',
              t.variant === 'error'
                ? 'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.3)] text-[#f1f5f9]'
                : t.variant === 'success'
                ? 'bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.3)] text-[#f1f5f9]'
                : 'bg-[rgba(20,20,42,0.9)] border-[rgba(148,163,184,0.15)] text-[#f1f5f9]'
            )}
          >
            {t.variant === 'error' ? (
              <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
            ) : t.variant === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#a855f7] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              {t.description && (
                <p className="text-xs text-[#94a3b8] mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[#94a3b8] hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function showToast(t: Omit<Toast, 'id'>) {
  (window as unknown as Record<string, (t: Omit<Toast, 'id'>) => void>).__checkmate_toast?.(t);
}
