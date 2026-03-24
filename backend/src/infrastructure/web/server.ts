import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.routes';
import { communityRouter } from './routes/community.routes';
import { emergencyRouter } from './routes/emergency.routes';
import { helpRouter } from './routes/help.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './socket/handlers';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hestia-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/communities', communityRouter);
app.use('/api/v1/emergencies', emergencyRouter);
app.use('/api/v1/help', helpRouter);

// Error handling
app.use(errorHandler);

// WebSocket
setupSocketHandlers(io);

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Hestia API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
