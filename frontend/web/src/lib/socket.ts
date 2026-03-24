import { io, Socket } from 'socket.io-client';
import { Emergency, HelpOffer, HelpRequest } from './types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}

export function connectSocket(token?: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    if (token) {
      s.auth = { token };
    }
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}

export function joinCommunityRoom(communityId: string): void {
  getSocket().emit('join:community', communityId);
}

export function joinEmergencyRoom(emergencyId: string): void {
  getSocket().emit('join:emergency', emergencyId);
}

export function updateLocation(userId: string, lat: number, lng: number): void {
  getSocket().emit('location:update', { userId, lat, lng });
}

export function emitHelpRequest(emergencyId: string, request: HelpRequest): void {
  getSocket().emit('help:request:new', { emergencyId, request });
}

export function emitHelpOffer(emergencyId: string, offer: HelpOffer): void {
  getSocket().emit('help:offer:new', { emergencyId, offer });
}

export function emitEmergencyAlert(communityId: string, emergency: Emergency): void {
  getSocket().emit('emergency:alert', { communityId, emergency });
}

// ─── Event listeners ──────────────────────────────────────────────────────────

export type SocketEvents = {
  'emergency:activated': (emergency: Emergency) => void;
  'help:request:created': (request: HelpRequest) => void;
  'help:offer:created': (offer: HelpOffer) => void;
  'help:match:created': (match: { request: HelpRequest; offer: HelpOffer }) => void;
  'location:updated': (data: { userId: string; lat: number; lng: number }) => void;
};
