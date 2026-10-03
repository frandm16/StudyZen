import { useEffect, useId, useRef, type ReactNode } from 'react';

export const fieldClass =
    'w-full select-text rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm text-[#151414] ' +
    'placeholder:text-neutral-400 transition-colors hover:border-neutral-400 focus:border-[#151414] focus:outline-none ' +
    'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60';

export const primaryButton =
    'rounded-full bg-[#151414] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 ' +
    'disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'focus-visible:outline-[#151414]';

export const ghostButton =
    'rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-neutral-600 transition-colors ' +
    'hover:border-[#151414] hover:text-[#151414] disabled:cursor-not-allowed disabled:opacity-40 ' +
    'disabled:hover:border-neutral-300 disabled:hover:text-neutral-600';

const SIZES = {
    md: 'w-[min(92vw,30rem)]',
    lg: 'w-[min(94vw,36rem)]',
    xl: 'w-[min(95vw,52rem)]',
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
            className={`m-auto max-h-[92vh] ${SIZES[size]} overflow-auto rounded-2xl border-0 bg-white p-0 text-[#151414] shadow-2xl backdrop:bg-black/40`}
        >
            <div className="p-6 sm:p-8">
                <h2 id={titleId} className="font-pt text-2xl font-bold">
                    {title}
                </h2>
                <div className="mt-6">{children}</div>
            </div>
        </dialog>
    );
}