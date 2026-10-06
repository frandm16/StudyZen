import { useEffect, useId, useRef, type ReactNode } from 'react';

export const fieldClass =
    'w-full select-text rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2.5 text-sm text-[var(--app-text)] ' +
    'placeholder:text-[var(--app-text-muted)] transition-colors hover:border-[var(--accent-color)]/60 focus:border-[var(--accent-color)] focus:outline-none ' +
    'disabled:cursor-not-allowed disabled:opacity-50';

export const primaryButton =
    'cursor-pointer rounded-full bg-[var(--accent-color)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 ' +
    'disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'focus-visible:outline-[var(--accent-color)] shadow-md';

export const ghostButton =
    'cursor-pointer rounded-full border border-[var(--app-border)] px-5 py-2.5 text-sm text-[var(--app-text-muted)] transition-colors ' +
    'hover:border-[var(--accent-color)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-40';

const SIZES = {
    md: 'w-[min(94vw,34rem)] min-h-[440px]',
    lg: 'w-[min(95vw,44rem)] min-h-[560px]',
    xl: 'w-[min(96vw,58rem)] min-h-[640px]',
} as const;

interface ModalProps {
    title: string;
    onClose: () => void;
    size?: keyof typeof SIZES;
    children: ReactNode;
}

export function Modal({ title, onClose, size = 'md', children }: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className={`m-auto max-h-[92vh] ${SIZES[size]} flex flex-col overflow-auto rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-0 text-[var(--app-text)] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm`}
        >
            <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h2 id={titleId} className="font-pt text-2xl font-bold text-[var(--app-text)]">
                    {title}
                </h2>
                <div className="mt-6 flex flex-1 flex-col">{children}</div>
            </div>
        </dialog>
    );
}