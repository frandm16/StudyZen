import { useCallback, useEffect, useRef, useState } from 'react';

export type AlarmPreset = 'bells' | 'digital' | 'birds';
export type SoundCategory = 'master' | 'alarm' | 'notification' | 'background';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

const ALARM_URLS: Record<AlarmPreset, string> = {
    bells: '/sounds/alarm/bells.mp3',
    digital: '/sounds/alarm/digital.mp3',
    birds: '/sounds/alarm/birds.mp3',
};

const DEFAULT_NOTIFICATION_URL = '/sounds/notification/notification.mp3';
const DEFAULT_BACKGROUND_URL = '/sounds/background/lofi1.mp3';
const STORAGE_KEY = 'studyzen_sound';

const DEFAULT_VOLUMES: Record<SoundCategory, number> = {
    master: 100,
    alarm: 100,
    notification: 100,
    background: 35,
};

interface PersistedSound {
    volumes?: Partial<Record<SoundCategory, number>>;
    alarmPreset?: AlarmPreset;
}

function clampVolume(value: number) {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function computeVolume(volumes: Record<SoundCategory, number>, category: SoundCategory) {
    const categoryVolume = category === 'master' ? 100 : volumes[category];
    return Math.max(0, Math.min(1, (volumes.master / 100) * (categoryVolume / 100)));
}

function loadPersistedSound(): { volumes: Record<SoundCategory, number>; alarmPreset: AlarmPreset } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { volumes: { ...DEFAULT_VOLUMES }, alarmPreset: 'bells' };
        const parsed = JSON.parse(raw) as PersistedSound;
        return {
            volumes: {
                master: clampVolume(parsed.volumes?.master ?? DEFAULT_VOLUMES.master),
                alarm: clampVolume(parsed.volumes?.alarm ?? DEFAULT_VOLUMES.alarm),
                notification: clampVolume(parsed.volumes?.notification ?? DEFAULT_VOLUMES.notification),
                background: clampVolume(parsed.volumes?.background ?? DEFAULT_VOLUMES.background),
            },
            alarmPreset: parsed.alarmPreset && parsed.alarmPreset in ALARM_URLS ? parsed.alarmPreset : 'bells',
        };
    } catch {
        return { volumes: { ...DEFAULT_VOLUMES }, alarmPreset: 'bells' };
    }
}

function persistSound(volumes: Record<SoundCategory, number>, alarmPreset: AlarmPreset) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ volumes, alarmPreset }));
    } catch {
    }
}

export function useSound() {
    const [initial] = useState(loadPersistedSound);
    const [volumes, setVolumes] = useState<Record<SoundCategory, number>>(initial.volumes);
    const [alarmPreset, setAlarmPresetState] = useState<AlarmPreset>(initial.alarmPreset);
    const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);

    const volumesRef = useRef(volumes);
    const cacheRef = useRef(new Map<string, HTMLAudioElement>());
    const playersRef = useRef(new Map<HTMLAudioElement, SoundCategory>());
    const ambientRef = useRef<HTMLAudioElement | null>(null);
    const customAlarmRef = useRef<string | null>(null);
    const customNotificationRef = useRef<Record<NotificationType, string | null>>({
        success: null,
        error: null,
        warning: null,
        info: null,
    });

    useEffect(() => {
        volumesRef.current = volumes;
    });

    const applyVolumeToPlayers = useCallback((nextVolumes: Record<SoundCategory, number>) => {
        playersRef.current.forEach((category, audio) => {
            audio.volume = computeVolume(nextVolumes, category);
        });
        if (ambientRef.current) {
            ambientRef.current.volume = computeVolume(nextVolumes, 'background');
        }
    }, []);

    const getCached = useCallback((src: string) => {
        let audio = cacheRef.current.get(src);
        if (!audio) {
            audio = new Audio(src);
            audio.preload = 'auto';
            cacheRef.current.set(src, audio);
        }
        return audio;
    }, []);

    const play = useCallback((src: string, category: SoundCategory = 'notification') => {
        if (typeof Audio === 'undefined') return null;
        const template = getCached(src);
        const audio = template.cloneNode(true) as HTMLAudioElement;
        audio.volume = computeVolume(volumesRef.current, category);
        playersRef.current.set(audio, category);
        const release = () => {
            playersRef.current.delete(audio);
            audio.src = '';
        };
        audio.addEventListener('ended', release, { once: true });
        audio.addEventListener('error', release, { once: true });
        void audio.play().catch(release);
        return audio;
    }, [getCached]);

    const playAlarm = useCallback(
        () => play(customAlarmRef.current ?? ALARM_URLS[alarmPreset], 'alarm'),
        [alarmPreset, play],
    );

    const playNotification = useCallback(
        (type: NotificationType = 'info') => {
            const src = customNotificationRef.current[type] ?? DEFAULT_NOTIFICATION_URL;
            return play(src, 'notification');
        },
        [play],
    );

    const setVolume = useCallback((category: SoundCategory, value: number) => {
        const nextValue = clampVolume(value);
        setVolumes((current) => {
            const next = { ...current, [category]: nextValue };
            volumesRef.current = next;
            applyVolumeToPlayers(next);
            persistSound(next, alarmPreset);
            return next;
        });
    }, [alarmPreset, applyVolumeToPlayers]);

    const revokeIfBlob = (url: string | null) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    };

    const dropCached = (src: string | null) => {
        if (!src) return;
        const cached = cacheRef.current.get(src);
        if (cached) {
            cached.pause();
            cached.src = '';
            cacheRef.current.delete(src);
        }
        revokeIfBlob(src);
    };

    const setAlarmPreset = useCallback((preset: AlarmPreset) => {
        dropCached(customAlarmRef.current);
        customAlarmRef.current = null;
        setAlarmPresetState(preset);
        persistSound(volumesRef.current, preset);
    }, []);

    const setCustomAlarm = useCallback((file: File | null) => {
        dropCached(customAlarmRef.current);
        customAlarmRef.current = file ? URL.createObjectURL(file) : null;
    }, []);

    const setCustomNotification = useCallback((file: File | null, type: NotificationType = 'info') => {
        dropCached(customNotificationRef.current[type]);
        customNotificationRef.current[type] = file ? URL.createObjectURL(file) : null;
    }, []);

    const playBackground = useCallback((src = DEFAULT_BACKGROUND_URL) => {
        if (typeof Audio === 'undefined') return;
        if (ambientRef.current) {
            ambientRef.current.pause();
            ambientRef.current.src = '';
        }
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = computeVolume(volumesRef.current, 'background');
        ambientRef.current = audio;
        void audio.play()
            .then(() => setIsBackgroundPlaying(true))
            .catch(() => {
                // A stale playback promise must not override a newer player.
                if (ambientRef.current === audio) {
                    setIsBackgroundPlaying(false);
                    ambientRef.current = null;
                }
            });
    }, []);

    const stopBackground = useCallback(() => {
        if (ambientRef.current) {
            ambientRef.current.pause();
            ambientRef.current.src = '';
            ambientRef.current = null;
        }
        setIsBackgroundPlaying(false);
    }, []);

    const toggleBackground = useCallback(() => {
        if (ambientRef.current && !ambientRef.current.paused) stopBackground();
        else playBackground();
    }, [playBackground, stopBackground]);

    useEffect(() => () => {
        playersRef.current.forEach((_category, audio) => {
            audio.pause();
            audio.src = '';
        });
        playersRef.current.clear();
        cacheRef.current.forEach((audio) => {
            audio.pause();
            audio.src = '';
        });
        cacheRef.current.clear();
        if (ambientRef.current) {
            ambientRef.current.pause();
            ambientRef.current.src = '';
        }
        revokeIfBlob(customAlarmRef.current);
        Object.values(customNotificationRef.current).forEach(revokeIfBlob);
    }, []);

    return {
        volumes,
        setVolume,
        play,
        playAlarm,
        playNotification,
        alarmPreset,
        setAlarmPreset,
        setCustomAlarm,
        setCustomNotification,
        isBackgroundPlaying,
        playBackground,
        stopBackground,
        toggleBackground,
    };
}
