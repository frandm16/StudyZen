import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    alt: string;
    title?: string;
}

export function ImageLightbox({ isOpen, onClose, src, alt, title }: ImageLightboxProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title || alt}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md transition-opacity sm:p-6"
        >
            <div className="relative flex max-h-[95vh] max-w-[95vw] flex-col items-center justify-center">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close image preview"
                    className="absolute -top-12 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-2xl">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-[85vh] max-w-[92vw] object-contain"
                    />
                </div>

                {title && (
                    <p className="mt-3 text-center text-xs font-medium text-white/80">
                        {title}
                    </p>
                )}
            </div>
        </div>
    );
}
