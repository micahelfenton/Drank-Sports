
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { RoomService } from './services/roomService';
import { STARTER_RULE_PACKS, SAMPLE_QUIZZES } from './constants';
import { Room, Player, Rule, Sport, GameMode } from './types';
import { RuleManager } from './components/RuleManager';
import { EventOverlay } from './components/EventOverlay';
import { QuizOverlay } from './components/QuizOverlay';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'create' | 'join' | 'lobby' | 'config' | 'game'>('home');
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<Player | null>(null);
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport>('Basketball');
  const [selectedMode, setSelectedMode] = useState<GameMode>('Drinking');

  const performExit = useCallback(() => {
    RoomService.leaveRoom();
    setRoom(null);
    setUser(null);
    setView('home');
    setJoinCode('');
    // We keep the nickname for convenience when re-joining
  }, []);

  const handleQuitRoom = (showConfirm = true) => {
    if (showConfirm && view !== 'home') {
      if (!confirm('Are you sure you want to quit the current game?')) return;
    }
    performExit();
  };

  const syncRoom = useCallback(() => {
    const session = RoomService.getCurrentSession();
    if (session) {
      const updatedRoom = RoomService.getRoom(session.roomId);
      if (updatedRoom) {
        setRoom(updatedRoom);
        const currentUser = updatedRoom.players.find(p => p.id === session.playerId);
        if (currentUser) {
          setUser(currentUser);
          if (updatedRoom.status === 'playing') setView('game');
          else if (updatedRoom.status === 'config') setView('config');
          else if (updatedRoom.status === 'lobby') setView('lobby');
        } else {
          // Player no longer in the room
          performExit();
        }
      } else {
        // Room no longer exists
        performExit();
      }
    } else {
      // No active session, ensure we are at home
      if (view !== 'home' && view !== 'create' && view !== 'join') {
        performExit();
      }
    }
  }, [view, performExit]);

  useEffect(() => {
    syncRoom();
    return RoomService.onSync(syncRoom);
  }, [syncRoom]);

  const handleCreateRoom = () => {
    if (!nickname) return alert('Enter a nickname!');
    const initialPack = STARTER_RULE_PACKS.find(p => p.sport === selectedSport && p.mode === selectedMode);
    const newRoom = RoomService.createRoom(nickname, selectedSport, selectedMode, initialPack?.rules || []);
    setRoom(newRoom);
    setUser(newRoom.players[0]);
    setView('lobby');
  };

  const handleJoinRoom = () => {
    if (!nickname || !joinCode) return alert('Enter nickname and code!');
    const joinedRoom = RoomService.joinRoom(joinCode.toUpperCase(), nickname);
    if (!joinedRoom) return alert('Room not found!');
    setRoom(joinedRoom);
    setView('lobby');
  };

  const activeRule = room?.activeEvent ? room.rules.find(r => r.id === room.activeEvent?.ruleId) : null;
  const activeQuiz = room?.activeQuiz ? SAMPLE_QUIZZES.find(q => q.id === room.activeQuiz?.id) : null;

  // --- HOME ---
  if (view === 'home') {
    return (
      <Layout scrollable={false}>
        <div className="flex flex-col items-center h-full text-center justify-between pb-8 pt-10">
          <div className="animate-pop px-6">
            <div className="inline-block bg-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-4 border border-indigo-400/20">
              Multiplayer Engine V1.4
            </div>
            <h1 className="text-6xl sm:text-7xl font-brand text-rose-500 drop-shadow-[0_6px_0_rgb(159,18,57)] rotate-[-1deg] leading-none mb-2 break-words">SPORTMIX</h1>
            <p className="text-indigo-200/60 text-[10px] font-black uppercase tracking-[0.5em]">Live Second-Screen Fun</p>
          </div>
          
          <div className="w-full flex flex-col gap-5 px-8 max-w-sm">
            <button onClick={() => setView('create')} className="bg-indigo-600 hover:bg-indigo-500 p-6 rounded-[2rem] shadow-xl border-b-[8px] border-indigo-900 active:translate-y-1 active:border-b-0 transition-all">
              <span className="font-brand text-3xl block">HOST</span>
            </button>
            <button onClick={() => setView('join')} className="bg-rose-600 hover:bg-rose-500 p-6 rounded-[2rem] shadow-xl border-b-[8px] border-rose-900 active:translate-y-1 active:border-b-0 transition-all">
              <span className="font-brand text-3xl block">JOIN</span>
            </button>
          </div>

          <div className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30">Couch Mode Activated</div>
        </div>
      </Layout>
    );
  }

  // --- CREATE ---
  if (view === 'create') {
    return (
      <Layout scrollable>
        <div className="bg-white/5 p-8 rounded-[3rem] border-2 border-white/10 mt-2 mb-10 space-y-6 shadow-2xl mx-2 animate-pop">
          <h2 className="font-brand text-3xl text-indigo-400 text-center uppercase italic leading-none">Setup Room</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest px-4">Your Nickname</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Player 1" className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-xl outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest px-4">Select Sport</label>
                <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value as Sport)} className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-4 font-bold appearance-none text-sm text-white">
                  <option value="Basketball">🏀 Basketball</option>
                  <option value="Soccer">⚽ Soccer</option>
                  <option value="Rugby">🏉 Rugby</option>
                  <option value="Golf">⛳ Golf</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest px-4">Game Mode</label>
                <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value as GameMode)} className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-4 font-bold appearance-none text-sm text-white">
                  <option value="Drinking">🍻 Drinking</option>
                  <option value="Kids">🧃 Kids</option>
                </select>
              </div>
            </div>
          </div>
          <button onClick={handleCreateRoom} className="w-full bg-indigo-600 p-5 rounded-[2rem] font-brand text-3xl shadow-xl border-b-4 border-indigo-900 active:translate-y-1 active:border-b-0">CONTINUE</button>
          <button onClick={() => setView('home')} className="w-full text-indigo-400 font-black text-[10px] uppercase tracking-widest text-center py-2">Back to Menu</button>
        </div>
      </Layout>
    );
  }

  // --- JOIN ---
  if (view === 'join') {
    return (
      <Layout>
        <div className="bg-white/5 p-10 rounded-[3rem] border-2 border-white/10 mt-8 space-y-8 shadow-3xl mx-2 animate-pop">
          <h2 className="font-brand text-4xl text-center text-rose-500 uppercase italic">Join Squad</h2>
          <div className="space-y-4 text-center">
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" className="w-full bg-black/40 border-4 border-white/10 rounded-[2rem] p-6 text-6xl text-center font-brand focus:border-rose-500 outline-none uppercase tracking-tighter" />
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname" className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-xl text-center outline-none" />
          </div>
          <button onClick={handleJoinRoom} className="w-full bg-rose-600 p-6 rounded-[2.5rem] font-brand text-3xl shadow-xl border-b-4 border-rose-900 active:translate-y-1 active:border-b-0">I'M IN!</button>
          <button onClick={() => setView('home')} className="w-full text-rose-400 font-black text-[10px] uppercase tracking-widest text-center py-2">Back</button>
        </div>
      </Layout>
    );
  }

  // --- LOBBY ---
  if (view === 'lobby' && room) {
    return (
      <Layout scrollable>
        <div className="space-y-6 pt-4 pb-12 px-2 relative animate-pop">
          <div className="bg-white/5 p-8 rounded-[3rem] border-2 border-white/10 text-center relative overflow-hidden shadow-2xl">
            <button onClick={() => handleQuitRoom(true)} className="absolute top-4 right-4 bg-rose-600 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase border border-white/20 z-20 active:scale-95 transition-all shadow-lg">QUIT</button>
            <div className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-40">Join Code</div>
            <div className="text-7xl font-brand mb-6 text-white leading-none break-all">{room.code}</div>
            <div className="bg-white p-4 rounded-[2rem] inline-block mb-6 shadow-xl border-4 border-indigo-400/10">
               <div className={`w-40 h-40 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://sportmix.social/join/${room.code}')] bg-cover`}></div>
            </div>
            <div className="text-xl font-brand text-indigo-300 uppercase tracking-[0.2em]">{room.sport} • {room.mode}</div>
          </div>

          <div className="bg-white/5 p-6 rounded-[2.5rem] border-2 border-white/5 shadow-lg">
            <h3 className="font-brand text-lg text-indigo-400 mb-6 uppercase italic">Players ({room.players.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.players.map(p => (
                <div key={p.id} className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-3 animate-pop overflow-hidden">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex-shrink-0 flex items-center justify-center font-brand text-xl">{p.nickname.charAt(0)}</div>
                  <span className="font-black truncate text-[12px] uppercase tracking-tight overflow-hidden break-words">{p.nickname} {p.isHost && '👑'}</span>
                </div>
              ))}
            </div>
          </div>

          {user?.isHost ? (
            <button 
              onClick={() => RoomService.updateRoom(room.code, { status: 'config' })}
              className="w-full bg-emerald-600 p-6 rounded-[2.5rem] font-brand text-3xl shadow-xl border-b-6 border-emerald-900 active:translate-y-1 active:border-b-0"
            >
              RULES SETTINGS →
            </button>
          ) : (
             <div className="p-12 bg-indigo-800/10 border-4 border-dashed border-white/10 rounded-[3rem] text-center">
                <div className="text-xl font-brand uppercase animate-pulse text-indigo-400 italic">Waiting for Captain...</div>
             </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- CONFIG ---
  if (view === 'config' && room) {
    return (
      <Layout scrollable>
        <div className="space-y-6 pt-4 pb-20 px-2 relative animate-pop">
          <div className="flex justify-between items-end px-2 mb-4">
            <div className="max-w-[60%]">
              <span className="text-rose-500 font-black text-[10px] uppercase tracking-widest">{room.sport}</span>
              <h2 className="text-4xl font-brand leading-none text-white italic truncate uppercase">GAME RULES</h2>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button onClick={() => handleQuitRoom(true)} className="bg-rose-600 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase border border-white/20 active:scale-95 transition-all shadow-lg">Quit</button>
              <div className="bg-indigo-600/30 p-2 rounded-xl border border-indigo-400/20 text-center min-w-[70px]">
                <div className="text-[8px] font-black text-indigo-300 uppercase">Room</div>
                <div className="text-lg font-brand leading-none">{room.code}</div>
              </div>
            </div>
          </div>

          <RuleManager 
            rules={room.rules} 
            onUpdate={(rules) => RoomService.updateRoom(room.code, { rules })}
          />

          {user?.isHost ? (
            <button 
              onClick={() => RoomService.updateRoom(room.code, { status: 'playing' })}
              className="w-full bg-rose-600 p-6 rounded-[2.5rem] font-brand text-4xl shadow-xl border-b-8 border-rose-900 active:translate-y-1 active:border-b-0 mt-4"
            >
              START GAME! ⚡
            </button>
          ) : (
            <div className="p-12 bg-rose-900/5 border-4 border-dashed border-rose-500/10 rounded-[3rem] text-center">
               <div className="text-xl font-brand uppercase text-rose-500/60 animate-pulse italic">Setting the scene...</div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- GAME ---
  if (view === 'game' && room) {
    const shameLeaderboard = [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
      <Layout scrollable={false}>
        <div className="h-full flex flex-col justify-between overflow-hidden relative">
          
          {room.activeEvent && activeRule && (
            <EventOverlay 
              rule={activeRule} 
              players={room.players}
              playerId={user?.id || ''}
              roomCode={room.code}
              onComplete={() => user?.isHost && RoomService.clearActiveStates(room.code)}
              isHost={user?.isHost || false}
              activeEvent={room.activeEvent}
            />
          )}

          {room.activeQuiz && activeQuiz && (
            <QuizOverlay 
              quiz={activeQuiz}
              playerId={user?.id || ''}
              onAnswer={(idx) => RoomService.submitQuizAnswer(room.code, user?.id || '', idx)}
              onComplete={() => user?.isHost && RoomService.clearActiveStates(room.code)}
            />
          )}

          {/* Live Dashboard Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-[2rem] border border-white/10 shadow-xl mt-1 mx-2">
            <div className="flex-1 overflow-hidden">
               <span className="text-rose-500 font-black text-[8px] uppercase tracking-[0.3em]">{room.sport} LIVE</span>
               <h2 className="text-2xl font-brand leading-none text-white italic truncate uppercase">{room.mode}</h2>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0">
              <div className="bg-indigo-600/50 p-2 rounded-xl text-center border border-indigo-400/20">
                <div className="text-[8px] font-black text-indigo-300 uppercase leading-none mb-0.5">Room</div>
                <div className="text-sm font-brand leading-none">{room.code}</div>
              </div>
              <button onClick={() => handleQuitRoom(true)} className="bg-rose-600 p-2.5 rounded-xl text-[10px] font-black text-white border border-white/20 uppercase active:scale-95 transition-all shadow-lg">QUIT</button>
            </div>
          </div>

          {/* Action Deck Area */}
          <div className="flex-1 flex flex-col justify-center p-2 overflow-hidden mx-2">
            {user?.isHost ? (
              <div className="h-full flex flex-col pt-2">
                <div className="flex justify-between items-center mb-3 px-3">
                  <h3 className="font-brand text-lg text-rose-400 italic uppercase">Captain's Deck</h3>
                  <button onClick={() => {
                    const q = SAMPLE_QUIZZES[Math.floor(Math.random() * SAMPLE_QUIZZES.length)];
                    RoomService.triggerQuiz(room.code, q);
                  }} className="bg-amber-500 px-4 py-2 rounded-xl font-brand text-[10px] text-black shadow-lg animate-bounce">TRIGGER QUIZ</button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 gap-3 pb-4 px-1">
                  {room.rules.filter(r => r.enabled).map(rule => (
                    <button 
                      key={rule.id}
                      onClick={() => RoomService.triggerRule(room.code, rule.id)}
                      className="bg-indigo-600/30 hover:bg-indigo-600/50 p-4 rounded-[1.8rem] border-2 border-white/10 font-brand text-lg sm:text-xl flex justify-between items-center active:scale-95 transition-all text-left group overflow-hidden"
                    >
                      <span className="uppercase italic tracking-tight break-words pr-2 leading-tight flex-1 line-clamp-2">{rule.label}</span>
                      <div className="w-12 h-12 bg-rose-600 rounded-full flex-shrink-0 flex items-center justify-center text-2xl animate-pulse">⚡</div>
                    </button>
                  ))}
                  <button 
                    onClick={() => RoomService.updateRoom(room.code, { status: 'config' })}
                    className="w-full py-5 border-2 border-dashed border-indigo-400/20 rounded-[2rem] text-xs font-black uppercase text-indigo-400/60 mt-2"
                  >
                    + Add More Rules
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-8 px-4 py-10">
                <div className="relative inline-block">
                   <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 animate-pulse"></div>
                   <div className="text-8xl grayscale opacity-10 rotate-12">📡</div>
                </div>
                <h3 className="text-4xl font-brand italic text-white uppercase leading-none break-words px-4 drop-shadow-lg">EYES ON THE SCREEN!</h3>
                <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Waiting for Game Action...</p>
              </div>
            )}
          </div>

          {/* Leaderboard Footer */}
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-t-[3.5rem] border-x border-t border-white/20 h-44 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
             <div className="flex justify-between items-center mb-3 px-5">
               <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Shame Leaderboard</h4>
               <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest animate-pulse">● LIVE</span>
             </div>
             <div className="flex gap-4 overflow-x-auto no-scrollbar px-3 pb-2">
                {shameLeaderboard.map((p, idx) => (
                  <div key={p.id} className={`flex-shrink-0 flex flex-col items-center gap-2 p-3.5 rounded-[2rem] border transition-all min-w-[95px] max-w-[110px] ${idx === 0 && p.score > 0 ? 'bg-rose-600/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-white/5 border-white/10'}`}>
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-brand text-xl ${idx === 0 && p.score > 0 ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                        {p.nickname.charAt(0)}
                      </div>
                      {idx === 0 && p.score > 0 && <span className="absolute -top-2 -right-2 text-base animate-bounce">💩</span>}
                    </div>
                    <div className="text-center w-full">
                      <div className="text-[10px] font-black uppercase truncate w-full px-1">{p.nickname}</div>
                      <div className="text-[11px] font-brand text-rose-400 leading-none mt-0.5">{p.score || 0} PTS</div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default App;
