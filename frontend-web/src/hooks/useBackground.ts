import { useCallback, useEffect, useRef, useState } from 'react';

export const BACKGROUND_OPTIONS = [
    { label: 'Sin fondo', source: 'none' },
    { label: 'Fireplace', source: '/backgrounds/Fireplace.mp4' },
    { label: 'Lake', source: '/backgrounds/Lake.mp4' },
    { label: 'Lofi Lounge', source: '/backgrounds/Lofi%20Lounge.mp4' },
    { label: 'Rain', source: '/backgrounds/Rain.mp4' },
    { label: 'Sunset', source: '/backgrounds/Sunset.mp4' },
] as const;

const STORAGE_KEY = 'studyzen_background';
const PRESET_SOURCES = new Set<string>(BACKGROUND_OPTIONS.map((option) => option.source));

function readStoredSource() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && PRESET_SOURCES.has(stored)) return stored;
        return 'none';
    } catch {
        return 'none';
    }
}

function persistSource(source: string) {
    try {
        if (source.startsWith('blob:')) {
            localStorage.setItem(STORAGE_KEY, 'none');
            return;
        }
        localStorage.setItem(STORAGE_KEY, PRESET_SOURCES.has(source) ? source : 'none');
    } catch {
    }
}

export function useBackground(initialSource?: string) {
    const customUrlRef = useRef<string | null>(null);
    const [source, setSource] = useState(() => {
        if (initialSource && (PRESET_SOURCES.has(initialSource) || initialSource === 'none')) {
            return initialSource;
        }
        return readStoredSource();
    });

    const revokeCustom = () => {
        if (customUrlRef.current?.startsWith('blob:')) URL.revokeObjectURL(customUrlRef.current);
        customUrlRef.current = null;
    };

    const applyBackground = useCallback((nextSource: string) => {
        const normalized = nextSource && PRESET_SOURCES.has(nextSource)
            ? nextSource
            : 'none';
        revokeCustom();
        setSource(normalized);
        persistSource(normalized);
    }, []);

    const setCustomBackground = useCallback((file: File | null) => {
        revokeCustom();
        if (!file) {
            applyBackground('none');
            return;
        }
        const url = URL.createObjectURL(file);
        customUrlRef.current = url;
        setSource(url);
        persistSource('none');
    }, [applyBackground]);

    useEffect(() => () => {
        revokeCustom();
    }, []);

    return {
        source,
        isVideo: source !== 'none',
        isCustom: source.startsWith('blob:'),
        videoProps: source === 'none'
            ? null
            : {
                src: source,
                autoPlay: true as const,
                loop: true as const,
                muted: true as const,
                playsInline: true as const,
                onError: () => applyBackground('none'),
            },
        options: BACKGROUND_OPTIONS,
        setBackground: applyBackground,
        setCustomBackground,
        handleVideoError: () => applyBackground('none'),
        clearBackground: () => applyBackground('none'),
    };
}
