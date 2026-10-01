import { useCallback, useEffect, useState } from 'react';

export const BACKGROUND_OPTIONS = [
    { label: 'Sin fondo', source: 'none' },
    { label: 'Fireplace', source: '/backgrounds/Fireplace.mp4' },
    { label: 'Lake', source: '/backgrounds/Lake.mp4' },
    { label: 'Lofi Lounge', source: '/backgrounds/Lofi%20Lounge.mp4' },
    { label: 'Rain', source: '/backgrounds/Rain.mp4' },
    { label: 'Sunset', source: '/backgrounds/Sunset.mp4' },
] as const;

const STORAGE_KEY = 'studyzen_background';

export function useBackground(initialSource?: string) {
    const [source, setSource] = useState(() => {
        if (initialSource) return initialSource;
        try { return localStorage.getItem(STORAGE_KEY) ?? 'none'; } catch { return 'none'; }
    });
    const applyBackground = useCallback((nextSource: string) => {
        setSource(nextSource || 'none');
        try { localStorage.setItem(STORAGE_KEY, nextSource || 'none'); } catch {}
    }, []);
    useEffect(() => { if (initialSource) applyBackground(initialSource); }, [initialSource, applyBackground]);
    return {
        source,
        isVideo: source !== 'none',
        videoProps: source === 'none' ? null : { src: source, autoPlay: true as const, loop: true as const, muted: true as const, playsInline: true as const },
        options: BACKGROUND_OPTIONS,
        setBackground: applyBackground,
        clearBackground: () => applyBackground('none'),
    };
}
