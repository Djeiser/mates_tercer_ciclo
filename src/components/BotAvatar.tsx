import React from 'react';
import { Bot, Zap, Shield, Crown } from 'lucide-react';

interface BotAvatarProps {
    level: number;
}

const BotAvatar: React.FC<BotAvatarProps> = ({ level }) => {
    // Level 1-2: Proto-Bot
    if (level < 3) {
        return (
            <div className="relative">
                <div className="bg-gray-200 p-3 rounded-full border-4 border-gray-300">
                    <Bot className="w-8 h-8 text-gray-500" />
                </div>
                <span className="absolute -bottom-2 -right-2 bg-gray-500 text-white text-[10px] px-1 rounded-full font-bold">Nv.1</span>
            </div>
        );
    }

    // Level 3-5: Mecha-Bot
    if (level < 6) {
        return (
            <div className="relative">
                <div className="bg-blue-100 p-3 rounded-full border-4 border-blue-400 shadow-lg">
                    <Bot className="w-10 h-10 text-blue-600" />
                    <Shield className="absolute -top-2 -right-2 w-5 h-5 text-blue-500" />
                </div>
                <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] px-1 rounded-full font-bold">Nv.2</span>
            </div>
        );
    }

    // Level 6+: Cyber-Prime
    return (
        <div className="relative animate-bounce-slow">
            <div className="bg-purple-100 p-3 rounded-full border-4 border-purple-500 shadow-xl shadow-purple-200">
                <Bot className="w-12 h-12 text-purple-700" />
                <Crown className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 text-yellow-500 animate-pulse" />
                <Zap className="absolute -bottom-1 -right-1 w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-purple-700 text-white text-xs px-2 py-0.5 rounded-full font-bold border border-white">MAX</span>
        </div>
    );
};

export default BotAvatar;
