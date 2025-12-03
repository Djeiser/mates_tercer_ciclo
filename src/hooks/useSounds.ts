import { useCallback } from 'react';

export const useSounds = () => {
    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, startTime: number = 0) => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }, []);

    const playCorrect = useCallback(() => {
        // Happy ascending major triad (C - E - G)
        playTone(523.25, 'sine', 0.1, 0);       // C5
        playTone(659.25, 'sine', 0.1, 0.1);     // E5
        playTone(783.99, 'sine', 0.3, 0.2);     // G5
    }, [playTone]);

    const playIncorrect = useCallback(() => {
        // Sad descending tritone / dissonance
        playTone(300, 'sawtooth', 0.2, 0);
        playTone(200, 'sawtooth', 0.4, 0.15);
    }, [playTone]);

    const playLevelUp = useCallback(() => {
        // Victory fanfare
        playTone(523.25, 'square', 0.1, 0);   // C5
        playTone(523.25, 'square', 0.1, 0.1); // C5
        playTone(523.25, 'square', 0.1, 0.2); // C5
        playTone(659.25, 'square', 0.4, 0.3); // E5
        playTone(783.99, 'square', 0.6, 0.5); // G5
    }, [playTone]);

    return { playCorrect, playIncorrect, playLevelUp };
};
