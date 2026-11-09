import { useEffect, useRef, useState, useCallback } from 'react';

export function useWakeLock(enabled: boolean) {
    const sentinelRef = useRef<WakeLockSentinel | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsSupported('wakeLock' in navigator);
    }, []);

    const requestLock = useCallback(async () => {
        if (!('wakeLock' in navigator) || sentinelRef.current) return;
        try {
            const sentinel = await navigator.wakeLock.request('screen');
            sentinelRef.current = sentinel;
            setIsActive(true);
            sentinel.addEventListener('release', () => {
                sentinelRef.current = null;
                setIsActive(false);
            });
        } catch {
            setIsActive(false);
        }
    }, []);

    const releaseLock = useCallback(async () => {
        if (sentinelRef.current) {
            try {
                await sentinelRef.current.release();
            } catch {
            }
            sentinelRef.current = null;
            setIsActive(false);
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            void requestLock();
            const handleVisibility = () => {
                if (document.visibilityState === 'visible' && enabled) {
                    void requestLock();
                }
            };
            document.addEventListener('visibilitychange', handleVisibility);
            return () => {
                document.removeEventListener('visibilitychange', handleVisibility);
                void releaseLock();
            };
        } else {
            void releaseLock();
        }
    }, [enabled, requestLock, releaseLock]);

    return { isSupported, isActive };
}
