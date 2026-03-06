import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireModerator } from '../middleware/rbac.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { prisma } from '../utils/prisma';
import { cache, CACHE_KEYS } from '../services/cache.service';

const router = Router();
router.use(authMiddleware, requireModerator);

/** GET /api/map/players — online player positions */
router.get('/players', asyncHandler(async (_req, res) => {
    // Try cache first (30s TTL set by player-sync)
    const cached = await cache.get<unknown[]>(CACHE_KEYS.ONLINE_PLAYERS);
    if (cached) {
        res.json({ success: true, data: cached, source: 'cache' });
        return;
    }

    const players = await prisma.player.findMany({
        where: { isOnline: true, lastPositionX: { not: null } },
        select: {
            id: true, steamId: true, playerName: true, avatarUrl: true,
            lastPositionX: true, lastPositionY: true, lastPositionZ: true,
            kingdomId: true, villageId: true,
        },
    });
    res.json({ success: true, data: players, source: 'db' });
}));

/** GET /api/map/zones — village, kingdom, and active war zones */
router.get('/zones', asyncHandler(async (_req, res) => {
    const [kingdoms, villages, wars] = await prisma.$transaction([
        prisma.kingdom.findMany({
            where: { isActive: true, mapZone: { not: {} } },
            select: { id: true, name: true, colorHex: true, mapZone: true },
        }),
        prisma.village.findMany({
            where: { isActive: true, mapZone: { not: {} } },
            select: { id: true, name: true, kingdomId: true, mapZone: true },
        }),
        prisma.war.findMany({
            where: { status: 'ACTIVE', zone: { not: {} } },
            select: { id: true, name: true, zone: true, status: true },
        }),
    ]);

    res.json({ success: true, data: { kingdoms, villages, wars } });
}));

/** GET /api/map/status — server status from cache */
router.get('/status', asyncHandler(async (_req, res) => {
    const status = await cache.get<unknown>(CACHE_KEYS.SERVER_STATUS);
    const lastHeartbeat = await prisma.pluginHeartbeat.findFirst({ orderBy: { createdAt: 'desc' } });
    const onlineCount = await prisma.player.count({ where: { isOnline: true } });

    res.json({
        success: true,
        data: {
            ...((status as object) ?? {}),
            onlineCount,
            isOnline: lastHeartbeat
                ? (new Date().getTime() - lastHeartbeat.createdAt.getTime()) < 120_000
                : false,
            lastSeen: lastHeartbeat?.createdAt,
        },
    });
}));

export default router;
