import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'studyzen_flip_sound_muted';

export function useFlipSound() {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const audioCtxRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                audioCtxRef.current = new AudioCtx();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            void audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const playFlip = useCallback(() => {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400, t);
            osc.frequency.exponentialRampToValueAtTime(160, t + 0.02);
            oscGain.gain.setValueAtTime(0.06, t);
            oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.022);

            const slapTime = t + 0.2;
            const bufferSize = Math.floor(ctx.sampleRate * 0.035);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const channel = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                channel[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, slapTime);
            filter.frequency.exponentialRampToValueAtTime(260, slapTime + 0.035);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.1, slapTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, slapTime + 0.035);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(slapTime);
            noise.stop(slapTime + 0.038);
        } catch {
        }
    }, [isMuted, getAudioContext]);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
            }
            return next;
        });
    }, []);

    useEffect(() => {
        return () => {
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                void audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        };
    }, []);

    return { isMuted, playFlip, toggleMute };
}
