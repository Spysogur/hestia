import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join community room
    socket.on('join:community', (communityId: string) => {
      socket.join(`community:${communityId}`);
      console.log(`👥 ${socket.id} joined community:${communityId}`);
    });

    // Join emergency room
    socket.on('join:emergency', (emergencyId: string) => {
      socket.join(`emergency:${emergencyId}`);
      console.log(`🚨 ${socket.id} joined emergency:${emergencyId}`);
    });

    // Location update
    socket.on('location:update', (data: { userId: string; lat: number; lng: number }) => {
      // Broadcast to relevant rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit('location:updated', data);
        }
      });
    });

    // New help request notification
    socket.on('help:request:new', (data: { emergencyId: string; request: unknown }) => {
      io.to(`emergency:${data.emergencyId}`).emit('help:request:created', data.request);
    });

    // New help offer notification
    socket.on('help:offer:new', (data: { emergencyId: string; offer: unknown }) => {
      io.to(`emergency:${data.emergencyId}`).emit('help:offer:created', data.offer);
    });

    // Match notification
    socket.on('help:matched', (data: { emergencyId: string; match: unknown }) => {
      io.to(`emergency:${data.emergencyId}`).emit('help:match:created', data.match);
    });

    // Emergency alert
    socket.on('emergency:alert', (data: { communityId: string; emergency: unknown }) => {
      io.to(`community:${data.communityId}`).emit('emergency:activated', data.emergency);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
