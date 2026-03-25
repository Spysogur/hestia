import * as signalR from '@microsoft/signalr';
import { Emergency, HelpOffer, HelpRequest } from './types';

const HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_URL || 'http://localhost:5000/hubs/emergency';

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }
  return connection;
}

export function connectSocket(_token?: string): signalR.HubConnection {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    conn.start().catch((err) => console.error('SignalR connection error:', err));
  }
  return conn;
}

export function disconnectSocket(): void {
  connection?.stop();
}

export function joinCommunityRoom(communityId: string): void {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    conn.invoke('JoinCommunity', communityId).catch(console.error);
  } else {
    conn.onreconnected(() => {
      conn.invoke('JoinCommunity', communityId).catch(console.error);
    });
  }
}

export function joinEmergencyRoom(_emergencyId: string): void {
  // SignalR hub groups by community — emergency events flow through community groups
  // If you add per-emergency groups on the hub, invoke JoinEmergency here
}

export function updateLocation(_userId: string, _lat: number, _lng: number): void {
  // Placeholder — invoke a hub method when server-side is implemented
}

export function emitHelpRequest(_emergencyId: string, _request: HelpRequest): void {
  // Server pushes via SignalR after creation — no client-side emit needed
}

export function emitHelpOffer(_emergencyId: string, _offer: HelpOffer): void {
  // Server pushes via SignalR after creation — no client-side emit needed
}

export function emitEmergencyAlert(_communityId: string, _emergency: Emergency): void {
  // Server pushes via SignalR after activation — no client-side emit needed
}

// ─── Compatibility layer: on/off wrappers matching Socket.io pattern ──────────

/** Listen for a SignalR event (same API as socket.on) */
export function onEvent(eventName: string, handler: (...args: any[]) => void): void {
  getConnection().on(eventName, handler);
}

/** Stop listening for a SignalR event (same API as socket.off) */
export function offEvent(eventName: string, handler: (...args: any[]) => void): void {
  getConnection().off(eventName, handler);
}

// ─── Legacy getSocket compat ──────────────────────────────────────────────────
// Hooks currently call getSocket().on() / .off() — provide a shim

export function getSocket() {
  const conn = getConnection();
  return {
    on: (event: string, handler: (...args: any[]) => void) => conn.on(event, handler),
    off: (event: string, handler: (...args: any[]) => void) => conn.off(event, handler),
  };
}
