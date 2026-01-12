
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Rule, Player, Quiz } from '../types';
import { RoomService } from '../services/roomService';
import { SAMPLE_QUIZZES } from '../constants';

interface EventOverlayProps {
  rule: Rule;
  players: Player[];
  playerId: string;
  roomCode: string;
  onComplete: () => void;
  isHost: boolean;
  activeEvent: any;
}

export const EventOverlay: React.FC<EventOverlayProps> = ({ rule, players, playerId, roomCode, onComplete, isHost, activeEvent }) => {
  const [viewState, setViewState] = useState<'ALERT' | 'CHALLENGE' | 'RESULTS'>('ALERT');
  const [safe, setSafe] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [safetyCountdown, setSafetyCountdown] = useState(3);
  
  // Quiz specific state (if type is QUIZ)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // Shapes specific state (if type is SHAPES)
  const [shapes, setShapes] = useState<{ id: number; color: string; type: string; x: number; y: number; size: number }[]>([]);

  const resultsFinalized = useRef(false);

  // 1. Initial Alert / Safety Tap logic
  useEffect(() => {
    if (viewState === 'ALERT') {
      const timer = setInterval(() => {
        setSafetyCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      const transition = setTimeout(() => {
        // If not safe, go to challenge. If safe, just wait or show "Safe"
        setViewState('CHALLENGE');
      }, 3500);

      return () => {
        clearInterval(timer);
        clearTimeout(transition);
      };
    }
  }, [viewState]);

  // 2. Setup Challenges
  useEffect(() => {
    if (viewState === 'CHALLENGE' && !safe) {
      if (activeEvent.challengeType === 'QUIZ') {
        setSelectedQuiz(SAMPLE_QUIZZES[Math.floor(Math.random() * SAMPLE_QUIZZES.length)]);
      } else {
        // Generate random shapes
        const colors = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-white'];
        const types = ['rounded-full', 'rounded-lg', 'skew-x-12'];
        const newShapes = Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: types[Math.floor(Math.random() * types.length)],
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          size: Math.random() * 40 + 40
        }));
        // One specific GREEN CIRCLE
        newShapes.push({
          id: 99,
          color: 'bg-emerald-500',
          type: 'rounded-full',
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          size: 60
        });
        setShapes(newShapes.sort(() => Math.random() - 0.5));
      }
    } else if (viewState === 'CHALLENGE' && safe) {
      // If safe, auto-complete challenge view after a delay or wait for everyone
      setTimeout(() => setViewState('RESULTS'), 2000);
    }
  }, [viewState, safe, activeEvent.challengeType]);

  const handleSafetyTap = () => {
    if (viewState === 'ALERT' && !safe) {
      setSafe(true);
      RoomService.submitSafetyTap(roomCode, playerId);
      if ('vibrate' in navigator) navigator.vibrate(50);
    }
  };

  const handleChallengeComplete = () => {
    setChallengeComplete(true);
    RoomService.submitChallengeCompletion(roomCode, playerId);
    if ('vibrate' in navigator) navigator.vibrate([30, 30, 30]);
    setTimeout(() => setViewState('RESULTS'), 1000);
  };

  // Determine the loser: The last person among those who entered the challenge to finish
  const results = useMemo(() => {
    if (viewState !== 'RESULTS') return null;

    const safetyLog = activeEvent.safetyLog || {};
    // Those who weren't safe initially
    const challengeParticipants = players.filter(p => !safetyLog[p.id]);

    if (challengeParticipants.length === 0) return { winner: null, loser: null, allSafe: true };

    // Of those who challenged, who finished last or hasn't finished?
    const finishedChallengers = challengeParticipants
      .filter(p => p.lastReactionTime !== undefined)
      .sort((a, b) => (b.lastReactionTime || 0) - (a.lastReactionTime || 0));

    const unfinishedChallengers = challengeParticipants.filter(p => p.lastReactionTime === undefined);

    let loser = unfinishedChallengers.length > 0 
      ? unfinishedChallengers[0] 
      : finishedChallengers[0];

    if (isHost && !resultsFinalized.current && loser) {
      RoomService.finalizeResults(roomCode, loser.id);
      resultsFinalized.current = true;
    }

    return { loser, allSafe: false };
  }, [viewState, players, activeEvent.safetyLog, isHost, roomCode]);

  useEffect(() => {
    if (viewState === 'RESULTS') {
      const timer = setTimeout(onComplete, 6000);
      return () => clearTimeout(timer);
    }
  }, [viewState, onComplete]);

  // --- RENDERING ---

  if (viewState === 'ALERT') {
    return (
      <div className="fixed inset-0 z-[250] bg-indigo-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-rose-500/20 animate-pulse"></div>
        <div className="relative z-10 space-y-8 w-full max-w-xs">
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-rose-500">Event Occurred!</h2>
          <div className="text-4xl sm:text-5xl font-brand text-white italic leading-none break-words uppercase">{rule.label}</div>
          
          <div className="py-10">
            {!safe ? (
              <button 
                onClick={handleSafetyTap}
                className="w-full bg-emerald-500 p-12 rounded-[3rem] shadow-[0_15px_0_rgb(5,150,105)] border-4 border-white active:translate-y-4 active:shadow-none transition-all group"
              >
                <div className="font-brand text-5xl group-active:scale-90 transition-transform">SAFE?</div>
              </button>
            ) : (
              <div className="animate-pop">
                <div className="text-8xl mb-2">✅</div>
                <div className="text-2xl font-brand text-emerald-400">YOU ARE SAFE</div>
              </div>
            )}
          </div>

          {!safe && (
            <div className="text-3xl font-brand text-white/30 italic">
              TAP IN {safetyCountdown}S...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewState === 'CHALLENGE') {
    if (safe) {
      return (
        <div className="fixed inset-0 z-[250] bg-indigo-950 flex flex-col items-center justify-center p-6 text-center">
           <div className="text-7xl mb-4">😌</div>
           <h2 className="text-3xl font-brand text-emerald-400">RESTING...</h2>
           <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs mt-4">Waiting for the unsafe ones</p>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[250] bg-rose-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="mb-6">
          <h2 className="text-xl font-brand text-white animate-pulse">MINI GAME!</h2>
          <p className="text-rose-300 font-black uppercase tracking-tighter text-sm italic">Hurry! Last to finish loses!</p>
        </div>

        {activeEvent.challengeType === 'QUIZ' && selectedQuiz ? (
          <div className="w-full max-w-sm space-y-4">
            <div className="bg-white/10 p-6 rounded-3xl border-2 border-white/20">
              <p className="text-xl font-bold">{selectedQuiz.question}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {selectedQuiz.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => i === selectedQuiz.correctIndex && handleChallengeComplete()}
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border-2 border-white/10 text-left font-bold transition-all active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[60vh] bg-black/20 rounded-3xl border-2 border-white/10 overflow-hidden">
             <div className="absolute top-4 left-0 right-0 text-[10px] font-black uppercase text-white/40 tracking-widest">TAP THE GREEN CIRCLE</div>
             {shapes.map(s => (
               <button
                 key={s.id}
                 onClick={() => s.id === 99 && handleChallengeComplete()}
                 className={`absolute transition-transform active:scale-90 ${s.color} ${s.type} shadow-lg`}
                 style={{
                   left: `${s.x}%`,
                   top: `${s.y}%`,
                   width: `${s.size}px`,
                   height: `${s.size}px`,
                 }}
               />
             ))}
          </div>
        )}
      </div>
    );
  }

  if (viewState === 'RESULTS' && results) {
    const iLost = results.loser?.id === playerId;

    return (
      <div className={`fixed inset-0 z-[250] flex flex-col items-center justify-center p-6 text-center animate-pop ${iLost ? 'bg-rose-950' : 'bg-indigo-950'}`}>
        <div className="space-y-8 w-full max-w-xs">
          {results.allSafe ? (
            <div className="space-y-4">
              <h2 className="text-5xl font-brand text-emerald-400">EVERYONE SAFE!</h2>
              <p className="text-white/60 font-black uppercase tracking-widest text-xs">No punishment this time.</p>
            </div>
          ) : (
            <>
              <div className="animate-bounce">
                {iLost ? (
                  <h2 className="text-5xl font-brand text-rose-500 uppercase italic">YOU LOSE! 💀</h2>
                ) : (
                  <h2 className="text-5xl font-brand text-white uppercase italic">ROUND OVER</h2>
                )}
              </div>

              <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-8 border-rose-500 scale-105">
                 <div className="text-[10px] font-black text-rose-500 uppercase mb-2 tracking-widest">The Snail</div>
                 <div className="text-4xl font-brand text-rose-600 mb-1 leading-none uppercase truncate break-all">{results.loser?.nickname}</div>
                 <div className="text-sm font-black text-rose-900 uppercase italic">Drink up!</div>
              </div>

              <div className="bg-rose-500/20 p-6 rounded-3xl border-2 border-rose-500/40">
                <div className="text-2xl font-brand text-white italic">
                  {rule.action} {rule.value} {rule.unit}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};
