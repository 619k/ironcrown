import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import {
    HeartbeatSchema, PlayerSyncSchema, InventorySyncSchema,
    EventLogSchema, JobResultSchema,
} from '../schemas';
import { prisma } from '../utils/prisma';
import { cache, CACHE_KEYS } from '../services/cache.service';
import { sendDiscordWebhook } from '../services/discord.service';

/** POST /api/bridge/heartbeat */
export const heartbeat = asyncHandler(async (req: Request, res: Response) => {
    const body = HeartbeatSchema.parse(req.body);
    const record = await prisma.pluginHeartbeat.create({
        data: {
            serverName: body.serverName,
            pluginVersion: body.pluginVersion,
            onlineCount: body.onlineCount,
            pingMs: body.pingMs
        }
    });

    await cache.set(CACHE_KEYS.SERVER_STATUS, { ...body, lastSeen: new Date() }, 60);
    res.json({ success: true, data: record });
});

/** POST /api/bridge/player-sync */
export const playerSync = asyncHandler(async (req: Request, res: Response) => {
    const { players } = PlayerSyncSchema.parse(req.body);

    // Upsert players and update online status
    await prisma.$transaction([
        // Mark all as offline first
        prisma.player.updateMany({ data: { isOnline: false } }),
        // Upsert each online player
        ...players.map((p) =>
            prisma.player.upsert({
                where: { steamId: p.steamId },
                update: {
                    playerName: p.playerName,
                    isOnline: true,
                    lastSeen: new Date(),
                    lastPositionX: p.x,
                    lastPositionY: p.y,
                    lastPositionZ: p.z,
                },
                create: {
                    steamId: p.steamId,
                    playerName: p.playerName,
                    isOnline: true,
                    lastPositionX: p.x,
                    lastPositionY: p.y,
                    lastPositionZ: p.z,
                },
            }),
        ),
    ]);

    // Cache the online player list (30s TTL for dashboard)
    await cache.set(CACHE_KEYS.ONLINE_PLAYERS, players, 30);

    res.json({ success: true, synced: players.length });
});

/** POST /api/bridge/inventory-sync */
export const inventorySync = asyncHandler(async (req: Request, res: Response) => {
    const body = InventorySyncSchema.parse(req.body);

    const player = await prisma.player.findUnique({ where: { steamId: body.steamId } });
    if (!player) {
        res.status(404).json({ error: 'Player not found' });
        return;
    }

    // Mark old snapshots as not latest
    await prisma.playerInventorySnapshot.updateMany({
        where: { playerId: player.id, isLatest: true },
        data: { isLatest: false },
    });

    // Create new snapshot with items
    const snapshot = await prisma.playerInventorySnapshot.create({
        data: {
            playerId: player.id,
            isLatest: true,
            items: {
                create: body.items.map((item) => ({
                    itemId: item.itemId,
                    itemGuid: item.itemGuid,
                    amount: item.amount,
                    durability: item.durability,
                    quality: item.quality,
                    gridX: item.gridX,
                    gridY: item.gridY,
                    rotation: item.rotation ?? 0,
                    container: item.container,
                    attachments: item.attachments ? JSON.parse(JSON.stringify(item.attachments)) : null,
                })),
            },
        },
        include: { items: true },
    });

    const createdItemsCount = (snapshot as any).items ? (snapshot as any).items.length : body.items.length;
    res.json({ success: true, data: { snapshotId: snapshot.id, itemCount: createdItemsCount } });
});

/** POST /api/bridge/event-log */
export const eventLog = asyncHandler(async (req: Request, res: Response) => {
    const body = EventLogSchema.parse(req.body);
    const record = await prisma.pluginEventLog.create({
        data: {
            eventType: body.eventType,
            steamId: body.steamId,
            playerName: body.playerName,
            metadata: body.metadata ? JSON.parse(JSON.stringify(body.metadata)) : null
        }
    });

    // Discord notification for player deaths if configured
    if (body.eventType === 'PLAYER_DEATH') {
        sendDiscordWebhook('PLAYER_DEATH', {
            title: `💀 ${body.playerName ?? body.steamId} died`,
            description: JSON.stringify(body.metadata ?? {}),
            color: 0xc0392b,
        }).catch(() => { });
    }

    res.json({ success: true, data: record });
});

/** GET /api/bridge/jobs/pending */
export const getPendingJobs = asyncHandler(async (_req: Request, res: Response) => {
    const jobs = await prisma.bridgeJob.findMany({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'asc' },
        take: 50,
    });

    // Mark as in-progress
    const ids = jobs.map((j) => j.id);
    if (ids.length > 0) {
        await prisma.bridgeJob.updateMany({
            where: { id: { in: ids } },
            data: { status: 'IN_PROGRESS', lastAttemptAt: new Date() },
        });
    }

    res.json({ success: true, data: jobs });
});

/** POST /api/bridge/jobs/:id/result */
export const jobResult = asyncHandler(async (req: Request, res: Response) => {
    const job = await prisma.bridgeJob.findUnique({ where: { id: req.params.id } });
    if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }

    const { success, result, errorMessage } = JobResultSchema.parse(req.body);

    if (success) {
        await prisma.bridgeJob.update({
            where: { id: job.id },
            data: { status: 'DONE', result, completedAt: new Date() },
        });
    } else {
        const nextAttempts = job.attempts + 1;
        const reachedMax = nextAttempts >= job.maxAttempts;
        await prisma.bridgeJob.update({
            where: { id: job.id },
            data: {
                status: reachedMax ? 'FAILED' : 'PENDING',
                attempts: nextAttempts,
                lastAttemptAt: new Date(),
                errorMessage,
            },
        });
    }

    res.json({ success: true });
});
