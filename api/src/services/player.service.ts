import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { JobType, PunishmentType } from '@prisma/client';
import { sendDiscordWebhook, buildPunishmentEmbed } from './discord.service';
import { cache, CACHE_KEYS } from './cache.service';

export async function getPlayers(query: { search?: string; online?: string; page?: string; limit?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where = {
        ...(query.search && {
            OR: [
                { steamId: { contains: query.search, mode: 'insensitive' as const } },
                { playerName: { contains: query.search, mode: 'insensitive' as const } },
            ],
        }),
        ...(query.online === 'true' && { isOnline: true }),
    };

    const [players, total] = await prisma.$transaction([
        prisma.player.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ isOnline: 'desc' }, { lastSeen: 'desc' }],
            include: { kingdom: { select: { id: true, name: true } }, village: { select: { id: true, name: true } } },
        }),
        prisma.player.count({ where }),
    ]);

    return { players, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPlayerById(id: string) {
    const player = await prisma.player.findUnique({
        where: { id },
        include: {
            kingdom: true,
            village: true,
            punishments: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
    });
    if (!player) throw new AppError('Player not found', 404);
    return player;
}

export async function getPlayerInventory(playerId: string) {
    const snapshot = await prisma.playerInventorySnapshot.findFirst({
        where: { playerId, isLatest: true },
        include: { items: { orderBy: { container: 'asc' } } },
    });
    return snapshot ?? null;
}

export async function getPlayerLogs(playerId: string) {
    const [actionLogs, eventLogs] = await prisma.$transaction([
        prisma.adminActionLog.findMany({
            where: { playerId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { admin: { select: { username: true } } },
        }),
        prisma.pluginEventLog.findMany({
            where: { steamId: { in: [(await prisma.player.findUnique({ where: { id: playerId }, select: { steamId: true } }))?.steamId ?? ''] } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }),
    ]);
    return { actionLogs, eventLogs };
}

export async function createBridgeJob(
    type: JobType,
    targetSteamId: string,
    payload: object,
    adminId?: string,
    adminName?: string,
) {
    return prisma.bridgeJob.create({
        data: {
            type,
            targetSteamId,
            payload,
            status: 'PENDING',
            maxAttempts: 3,
            createdByAdminId: adminId,
            createdByAdminName: adminName,
        },
    });
}

export async function logAdminAction(data: {
    adminId: string;
    adminName: string;
    playerId?: string;
    playerName?: string;
    actionType: string;
    actionData?: object;
    result?: string;
    ipAddress?: string;
}) {
    return prisma.adminActionLog.create({ data });
}

// ── Punishment helpers ────────────────────────────────────────────────────────

async function getPlayerSteamId(playerId: string) {
    const p = await prisma.player.findUnique({ where: { id: playerId }, select: { steamId: true, playerName: true } });
    if (!p) throw new AppError('Player not found', 404);
    return p;
}

export async function punishPlayer(
    playerId: string,
    type: PunishmentType,
    reason: string,
    adminId: string,
    adminName: string,
    extras?: { expiresAt?: Date; evidence?: string },
) {
    const player = await getPlayerSteamId(playerId);

    const punishment = await prisma.punishment.create({
        data: { playerId, adminId, type, reason, ...extras },
    });

    await logAdminAction({
        adminId,
        adminName,
        playerId,
        playerName: player.playerName,
        actionType: type.toLowerCase(),
        actionData: { reason, ...extras },
        result: 'success',
    });

    // Discord notification for serious punishments
    if (['PERMANENT_BAN', 'TEMP_BAN', 'KICK'].includes(type)) {
        sendDiscordWebhook(
            `PUNISHMENT_${type}`,
            buildPunishmentEmbed(type, adminName, player.playerName, reason),
        ).catch(() => { }); // fire and forget
    }

    return punishment;
}

export async function unbanPlayer(playerId: string, adminId: string, adminName: string) {
    const player = await getPlayerSteamId(playerId);

    await prisma.punishment.updateMany({
        where: { playerId, isActive: true, type: { in: ['PERMANENT_BAN', 'TEMP_BAN'] } },
        data: { isActive: false, unbannedById: adminId, unbannedAt: new Date() },
    });

    await logAdminAction({
        adminId, adminName,
        playerId, playerName: player.playerName,
        actionType: 'unban',
        result: 'success',
    });
}

export async function giveItem(
    playerId: string,
    itemId: number,
    amount: number,
    quality: number,
    adminId: string,
    adminName: string,
) {
    const player = await getPlayerSteamId(playerId);
    const job = await createBridgeJob(
        'GIVE_ITEM',
        player.steamId,
        { itemId, amount, quality },
        adminId,
        adminName,
    );

    await logAdminAction({
        adminId, adminName,
        playerId, playerName: player.playerName,
        actionType: 'give_item',
        actionData: { itemId, amount, quality, jobId: job.id },
        result: 'pending',
    });

    return job;
}

export async function clearPlayerInventory(playerId: string, adminId: string, adminName: string) {
    const player = await getPlayerSteamId(playerId);
    const job = await createBridgeJob('CLEAR_INVENTORY', player.steamId, {}, adminId, adminName);

    await logAdminAction({
        adminId, adminName,
        playerId, playerName: player.playerName,
        actionType: 'clear_inventory',
        actionData: { jobId: job.id },
        result: 'pending',
    });

    // Invalidate cached online players
    await cache.del(CACHE_KEYS.ONLINE_PLAYERS);
    return job;
}
