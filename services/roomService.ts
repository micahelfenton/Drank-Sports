
import { Room, Player, Rule, Quiz } from '../types';

const ROOM_STORAGE_KEY = 'sportmix_rooms';
const SESSION_PLAYER_KEY = 'sportmix_session_player';
const SYNC_EVENT = 'sportmix_sync';

export class RoomService {
  private static getRooms(): Record<string, Room> {
    const data = localStorage.getItem(ROOM_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveRooms(rooms: Record<string, Room>) {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }

  static createRoom(hostNickname: string, sport: any, mode: any, rules: Rule[]): Room {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const hostId = Math.random().toString(36).substring(2, 9);
    const host: Player = { id: hostId, nickname: hostNickname, score: 0, isHost: true };
    const newRoom: Room = { code, sport, mode, status: 'lobby', rules, players: [host] };
    const rooms = this.getRooms();
    rooms[code] = newRoom;
    this.saveRooms(rooms);
    localStorage.setItem(SESSION_PLAYER_KEY, JSON.stringify({ roomId: code, playerId: hostId }));
    return newRoom;
  }

  static joinRoom(code: string, nickname: string): Room | null {
    const rooms = this.getRooms();
    const room = rooms[code];
    if (!room) return null;
    const playerId = Math.random().toString(36).substring(2, 9);
    const newPlayer: Player = { id: playerId, nickname, score: 0, isHost: false };
    room.players.push(newPlayer);
    this.saveRooms(rooms);
    localStorage.setItem(SESSION_PLAYER_KEY, JSON.stringify({ roomId: code, playerId }));
    return room;
  }

  static leaveRoom() {
    localStorage.removeItem(SESSION_PLAYER_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }

  static getRoom(code: string): Room | null {
    return this.getRooms()[code] || null;
  }

  static getCurrentSession(): { roomId: string; playerId: string } | null {
    const data = localStorage.getItem(SESSION_PLAYER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static updateRoom(code: string, updates: Partial<Room>) {
    const rooms = this.getRooms();
    if (rooms[code]) {
      rooms[code] = { ...rooms[code], ...updates };
      this.saveRooms(rooms);
    }
  }

  static triggerRule(roomCode: string, ruleId: string) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room) return;
    
    // Pick a random mini-game type for this event
    const challengeType = Math.random() > 0.5 ? 'SHAPES' : 'QUIZ';

    room.activeEvent = {
      ruleId,
      startTime: Date.now(),
      challengeType: challengeType as any,
      safetyLog: {} // playerId -> timestamp or null
    };
    room.players.forEach(p => delete p.lastReactionTime);
    this.saveRooms(rooms);
  }

  static submitSafetyTap(roomCode: string, playerId: string) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room || !room.activeEvent) return;
    if (!room.activeEvent.safetyLog) room.activeEvent.safetyLog = {};
    
    // Only log first tap
    if (!room.activeEvent.safetyLog[playerId]) {
      room.activeEvent.safetyLog[playerId] = Date.now();
      this.saveRooms(rooms);
    }
  }

  static submitChallengeCompletion(roomCode: string, playerId: string) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room || !room.activeEvent) return;
    const player = room.players.find(p => p.id === playerId);
    if (player && !player.lastReactionTime) {
      player.lastReactionTime = Date.now();
      this.saveRooms(rooms);
    }
  }

  static finalizeResults(roomCode: string, loserId: string) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room) return;
    const loser = room.players.find(p => p.id === loserId);
    if (loser) {
      loser.score = (loser.score || 0) + 1;
    }
    this.saveRooms(rooms);
  }

  static triggerQuiz(roomCode: string, quiz: Quiz) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room) return;
    room.activeQuiz = {
      id: quiz.id,
      startTime: Date.now(),
      answers: {}
    };
    this.saveRooms(rooms);
  }

  static submitQuizAnswer(roomCode: string, playerId: string, optionIndex: number) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room || !room.activeQuiz) return;
    room.activeQuiz.answers[playerId] = optionIndex;
    this.saveRooms(rooms);
  }

  static clearActiveStates(roomCode: string) {
    const rooms = this.getRooms();
    const room = rooms[roomCode];
    if (!room) return;
    delete room.activeEvent;
    delete room.activeQuiz;
    this.saveRooms(rooms);
  }

  static onSync(callback: () => void) {
    const handler = () => callback();
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }
}
