import React from 'react';
import { Trophy, Flame, Star } from 'lucide-react';

interface GamificationHUDProps {
    nickname: string;
    level: number;
    xp: number;
    streak: number;
}

const GamificationHUD: React.FC<GamificationHUDProps> = ({ nickname, level, xp, streak }) => {
    // XP needed for next level (simple formula: level * 100)
    const xpForNextLevel = level * 100;
    const progress = (xp % 100) / 100 * 100;

    return (
        <div className="w-full max-w-4xl mx-auto mb-6 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-green-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* User Info & Level */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="bg-green-100 p-3 rounded-full">
                        <Trophy className="text-green-600 w-6 h-6" />
                    </div>
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

                {/* Streak Counter */}
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                    <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-orange-600 leading-none">{streak}</span>
                        <span className="text-[10px] font-bold text-orange-400 uppercase">Racha</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GamificationHUD;
