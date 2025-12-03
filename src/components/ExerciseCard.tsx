import React, { useState } from 'react';
import { Exercise, evaluateAnswer, EvaluationResult } from '../services/gemini';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, ArrowRight, HelpCircle, Send, Lightbulb } from 'lucide-react';

interface ExerciseCardProps {
    exercise: Exercise;
    onNext: () => void;
    loading: boolean;
    onResult: (isCorrect: boolean) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onNext, loading, onResult }) => {
    const [userAnswer, setUserAnswer] = useState("");
    const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const handleSubmit = async () => {
        if (!userAnswer.trim()) return;

        setEvaluating(true);
        try {
            const result = await evaluateAnswer(exercise, userAnswer);
            setEvaluation(result);

            if (result.isCorrect) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            onResult(result.isCorrect);
        } catch (error) {
            console.error(error);
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
                {/* Header */}
                <div className="bg-andalucia-green p-6 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <HelpCircle className="w-8 h-8" />
                        {exercise.type === 'reformulate' ? 'Reformular' :
                            exercise.type === 'create' ? 'Inventar' : 'Resolver'}
                    </h2>
                    {exercise.hint && (
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="text-white/80 hover:text-white transition"
                            title="Ver pista"
                        >
                            <Lightbulb className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Question & Context */}
                <div className="p-8">
                    {showHint && exercise.hint && (
                        <div className="mb-6 bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 animate-fade-in">
                            <span className="font-bold">Pista:</span> {exercise.hint}
                        </div>
                    )}

                    <p className="text-2xl text-gray-800 font-medium leading-relaxed mb-4">
                        {exercise.question}
                    </p>

                    {exercise.context && (
                        <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-andalucia-green mb-8 italic text-lg text-gray-700">
                            "{exercise.context}"
                        </div>
                    )}

                    {/* Input Area */}
                    {!evaluation ? (
                        <div className="space-y-4">
                            <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-andalucia-green focus:ring-2 focus:ring-green-100 outline-none transition-all min-h-[120px]"
                                disabled={evaluating}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!userAnswer.trim() || evaluating}
                                className="w-full bg-andalucia-green hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {evaluating ? (
                                    <span>Corrigiendo...</span>
                                ) : (
                                    <>
                                        Enviar Respuesta <Send size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Feedback Section */
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-sm text-gray-500 font-bold uppercase mb-1">Tu respuesta:</p>
                                <p className="text-lg text-gray-800">{userAnswer}</p>
                            </div>

                            <div className={`
                rounded-xl p-6 border-2
                ${evaluation.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
              `}>
                                <div className="flex items-start gap-4">
                                    {evaluation.isCorrect ? (
                                        <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                                    )}
                                    <div>
                                        <h3 className={`text-lg font-bold mb-2 ${evaluation.isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                                            {evaluation.isCorrect ? '¡Muy bien!' : 'Vamos a revisarlo'}
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {evaluation.feedback}
                                        </p>
                                        {evaluation.correction && (
                                            <div className="mt-4 pt-4 border-t border-black/5">
                                                <p className="font-bold text-sm text-gray-500 uppercase">Solución sugerida:</p>
                                                <p className="text-gray-800">{evaluation.correction}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onNext}
                                disabled={loading}
                                className="w-full bg-andalucia-green hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                {loading ? 'Cargando...' : (
                                    <>
                                        Siguiente Ejercicio <ArrowRight />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseCard;
