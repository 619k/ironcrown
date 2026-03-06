import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
});

export const GiveItemSchema = z.object({
    itemId: z.number().int().positive(),
    amount: z.number().int().min(1).max(100),
    quality: z.number().int().min(1).max(100).optional().default(100),
});

export const PunishSchema = z.object({
    reason: z.string().min(3, 'Reason too short').max(500),
    evidence: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
    duration: z.number().int().positive().optional(), // minutes for temp ban
});

export const CreateWarSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    zone: z.object({ x: z.number(), y: z.number(), radius: z.number() }).optional(),
    sides: z.array(
        z.object({
            name: z.string(),
            kingdomId: z.string().optional(),
        }),
    ).min(2),
});

export const HeartbeatSchema = z.object({
    serverName: z.string(),
    pluginVersion: z.string(),
    onlineCount: z.number().int().min(0),
    pingMs: z.number().optional(),
});

export const PlayerSyncSchema = z.object({
    players: z.array(
        z.object({
            steamId: z.string(),
            playerName: z.string(),
            x: z.number().optional(),
            y: z.number().optional(),
            z: z.number().optional(),
        }),
    ),
});

export const InventorySyncSchema = z.object({
    steamId: z.string(),
    items: z.array(
        z.object({
            itemId: z.number().int(),
            itemGuid: z.string().optional(),
            amount: z.number().int().min(1),
            durability: z.number().min(0).max(100),
            quality: z.number().int().min(0).max(100),
            gridX: z.number().int().optional(),
            gridY: z.number().int().optional(),
            rotation: z.number().int().optional(),
            container: z.string(),
            attachments: z.record(z.unknown()).optional(),
        }),
    ),
});

export const EventLogSchema = z.object({
    eventType: z.enum(['PLAYER_JOIN', 'PLAYER_LEAVE', 'PLAYER_DEATH', 'ITEM_PICKUP', 'ITEM_DROP']),
    steamId: z.string(),
    playerName: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

export const JobResultSchema = z.object({
    success: z.boolean(),
    result: z.string().optional(),
    errorMessage: z.string().optional(),
});
