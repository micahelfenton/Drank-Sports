
import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';

interface QuizOverlayProps {
  quiz: Quiz;
  playerId: string;
  onAnswer: (idx: number) => void;
  onComplete: () => void;
}

export const QuizOverlay: React.FC<QuizOverlayProps> = ({ quiz, playerId, onAnswer, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowResult(true);
      setTimeout(onComplete, 5000);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const handleSelect = (idx: number) => {
    if (selected !== null || showResult) return;
    setSelected(idx);
    onAnswer(idx);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-indigo-950 p-6 text-center animate-pop overflow-y-auto">
      <div className="absolute top-0 left-0 h-2 bg-emerald-500 transition-all duration-1000 origin-left w-full" style={{ transform: `scaleX(${timeLeft / 15})` }}></div>
      
      <div className="w-full max-w-lg space-y-6 pt-10 pb-10">
        <h2 className="text-2xl sm:text-3xl font-brand text-indigo-300">SPORT QUIZ!</h2>
        <div className="bg-white/5 p-6 sm:p-8 rounded-[2rem] border-2 border-white/10 shadow-2xl">
           <p className="text-xl sm:text-2xl font-bold leading-tight break-words">{quiz.question}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {quiz.options.map((opt, idx) => {
            let style = "bg-white/10 border-white/20";
            if (selected === idx) style = "bg-indigo-600 border-indigo-400 scale-102 shadow-xl";
            if (showResult) {
              if (idx === quiz.correctIndex) style = "bg-emerald-600 border-emerald-400 scale-105";
              else if (selected === idx) style = "bg-rose-600 border-rose-400 opacity-60";
              else style = "opacity-20";
            }

            return (
              <button 
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-2xl border-2 text-base sm:text-lg font-bold transition-all flex items-center gap-4 text-left ${style}`}
              >
                <span className="w-8 h-8 flex-shrink-0 bg-black/30 rounded-full flex items-center justify-center text-xs font-brand">{String.fromCharCode(65 + idx)}</span>
                <span className="truncate break-words flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="animate-pop p-6 rounded-2xl bg-black/40 border-2 border-white/10">
            {selected === quiz.correctIndex ? (
              <h3 className="text-2xl sm:text-3xl font-brand text-emerald-400">NAILED IT! 🎉</h3>
            ) : (
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-brand text-rose-500">NOPE! 💀</h3>
                <p className="text-base font-bold italic text-rose-200">{quiz.penalty}</p>
              </div>
            )}
          </div>
        )}

        {!showResult && (
           <div className="text-4xl font-brand opacity-20">{timeLeft}</div>
        )}
      </div>
    </div>
  );
};
