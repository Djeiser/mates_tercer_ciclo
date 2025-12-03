import React, { useState } from 'react';
import { Flame, Lock, Gift } from 'lucide-react';
import BotAvatar from './BotAvatar';
import SecretCodeModal from './SecretCodeModal';

interface GamificationHUDProps {
    nickname: string;
    level: number;
    xp: number;
    streak: number;
}

const GamificationHUD: React.FC<GamificationHUDProps> = ({ nickname, level, xp, streak }) => {
    const [isChestOpen, setIsChestOpen] = useState(false);

    // XP needed for next level (simple formula: level * 100)
    const progress = (xp % 100) / 100 * 100;

    // Secret Chest Logic (Unlocks at Level 5)
    const isChestUnlocked = level >= 5;

    return (
        <>
            <div className="w-full max-w-4xl mx-auto mb-6 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-green-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* User Info & Bot Avatar */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <BotAvatar level={level} />
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Jugador</p>
                            <h3 className="text-xl font-bold text-gray-800">{nickname || "Aventurero"}</h3>
                        </div>
                        <div className="ml-4 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200">
                            <span className="text-yellow-800 font-bold">Nivel {level}</span>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="flex-grow w-full sm:mx-8">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                            <span>XP</span>
                            <span>{Math.floor(progress)}%</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Right Side: Streak & Chest */}
                    <div className="flex items-center gap-3">
                        {/* Streak Counter */}
                        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                            <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-orange-600 leading-none">{streak}</span>
                                <span className="text-[10px] font-bold text-orange-400 uppercase">Racha</span>
                            </div>
                        </div>

                        {/* Secret Chest */}
                        <button
                            onClick={() => isChestUnlocked && setIsChestOpen(true)}
                            className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${isChestUnlocked
                                    ? 'bg-yellow-100 border-yellow-400 cursor-pointer animate-bounce-slow'
                                    : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                                }`}
                            title={isChestUnlocked ? "¡Abrir cofre secreto!" : "Se desbloquea en Nivel 5"}
                        >
                            {isChestUnlocked ? (
                                <Gift className="w-6 h-6 text-yellow-600" />
                            ) : (
                                <Lock className="w-6 h-6 text-gray-400" />
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Secret Code Modal */}
            <SecretCodeModal
                isOpen={isChestOpen}
                onClose={() => setIsChestOpen(false)}
                nickname={nickname}
                level={level}
            />
        </>
    );
};

export default GamificationHUD;
