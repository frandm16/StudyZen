import { useEffect, useRef, type RefObject } from 'react';

interface UseSwipeGestureOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
    maxDuration?: number;
    disabled?: boolean;
}

export function useSwipeGesture<T extends HTMLElement>(
    ref: RefObject<T | null>,
    options: UseSwipeGestureOptions
) {
    const {
        onSwipeLeft,
        onSwipeRight,
        threshold = 50,
        maxDuration = 500,
        disabled = false,
    } = options;

    const startXRef = useRef<number | null>(null);
    const startYRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const isCancelledRef = useRef<boolean>(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || disabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) {
                isCancelledRef.current = true;
                return;
            }

            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.closest('input, textarea, select, button, [data-prevent-swipe="true"]') ||
                    target.closest('[role="dialog"]'))
            ) {
                isCancelledRef.current = true;
                return;
            }

            isCancelledRef.current = false;
            startXRef.current = e.touches[0].clientX;
            startYRef.current = e.touches[0].clientY;
            startTimeRef.current = Date.now();
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isCancelledRef.current || startXRef.current === null || startYRef.current === null) {
                return;
            }

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaY = Math.abs(currentY - startYRef.current);
            const deltaX = Math.abs(currentX - startXRef.current);

            if (deltaY > 60 && deltaY > deltaX * 1.5) {
                isCancelledRef.current = true;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (
                isCancelledRef.current ||
                startXRef.current === null ||
                startYRef.current === null
            ) {
                startXRef.current = null;
                startYRef.current = null;
                return;
            }

            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const deltaX = endX - startXRef.current;
            const deltaY = Math.abs(endY - startYRef.current);
            const duration = Date.now() - startTimeRef.current;

            startXRef.current = null;
            startYRef.current = null;

            if (duration > maxDuration) return;

            if (Math.abs(deltaX) >= threshold && Math.abs(deltaX) > deltaY * 1.2) {
                if (deltaX < 0 && onSwipeLeft) {
                    onSwipeLeft();
                } else if (deltaX > 0 && onSwipeRight) {
                    onSwipeRight();
                }
            }
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [ref, onSwipeLeft, onSwipeRight, threshold, maxDuration, disabled]);
}
