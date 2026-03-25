import * as signalR from "@microsoft/signalr";
import { API_URL } from "./api";
import { getToken } from "./auth";

let connection: signalR.HubConnection | null = null;

export async function getSignalRConnection(): Promise<signalR.HubConnection> {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  const token = await getToken();

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/emergency`, {
      accessTokenFactory: () => token ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  await connection.start();
  return connection;
}

export async function stopSignalR(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}

export type EmergencyHubEvent =
  | "EmergencyActivated"
  | "EmergencyResolved"
  | "EmergencyEscalated"
  | "HelpRequestCreated"
  | "HelpOfferCreated"
  | "HelpMatched";

export function onEmergencyEvent(
  event: EmergencyHubEvent,
  handler: (...args: unknown[]) => void
): () => void {
  if (!connection) return () => {};
  connection.on(event, handler);
  return () => connection?.off(event, handler);
}
