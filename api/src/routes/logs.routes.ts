import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireModerator } from '../middleware/rbac.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(authMiddleware, requireModerator);

/** GET /api/logs/admin-actions */
router.get('/admin-actions', asyncHandler(async (req, res) => {
    const { adminId, playerId, actionType, from, to, page = '1', limit = '30' } = req.query as Record<string, string>;
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));

    const where = {
        ...(adminId && { adminId }),
        ...(playerId && { playerId }),
        ...(actionType && { actionType }),
        ...(from || to ? {
            createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
            },
        } : {}),
    };

    const [logs, total] = await prisma.$transaction([
        prisma.adminActionLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (p - 1) * l,
            take: l,
            include: { admin: { select: { username: true } } },
        }),
        prisma.adminActionLog.count({ where }),
    ]);

    res.json({ success: true, data: logs, total, page: p, totalPages: Math.ceil(total / l) });
}));

/** GET /api/logs/punishments */
router.get('/punishments', asyncHandler(async (req, res) => {
    const { playerId, type, active, page = '1', limit = '30' } = req.query as Record<string, string>;
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));

    const where = {
        ...(playerId && { playerId }),
        ...(type && { type: type as never }),
        ...(active !== undefined && { isActive: active === 'true' }),
    };

    const [punishments, total] = await prisma.$transaction([
        prisma.punishment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (p - 1) * l,
            take: l,
            include: { player: { select: { steamId: true, playerName: true } } },
        }),
        prisma.punishment.count({ where }),
    ]);

    res.json({ success: true, data: punishments, total, page: p, totalPages: Math.ceil(total / l) });
}));

/** GET /api/logs/plugin */
router.get('/plugin', asyncHandler(async (req, res) => {
    const logs = await prisma.pluginHeartbeat.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
    });
    res.json({ success: true, data: logs });
}));

/** GET /api/logs/events */
router.get('/events', asyncHandler(async (req, res) => {
    const { eventType, steamId, page = '1', limit = '50' } = req.query as Record<string, string>;
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));

    const where = {
        ...(eventType && { eventType: eventType as never }),
        ...(steamId && { steamId }),
    };

    const [events, total] = await prisma.$transaction([
        prisma.pluginEventLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (p - 1) * l,
            take: l,
        }),
        prisma.pluginEventLog.count({ where }),
    ]);

    res.json({ success: true, data: events, total, page: p, totalPages: Math.ceil(total / l) });
}));

export default router;
