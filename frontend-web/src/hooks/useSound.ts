import { useCallback, useEffect, useRef, useState } from 'react';

export type AlarmPreset = 'bells' | 'digital' | 'birds';
export type SoundCategory = 'master' | 'alarm' | 'notification' | 'background';

const ALARM_URLS: Record<AlarmPreset, string> = {
    bells: '/sounds/alarm/bells.mp3',
    digital: '/sounds/alarm/digital.mp3',
    birds: '/sounds/alarm/birds.mp3',
};

export function useSound() {
    const [volumes, setVolumes] = useState<Record<SoundCategory, number>>({ master: 100, alarm: 100, notification: 100, background: 35 });
    const [alarmPreset, setAlarmPresetState] = useState<AlarmPreset>('bells');
    const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
    const playersRef = useRef(new Map<HTMLAudioElement, SoundCategory>());
    const ambientRef = useRef<HTMLAudioElement | null>(null);
    const customAlarmRef = useRef<string | null>(null);
    const customNotificationRef = useRef<string | null>(null);

    const volumeFor = useCallback((category: SoundCategory) => {
        const categoryVolume = category === 'master' ? 100 : volumes[category];
        return Math.max(0, Math.min(1, (volumes.master / 100) * (categoryVolume / 100)));
    }, [volumes]);

    const play = useCallback((src: string, category: SoundCategory = 'notification') => {
        if (typeof Audio === 'undefined') return null;
        const audio = new Audio(src);
        audio.volume = volumeFor(category);
        playersRef.current.set(audio, category);
        audio.addEventListener('ended', () => playersRef.current.delete(audio), { once: true });
        void audio.play().catch(() => playersRef.current.delete(audio));
        return audio;
    }, [volumeFor]);

    const playAlarm = useCallback(() => play(customAlarmRef.current ?? ALARM_URLS[alarmPreset], 'alarm'), [alarmPreset, play]);
    const playNotification = useCallback(() => play(customNotificationRef.current ?? '/sounds/notification/notification.mp3', 'notification'), [play]);

    const setVolume = useCallback((category: SoundCategory, value: number) => {
        const next = Math.max(0, Math.min(100, Math.round(value)));
        setVolumes((current) => ({ ...current, [category]: next }));
        const nextVolumes = { ...volumes, [category]: next };
        playersRef.current.forEach((playerCategory, audio) => {
            audio.volume = Math.max(0, Math.min(1, nextVolumes.master * nextVolumes[playerCategory] / 10_000));
        });
        if (ambientRef.current) ambientRef.current.volume = Math.max(0, Math.min(1, nextVolumes.master * nextVolumes.background / 10_000));
    }, [volumes]);

    const setAlarmPreset = useCallback((preset: AlarmPreset) => { setAlarmPresetState(preset); customAlarmRef.current = null; }, []);
    const setCustomAlarm = useCallback((file: File | null) => {
        if (customAlarmRef.current?.startsWith('blob:')) URL.revokeObjectURL(customAlarmRef.current);
        customAlarmRef.current = file ? URL.createObjectURL(file) : null;
    }, []);
    const setCustomNotification = useCallback((file: File | null) => {
        if (customNotificationRef.current?.startsWith('blob:')) URL.revokeObjectURL(customNotificationRef.current);
        customNotificationRef.current = file ? URL.createObjectURL(file) : null;
    }, []);

    const playBackground = useCallback((src = '/sounds/background/lofi1.mp3') => {
        if (typeof Audio === 'undefined') return;
        if (ambientRef.current) ambientRef.current.pause();
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = volumeFor('background');
        ambientRef.current = audio;
        void audio.play().then(() => setIsBackgroundPlaying(true)).catch(() => setIsBackgroundPlaying(false));
    }, [volumeFor]);
    const stopBackground = useCallback(() => { ambientRef.current?.pause(); setIsBackgroundPlaying(false); }, []);
    const toggleBackground = useCallback(() => isBackgroundPlaying ? stopBackground() : playBackground(), [isBackgroundPlaying, playBackground, stopBackground]);

    useEffect(() => () => {
        playersRef.current.forEach((_category, audio) => { audio.pause(); audio.src = ''; });
        ambientRef.current?.pause();
        [customAlarmRef.current, customNotificationRef.current].forEach((url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); });
    }, []);

    return { volumes, setVolume, play, playAlarm, playNotification, alarmPreset, setAlarmPreset, setCustomAlarm, setCustomNotification, isBackgroundPlaying, playBackground, stopBackground, toggleBackground };
}
