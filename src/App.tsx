import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ExerciseCard from './components/ExerciseCard';
import GamificationHUD from './components/GamificationHUD';
import { generateExercise, Exercise, ExerciseType } from './services/gemini';
import { useGamification } from './hooks/useGamification';
import { useSounds } from './hooks/useSounds';
import { Home } from 'lucide-react';

const App: React.FC = () => {
    const [currentCategory, setCurrentCategory] = useState<ExerciseType | null>(null);
    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Gamification Hook
    const { nickname, setNickname, xp, level, streak, addXp, incrementStreak, resetStreak } = useGamification();

    // Sound Hook
    const { playCorrect, playIncorrect, playLevelUp } = useSounds();

    const handleStart = (type: ExerciseType) => {
        setCurrentCategory(type);
        fetchNewExercise(type);
    };

    const handleHome = () => {
        setCurrentCategory(null);
        setCurrentExercise(null);
        setError(null);
    };

    const handleExerciseResult = (isCorrect: boolean) => {
        if (isCorrect) {
            playCorrect();
            addXp(10);
            incrementStreak();

            // Check for level up (simple check: if XP ends in 90, next is 100 -> level up)
            // Better logic: calculate if level changed.
            const nextXp = xp + 10;
            const currentLevel = Math.floor(xp / 100) + 1;
            const nextLevel = Math.floor(nextXp / 100) + 1;

            if (nextLevel > currentLevel) {
                setTimeout(() => playLevelUp(), 500); // Delay slightly for effect
            }

        } else {
            playIncorrect();
            resetStreak();
        }
    };

    const fetchNewExercise = useCallback(async (type?: ExerciseType) => {
        const typeToUse = type || currentCategory;
        if (!typeToUse) return;

        setLoading(true);
        setError(null);
        setCurrentExercise(null);
        try {
            const exercise = await generateExercise(typeToUse);
            setCurrentExercise(exercise);
        } catch (err) {
            console.error(err);
            setError("¡Vaya! El profe se ha dejado las tizas. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [currentCategory]);

    if (!currentCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4 flex flex-col items-center justify-center">
                <WelcomeScreen
                    onStart={handleStart}
                    nickname={nickname}
                    onNicknameChange={setNickname}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4 flex flex-col items-center">

            {/* Gamification HUD */}
            <GamificationHUD
                nickname={nickname}
                level={level}
                xp={xp}
                streak={streak}
            />

            {/* Navbar / Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    onClick={handleHome}
                >
                    <span className="bg-green-500 text-white p-2 rounded-lg text-xl">📚</span>
                    <span className="font-bold text-green-800 text-xl tracking-tight hidden sm:block">Mates Andalucía</span>
                </div>

                <button
                    onClick={handleHome}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-green-100 text-green-700 font-bold hover:bg-green-50 transition"
                >
                    <Home size={18} />
                    <span className="hidden sm:inline">Menú Principal</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="w-full flex flex-col items-center flex-grow justify-center pb-12">
                {error && (
                    <div className="mb-6 bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow-sm max-w-md text-center border border-red-200">
                        <p className="font-bold mb-2">Error</p>
                        <p>{error}</p>
                        <button
                            onClick={() => fetchNewExercise()}
                            className="mt-4 bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="h-64 w-full max-w-2xl bg-white/50 rounded-3xl mb-4 border-2 border-green-100"></div>
                        <p className="text-green-700 font-medium">Preparando el ejercicio...</p>
                    </div>
                )}

                {/* Exercise Card */}
                {!loading && currentExercise && (
                    <ExerciseCard
                        exercise={currentExercise}
                        onNext={() => fetchNewExercise()}
                        loading={loading}
                        onResult={handleExerciseResult}
                    />
                )}
            </div>

        </div>
    );
};

export default App;
