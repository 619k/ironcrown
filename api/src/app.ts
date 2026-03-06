import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import playersRoutes from './routes/players.routes';
import bridgeRoutes from './routes/bridge.routes';
import kingdomsRoutes from './routes/kingdoms.routes';
import warsRoutes from './routes/wars.routes';
import logsRoutes from './routes/logs.routes';
import mapRoutes from './routes/map.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ─────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// ── Request logging ───────────────────────────────────
app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ironcrown-api', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/bridge', bridgeRoutes);
app.use('/api/kingdoms', kingdomsRoutes);
app.use('/api/wars', warsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/map', mapRoutes);

// ── 404 handler ───────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────
app.listen(PORT, () => {
    logger.info(`🏰 IronCrown API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
