import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, LoaderCircle, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../services/api';
import { notificationService } from '../../services/notification-service';
import type { AppNotification } from '../../types/notification';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]';

const relativeTime = (value: string) => {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) return 'Recently';
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days < 7 ? `${days}d ago` : new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function NotificationCenter() {
    const { user } = useAuth();
    const notify = useToast();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const refreshCount = useCallback(async () => {
        if (!user) return;
        try {
            setUnreadCount(await notificationService.getUnreadCount());
        } catch {
            return;
        }
    }, [user]);

    const refreshItems = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setLoadFailed(false);
        try {
            const [nextItems, count] = await Promise.all([notificationService.getAll(), notificationService.getUnreadCount()]);
            setItems(nextItems);
            setUnreadCount(count);
        } catch (cause) {
            setLoadFailed(true);
            notify({ title: 'Could not load notification history', description: getApiErrorMessage(cause), tone: 'error', persist: false });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        setItems([]);
        setUnreadCount(0);
        if (user) void refreshCount();
    }, [user, refreshCount]);

    useEffect(() => {
        const refresh = () => { void refreshCount(); if (open) void refreshItems(); };
        window.addEventListener('studyzen:notifications-changed', refresh);
        return () => window.removeEventListener('studyzen:notifications-changed', refresh);
    }, [open, refreshCount, refreshItems]);

    useEffect(() => {
        if (!open) return;
        void refreshItems();
        const onPointerDown = (event: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, refreshItems]);

    const markRead = async (item: AppNotification) => {
        if (item.read) return;
        setBusyId(item.id);
        try {
            await notificationService.markRead(item.id);
            setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
            await refreshCount();
        } catch (cause) {
            notify({ title: 'Could not update notification', description: getApiErrorMessage(cause), tone: 'error', persist: false });
        } finally {
            setBusyId(null);
        }
    };

    const markAllRead = async () => {
        setLoading(true);
        try {
            await notificationService.markAllRead();
            await refreshItems();
        } catch (cause) {
            notify({ title: 'Could not mark notifications as read', description: getApiErrorMessage(cause), tone: 'error', persist: false });
            setLoading(false);
        }
    };

    const remove = async (id: number) => {
        setBusyId(id);
        try {
            await notificationService.delete(id);
            setItems((current) => current.filter((item) => item.id !== id));
            await refreshCount();
        } catch (cause) {
            notify({ title: 'Could not delete notification', description: getApiErrorMessage(cause), tone: 'error', persist: false });
        } finally {
            setBusyId(null);
        }
    };

    if (!user) return null;

    return <div className="relative" ref={rootRef}>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={open} aria-controls="notification-panel" className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--app-text)] transition-colors hover:bg-neutral-500/10 ${focusRing}`}>
            <Bell size={19} aria-hidden="true" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        {open && <section id="notification-panel" aria-label="Notification history" className="absolute right-0 top-12 z-[70] flex max-h-[min(34rem,calc(100vh-6rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text)] shadow-2xl">
            <header className="flex items-center justify-between border-b border-[var(--app-border)] p-4"><div><h2 className="font-bold">Notifications</h2><p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Your recent activity and updates</p></div><div className="flex items-center gap-1">{unreadCount > 0 && <button type="button" onClick={() => void markAllRead()} disabled={loading} className={`rounded-lg p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-bg)] hover:text-[var(--accent-color)] disabled:opacity-50 ${focusRing}`} aria-label="Mark all notifications as read" title="Mark all as read"><CheckCheck size={17} /></button>}<button type="button" onClick={() => setOpen(false)} className={`rounded-lg p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-bg)] ${focusRing}`} aria-label="Close notifications"><X size={17} /></button></div></header>
            {loadFailed && <div className="flex justify-end border-b border-[var(--app-border)] px-4 py-2"><button type="button" onClick={() => void refreshItems()} className="text-xs font-semibold text-[var(--accent-color)] underline">Retry loading notifications</button></div>}
            <div className="overflow-y-auto overscroll-contain">
                {loading && items.length === 0 ? <div className="flex items-center justify-center gap-2 p-8 text-sm text-[var(--app-text-muted)]"><LoaderCircle size={16} className="animate-spin" /> Loading notifications…</div> : items.length === 0 ? <div className="p-8 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]"><Bell size={19} /></span><p className="mt-3 text-sm font-semibold">You’re all caught up</p><p className="mt-1 text-xs text-[var(--app-text-muted)]">Important updates will show up here.</p></div> : <ul className="divide-y divide-[var(--app-border)]">{items.map((item) => <li key={item.id} className={`group relative px-4 py-3.5 ${item.read ? '' : 'bg-[var(--accent-color)]/[0.045]'}`}>
                    <div className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? 'bg-transparent' : 'bg-[var(--accent-color)]'}`} aria-hidden="true" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{item.title}</p><time className="shrink-0 pt-0.5 text-[10px] text-[var(--app-text-muted)]" dateTime={item.createdAt}>{relativeTime(item.createdAt)}</time></div>{item.body && <p className="mt-1 text-xs leading-relaxed text-[var(--app-text-muted)]">{item.body}</p>}<div className="mt-2 flex items-center gap-3"><span className="text-[10px] font-medium capitalize text-[var(--app-text-muted)]">{item.type}</span>{!item.read && <button type="button" onClick={() => void markRead(item)} disabled={busyId === item.id} className={`text-[10px] font-semibold text-[var(--accent-color)] hover:underline disabled:opacity-50 ${focusRing}`}>Mark as read</button>}</div></div><button type="button" onClick={() => void remove(item.id)} disabled={busyId === item.id} className={`rounded-lg p-1.5 text-[var(--app-text-muted)] opacity-60 hover:bg-rose-500/10 hover:text-rose-500 focus:opacity-100 disabled:opacity-40 ${focusRing}`} aria-label={`Delete notification: ${item.title}`}><Trash2 size={14} /></button></div>
                </li>)}</ul>}
            </div>
        </section>}
    </div>;
}
