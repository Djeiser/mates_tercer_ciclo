import React, { useState } from 'react';
import { BookOpen, RefreshCw, PenTool, Divide, Shuffle, Brain, Calculator, Plus, Minus, X, ArrowLeft } from 'lucide-react';
import { ExerciseType } from '../services/gemini';

interface WelcomeScreenProps {
    onStart: (type: ExerciseType) => void;
    nickname: string;
    onNicknameChange: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, nickname, onNicknameChange }) => {
    const [showCalculationMenu, setShowCalculationMenu] = useState(false);

    const categories: { type: ExerciseType | 'calculation'; label: string; icon: React.ReactNode; color: string }[] = [
        { type: 'solve', label: 'Resolución de Problemas', icon: <BookOpen size={32} />, color: 'bg-blue-500' },
        { type: 'reformulate', label: 'Reformular Preguntas', icon: <RefreshCw size={32} />, color: 'bg-purple-500' },
        { type: 'create', label: 'Inventar Problemas', icon: <PenTool size={32} />, color: 'bg-orange-500' },
        { type: 'multiples', label: 'Múltiplos y Divisores', icon: <Divide size={32} />, color: 'bg-teal-500' },
        { type: 'mental', label: 'Cálculo Mental', icon: <Brain size={32} />, color: 'bg-pink-500' },
        { type: 'calculation', label: 'Operaciones y Cálculo', icon: <Calculator size={32} />, color: 'bg-indigo-500' },
        { type: 'random', label: '¡Sorpréndeme!', icon: <Shuffle size={32} />, color: 'bg-andalucia-gold text-gray-800' },
    ];

    const calculationOptions: { type: ExerciseType; label: string; icon: React.ReactNode; color: string }[] = [
        { type: 'addition', label: 'Sumas', icon: <Plus size={32} />, color: 'bg-green-500' },
        { type: 'subtraction', label: 'Restas', icon: <Minus size={32} />, color: 'bg-red-500' },
        { type: 'multiplication', label: 'Multiplicaciones', icon: <X size={32} />, color: 'bg-yellow-500' },
        { type: 'division', label: 'Divisiones', icon: <Divide size={32} />, color: 'bg-blue-400' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-fade-in w-full max-w-4xl">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-andalucia-green/20 w-full">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    ¡A practicar! 🚀
                </h1>

                {/* Nickname Input */}
                <div className="mb-8 max-w-md mx-auto">
                    <label className="block text-gray-600 mb-2 font-bold">¿Cómo te llamas, aventurero?</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => onNicknameChange(e.target.value)}
                        placeholder="Escribe tu apodo..."
                        className="w-full text-center text-2xl p-3 border-2 border-gray-300 rounded-xl focus:border-andalucia-green focus:ring-2 focus:ring-green-100 outline-none transition-all"
                    />
                </div>

                <p className="text-xl text-gray-600 mb-8">
                    {showCalculationMenu ? "Elige la operación:" : "Elige qué quieres entrenar hoy:"}
                </p>

                {showCalculationMenu ? (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {calculationOptions.map((opt) => (
                                <button
                                    key={opt.type}
                                    onClick={() => onStart(opt.type)}
                                    className={`${opt.color} text-white p-6 rounded-2xl shadow-md transform transition-all hover:scale-105 flex flex-col items-center justify-center gap-4 h-32`}
                                >
                                    <div className="bg-white/20 p-3 rounded-full">
                                        {opt.icon}
                                    </div>
                                    <span className="text-xl font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowCalculationMenu(false)}
                            className="mt-4 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 font-bold py-2 px-4 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Volver al menú principal
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.type}
                                onClick={() => {
                                    if (cat.type === 'calculation') {
                                        setShowCalculationMenu(true);
                                    } else {
                                        onStart(cat.type as ExerciseType);
                                    }
                                }}
                                disabled={!nickname.trim()}
                                className={`${cat.color} ${!nickname.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'} text-white p-6 rounded-2xl shadow-md transform transition-all flex flex-col items-center justify-center gap-4 h-40`}
                            >
                                <div className="bg-white/20 p-3 rounded-full">
                                    {cat.icon}
                                </div>
                                <span className="text-xl font-bold">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomeScreen;
