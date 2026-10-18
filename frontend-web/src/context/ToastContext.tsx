import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { notificationService } from '../services/notification-service';
import { useTimerContext } from './TimerContext';

type ToastTone = 'success' | 'error' | 'warning' | 'info';
type ToastInput = { title: string; description?: string; tone?: ToastTone; duration?: number; persist?: boolean };
type ToastItem = ToastInput & { id: number; tone: ToastTone };

const ToastContext = createContext<{ notify: (toast: ToastInput) => void; outcome: (toast: ToastInput) => void } | null>(null);
let toastSequence = 0;
const icons = { success: Check, error: CircleAlert, warning: TriangleAlert, info: Info };
const toneStyles: Record<ToastTone, string> = {
    success: 'text-emerald-500 bg-emerald-500/10',
    error: 'text-rose-500 bg-rose-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    info: 'text-[var(--accent-color)] bg-[var(--accent-color)]/10',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const { sound } = useTimerContext();
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timers = useRef(new Map<number, number>());
    const remove = useCallback((id: number) => {
        const timer = timers.current.get(id);
        if (timer !== undefined) window.clearTimeout(timer);
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);
    const notify = useCallback((input: ToastInput) => {
        const id = ++toastSequence;
        const tone = input.tone ?? 'info';
        const toast = { ...input, id, tone };
        setToasts((current) => [...current.slice(-3), toast]);
        sound.playNotification(tone);
        timers.current.set(id, window.setTimeout(() => remove(id), input.duration ?? 5000));
    }, [remove]);
    const outcome = useCallback((input: ToastInput) => {
        const tone = input.tone ?? 'info';
        notify({ ...input, tone });
        if (input.persist === false) return;
        void notificationService.create({
            type: tone,
            title: input.title,
            body: input.description?.trim() || input.title,
        }).then(() => window.dispatchEvent(new Event('studyzen:notifications-changed'))).catch(() => undefined);
    }, [notify]);
    useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
    const liveRole = toasts.some((toast) => toast.tone === 'error') ? 'assertive' : 'polite';

    return <ToastContext.Provider value={{ notify, outcome }}>{children}<div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[min(24rem,calc(100vw-2rem))] sm:justify-end" aria-live={liveRole} aria-relevant="additions text" aria-atomic="false"><ul className="flex w-full max-w-sm flex-col gap-2">{toasts.map((toast) => {
        const Icon = icons[toast.tone];
        return <li key={toast.id} className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3.5 text-[var(--app-text)] shadow-xl motion-safe:animate-[toast-in_180ms_ease-out]">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneStyles[toast.tone]}`}><Icon size={17} /></span>
            <div className="min-w-0 flex-1"><p className="text-sm font-bold">{toast.title}</p>{toast.description && <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{toast.description}</p>}</div>
            <button type="button" onClick={() => remove(toast.id)} aria-label="Dismiss notification" className="rounded-lg p-1 text-[var(--app-text-muted)] hover:bg-[var(--app-bg)] focus-visible:outline-2 focus-visible:outline-[var(--accent-color)]"><X size={15} /></button>
        </li>;
    })}</ul></div></ToastContext.Provider>;
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context.outcome;
}
