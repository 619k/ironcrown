import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { GiveItemSchema, PunishSchema } from '../schemas';
import {
    getPlayers, getPlayerById, getPlayerInventory, getPlayerLogs,
    punishPlayer, unbanPlayer, giveItem, clearPlayerInventory,
    createBridgeJob, logAdminAction,
} from '../services/player.service';

export const listPlayers = asyncHandler(async (req: Request, res: Response) => {
    const data = await getPlayers(req.query as Record<string, string>);
    res.json({ success: true, data });
});

export const getPlayer = asyncHandler(async (req: Request, res: Response) => {
    const data = await getPlayerById(req.params.id);
    res.json({ success: true, data });
});

export const getInventory = asyncHandler(async (req: Request, res: Response) => {
    const data = await getPlayerInventory(req.params.id);
    res.json({ success: true, data });
});

export const getPlayerLogsCtrl = asyncHandler(async (req: Request, res: Response) => {
    const data = await getPlayerLogs(req.params.id);
    res.json({ success: true, data });
});

export const giveItemCtrl = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId, amount, quality } = GiveItemSchema.parse(req.body);
    const job = await giveItem(
        req.params.id, itemId, amount, quality,
        req.user!.id, req.user!.username,
    );
    res.json({ success: true, data: job });
});

export const kickPlayer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reason } = PunishSchema.parse(req.body);
    const job = await createBridgeJob('KICK', req.params.id, { reason }, req.user!.id, req.user!.username);
    await logAdminAction({
        adminId: req.user!.id, adminName: req.user!.username,
        playerId: req.params.id, actionType: 'kick', actionData: { reason, jobId: job.id }, result: 'pending',
    });
    res.json({ success: true, data: job });
});

export const banPlayer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reason, evidence } = PunishSchema.parse(req.body);
    const punishment = await punishPlayer(req.params.id, 'PERMANENT_BAN', reason, req.user!.id, req.user!.username, { evidence });
    res.json({ success: true, data: punishment });
});

export const tempBanPlayer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reason, evidence, duration } = PunishSchema.parse(req.body);
    const expiresAt = duration ? new Date(Date.now() + duration * 60_000) : undefined;
    const punishment = await punishPlayer(req.params.id, 'TEMP_BAN', reason, req.user!.id, req.user!.username, { evidence, expiresAt });
    res.json({ success: true, data: punishment });
});

export const unbanPlayerCtrl = asyncHandler(async (req: AuthRequest, res: Response) => {
    await unbanPlayer(req.params.id, req.user!.id, req.user!.username);
    res.json({ success: true, message: 'Player unbanned' });
});

export const warnPlayer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reason } = PunishSchema.parse(req.body);
    const punishment = await punishPlayer(req.params.id, 'WARN', reason, req.user!.id, req.user!.username);
    res.json({ success: true, data: punishment });
});

export const clearInventoryCtrl = asyncHandler(async (req: AuthRequest, res: Response) => {
    const job = await clearPlayerInventory(req.params.id, req.user!.id, req.user!.username);
    res.json({ success: true, data: job });
});
