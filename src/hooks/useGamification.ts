import { useState, useEffect } from 'react';

export interface GamificationState {
    nickname: string;
    xp: number;
    level: number;
    streak: number;
}

export const useGamification = () => {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem('mates_gamification');
        return saved ? JSON.parse(saved) : {
            nickname: '',
            xp: 0,
            level: 1,
            streak: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('mates_gamification', JSON.stringify(state));
    }, [state]);

    const setNickname = (name: string) => {
        setState(prev => ({ ...prev, nickname: name }));
    };

    const addXp = (amount: number) => {
        setState(prev => {
            const newXp = prev.xp + amount;
            const newLevel = Math.floor(newXp / 100) + 1;
            return {
                ...prev,
                xp: newXp,
                level: newLevel
            };
        });
    };

    const incrementStreak = () => {
        setState(prev => ({ ...prev, streak: prev.streak + 1 }));
    };

    const resetStreak = () => {
        setState(prev => ({ ...prev, streak: 0 }));
    };

    return {
        ...state,
        setNickname,
        addXp,
        incrementStreak,
        resetStreak
    };
};
