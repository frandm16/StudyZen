import { useCallback, useEffect, useRef, useState } from 'react';

export interface ShortcutActions {
    toggleStartPause?: () => void;
    skipSession?: () => void;
    finishSession?: () => void;
    toggleSettings?: () => void;
    openSetup?: () => void;
    toggleFullscreen?: () => void;
    openTimer?: () => void;
    openPlanner?: () => void;
    openStats?: () => void;
    openHistory?: () => void;
    toggleShortcutMenu?: () => void;
}

export interface ShortcutBinding {
    action: keyof ShortcutActions;
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
    { key: ' ', action: 'toggleStartPause' },
    { key: 'n', ctrl: true, shift: true, action: 'skipSession' },
    { key: 's', ctrl: true, action: 'finishSession' },
    { key: ',', ctrl: true, action: 'toggleSettings' },
    { key: 'z', ctrl: true, shift: true, action: 'openSetup' },
    { key: 'F11', action: 'toggleFullscreen' },
    { key: '1', ctrl: true, action: 'openTimer' },
    { key: '2', ctrl: true, action: 'openPlanner' },
    { key: '3', ctrl: true, action: 'openStats' },
    { key: '4', ctrl: true, action: 'openHistory' },
    { key: '/', action: 'toggleShortcutMenu' },
];

const STORAGE_KEY = 'studyzen_shortcuts';
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph']);

function isMacPlatform() {
    if (typeof navigator === 'undefined') return false;
    return /mac|iphone|ipad/.test((navigator.platform || navigator.userAgent).toLowerCase());
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable
        || Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));
}

function normalizeKey(key: string) {
    return key === 'Esc' ? 'Escape' : key;
}

function shortcutSignature(binding: Pick<ShortcutBinding, 'key' | 'ctrl' | 'shift' | 'alt' | 'meta'>) {
    const primaryModifier = isMacPlatform()
        ? Boolean(binding.ctrl || binding.meta)
        : Boolean(binding.ctrl);
    return [
        primaryModifier ? (isMacPlatform() ? 'cmd' : 'ctrl') : '',
        binding.shift ? 'shift' : '',
        binding.alt ? 'alt' : '',
        !isMacPlatform() && binding.meta ? 'meta' : '',
        normalizeKey(binding.key).toLowerCase(),
    ].join('+');
}

function eventToBinding(event: KeyboardEvent): Omit<ShortcutBinding, 'action'> {
    return {
        key: normalizeKey(event.key),
        ctrl: event.ctrlKey || undefined,
        shift: event.shiftKey || undefined,
        alt: event.altKey || undefined,
        meta: event.metaKey || undefined,
    };
}

function matchesBinding(event: KeyboardEvent, binding: ShortcutBinding, mapCtrlToMeta: boolean) {
    if (normalizeKey(event.key).toLowerCase() !== normalizeKey(binding.key).toLowerCase()) return false;

    const wantsCtrl = Boolean(binding.ctrl);
    const wantsShift = Boolean(binding.shift);
    const wantsAlt = Boolean(binding.alt);
    const wantsMeta = Boolean(binding.meta);

    if (event.shiftKey !== wantsShift) return false;
    if (event.altKey !== wantsAlt) return false;

    if (mapCtrlToMeta) {
        const wantsCommand = wantsCtrl || wantsMeta;
        const hasCommand = event.ctrlKey || event.metaKey;
        if (wantsCtrl && wantsMeta) {
            if (!event.ctrlKey || !event.metaKey) return false;
        } else if (hasCommand !== wantsCommand) {
            return false;
        }
        return true;
    }

    return event.ctrlKey === wantsCtrl && event.metaKey === wantsMeta;
}

function formatBinding(binding: ShortcutBinding) {
    const parts: string[] = [];
    if (isMacPlatform() && (binding.ctrl || binding.meta)) parts.push('Cmd');
    else if (binding.ctrl) parts.push('Ctrl');
    if (binding.shift) parts.push('Shift');
    if (binding.alt) parts.push('Alt');
    if (!isMacPlatform() && binding.meta) parts.push('Meta');
    parts.push(binding.key === ' ' ? 'Space' : binding.key);
    return parts.join('+');
}

function loadBindings(): ShortcutBinding[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SHORTCUTS.map((item) => ({ ...item }));
        const parsed = JSON.parse(raw) as Partial<Record<keyof ShortcutActions, Omit<ShortcutBinding, 'action'>>>;
        return DEFAULT_SHORTCUTS.map((item) => {
            const saved = parsed[item.action];
            if (!saved?.key) return { ...item };
            return {
                action: item.action,
                key: saved.key,
                ctrl: saved.ctrl || undefined,
                shift: saved.shift || undefined,
                alt: saved.alt || undefined,
                meta: saved.meta || undefined,
            };
        });
    } catch {
        return DEFAULT_SHORTCUTS.map((item) => ({ ...item }));
    }
}

function persistBindings(bindings: ShortcutBinding[]) {
    try {
        const payload: Partial<Record<keyof ShortcutActions, Omit<ShortcutBinding, 'action'>>> = {};
        for (const binding of bindings) {
            payload[binding.action] = {
                key: binding.key,
                ctrl: binding.ctrl,
                shift: binding.shift,
                alt: binding.alt,
                meta: binding.meta,
            };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
    }
}

export function useShortcuts(actions: ShortcutActions, enabled = true) {
    const actionsRef = useRef(actions);
    const [bindings, setBindings] = useState<ShortcutBinding[]>(loadBindings);
    const [capturingAction, setCapturingAction] = useState<keyof ShortcutActions | null>(null);
    const capturingActionRef = useRef<keyof ShortcutActions | null>(null);
    const bindingsRef = useRef(bindings);

    useEffect(() => {
        actionsRef.current = actions;
        capturingActionRef.current = capturingAction;
        bindingsRef.current = bindings;
    });

    const beginCapture = useCallback((action: keyof ShortcutActions) => {
        setCapturingAction(action);
    }, []);

    const cancelCapture = useCallback(() => {
        setCapturingAction(null);
    }, []);

    const resetShortcut = useCallback((action: keyof ShortcutActions) => {
        setBindings((current) => {
            const fallback = DEFAULT_SHORTCUTS.find((item) => item.action === action);
            if (!fallback) return current;
            const next = current.map((item) => item.action === action ? { ...fallback } : item);
            persistBindings(next);
            return next;
        });
        setCapturingAction(null);
    }, []);

    const resetAll = useCallback(() => {
        const next = DEFAULT_SHORTCUTS.map((item) => ({ ...item }));
        persistBindings(next);
        setBindings(next);
        setCapturingAction(null);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const onKeyDown = (event: KeyboardEvent) => {
            const capturing = capturingActionRef.current;

            if (capturing) {
                event.preventDefault();
                if (event.key === 'Escape') {
                    setCapturingAction(null);
                    return;
                }
                if (event.repeat || MODIFIER_KEYS.has(event.key)) return;

                const nextPartial = eventToBinding(event);
                const signature = shortcutSignature(nextPartial);
                const conflict = bindingsRef.current.some(
                    (item) => item.action !== capturing && shortcutSignature(item) === signature,
                );
                if (conflict) return;

                setBindings((current) => {
                    const next = current.map((item) => item.action === capturing
                        ? { action: capturing, ...nextPartial }
                        : item);
                    persistBindings(next);
                    return next;
                });
                setCapturingAction(null);
                return;
            }

            if (event.defaultPrevented || event.repeat || isEditableTarget(event.target)) return;

            const mapCtrlToMeta = isMacPlatform();
            const match = bindingsRef.current.find((item) => matchesBinding(event, item, mapCtrlToMeta));
            if (!match) return;

            const action = actionsRef.current[match.action];
            if (!action) return;

            event.preventDefault();
            action();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [enabled]);

    return {
        shortcuts: bindings.map((binding) => ({
            action: binding.action,
            key: formatBinding(binding),
        })),
        bindings,
        isCapturing: capturingAction !== null,
        capturingAction,
        beginCapture,
        cancelCapture,
        resetShortcut,
        resetAll,
    };
}
