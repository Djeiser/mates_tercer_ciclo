import React from 'react';
import { BookOpen, RefreshCw, PenTool, Divide, Shuffle, Brain } from 'lucide-react';
import { ExerciseType } from '../services/gemini';

interface WelcomeScreenProps {
    onStart: (type: ExerciseType) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    const categories: { type: ExerciseType; label: string; icon: React.ReactNode; color: string }[] = [
        { type: 'solve', label: 'Resolución de Problemas', icon: <BookOpen size={32} />, color: 'bg-blue-500' },
        { type: 'reformulate', label: 'Reformular Preguntas', icon: <RefreshCw size={32} />, color: 'bg-purple-500' },
        { type: 'create', label: 'Inventar Problemas', icon: <PenTool size={32} />, color: 'bg-orange-500' },
        { type: 'multiples', label: 'Múltiplos y Divisores', icon: <Divide size={32} />, color: 'bg-teal-500' },
        { type: 'mental', label: 'Cálculo Mental', icon: <Brain size={32} />, color: 'bg-pink-500' },
        { type: 'random', label: '¡Sorpréndeme!', icon: <Shuffle size={32} />, color: 'bg-andalucia-gold text-gray-800' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-fade-in w-full max-w-4xl">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-andalucia-green/20 w-full">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    ¡A practicar! 🚀
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Elige qué quieres entrenar hoy:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.type}
                            onClick={() => onStart(cat.type)}
                            className={`${cat.color} hover:opacity-90 text-white p-6 rounded-2xl shadow-md transform hover:scale-105 transition-all flex flex-col items-center justify-center gap-4 h-40`}
                        >
                            <div className="bg-white/20 p-3 rounded-full">
                                {cat.icon}
                            </div>
                            <span className="text-xl font-bold">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
