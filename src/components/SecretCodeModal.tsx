import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface SecretCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    nickname: string;
    level: number;
}

const SecretCodeModal: React.FC<SecretCodeModalProps> = ({ isOpen, onClose, nickname, level }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    // Generate a consistent but unique-looking code
    // In a real app, this might come from the backend.
    // Here we generate it deterministically based on props but add a random-looking suffix.
    const randomSuffix = Math.floor(Math.random() * 900) + 100; // 100-999
    const code = `MATES-${nickname.toUpperCase().replace(/\s+/g, '')}-${level}-X${randomSuffix}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border-4 border-yellow-400">

                {/* Header */}
                <div className="bg-yellow-400 p-6 text-center">
                    <h2 className="text-3xl font-black text-yellow-900 uppercase tracking-wider">¡Tesoro Abierto!</h2>
                    <p className="text-yellow-800 font-bold mt-2">Has demostrado tu valor</p>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="text-6xl mb-4">💎</div>

                    <p className="text-gray-600 mb-6 font-medium">
                        ¡Increíble! Has alcanzado un nivel legendario.
                        Enséñale este código secreto a tu profe para reclamar tu recompensa.
                    </p>

                    {/* The Code */}
                    <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-200 w-full flex items-center justify-between gap-2 mb-6">
                        <code className="text-xl font-mono font-bold text-gray-800 tracking-widest break-all">
                            {code}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                            title="Copiar código"
                        >
                            {copied ? <Check className="text-green-500" /> : <Copy />}
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-8 rounded-xl transition-transform transform hover:scale-105 shadow-md"
                    >
                        ¡Entendido!
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-yellow-900/50 hover:text-yellow-900 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};

export default SecretCodeModal;
