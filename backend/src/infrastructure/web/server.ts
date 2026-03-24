import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

import { createContainer } from '../di/container';
import { createAuthRouter } from './routes/auth.routes';
import { createCommunityRouter } from './routes/community.routes';
import { createEmergencyRouter } from './routes/emergency.routes';
import { createHelpRouter } from './routes/help.routes';
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

// DI container
const container = createContainer(io);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hestia-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', createAuthRouter(container));
app.use('/api/v1/communities', createCommunityRouter(container));
app.use('/api/v1/emergencies', createEmergencyRouter(container));
app.use('/api/v1/help', createHelpRouter(container));

// Error handling
app.use(errorHandler);

// WebSocket
setupSocketHandlers(io);

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Hestia API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
