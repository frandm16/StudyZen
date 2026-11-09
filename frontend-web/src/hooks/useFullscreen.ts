import { useState, useEffect, useCallback } from 'react';

export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(
        typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
    );

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const enterFullscreen = useCallback(async (element?: HTMLElement) => {
        const target = element || document.documentElement;
        try {
            if (!document.fullscreenElement && target.requestFullscreen) {
                await target.requestFullscreen();
            }
        } catch {
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch {
        }
    }, []);

    const toggleFullscreen = useCallback(async (element?: HTMLElement) => {
        if (document.fullscreenElement) {
            await exitFullscreen();
        } else {
            await enterFullscreen(element);
        }
    }, [enterFullscreen, exitFullscreen]);

    return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}
