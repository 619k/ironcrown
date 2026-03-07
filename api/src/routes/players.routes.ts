import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireModerator, requireAdmin } from '../middleware/rbac.middleware';
import { apiKeyMiddleware } from '../middleware/apikey.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { prisma } from '../utils/prisma';
import {
    listPlayers, getPlayer, getInventory, getPlayerLogsCtrl,
    giveItemCtrl, kickPlayer, banPlayer, tempBanPlayer,
    unbanPlayerCtrl, warnPlayer, clearInventoryCtrl,
} from '../controllers/players.controller';

const router = Router();

// ── Plugin-only: upsert player on join (no admin auth, uses API key) ───────
router.post('/upsert', apiKeyMiddleware, asyncHandler(async (req, res) => {
    const { steamId, playerName } = req.body as { steamId: string; playerName: string };
    if (!steamId || !playerName) {
        res.status(400).json({ error: 'steamId and playerName are required' });
        return;
    }
    const player = await prisma.player.upsert({
        where: { steamId },
        create: { steamId, playerName, isOnline: true, firstSeen: new Date(), lastSeen: new Date() },
        update: { playerName, isOnline: true, lastSeen: new Date() },
    });
    res.json({ success: true, data: player });
}));

// All player routes require authentication
router.use(authMiddleware);

router.get('/', requireModerator, listPlayers);
router.get('/:id', requireModerator, getPlayer);
router.get('/:id/inventory', requireModerator, getInventory);
router.get('/:id/logs', requireModerator, getPlayerLogsCtrl);

router.post('/:id/give-item', requireAdmin, giveItemCtrl);
router.post('/:id/kick', requireModerator, kickPlayer);
router.post('/:id/ban', requireAdmin, banPlayer);
router.post('/:id/temp-ban', requireModerator, tempBanPlayer);
router.post('/:id/unban', requireAdmin, unbanPlayerCtrl);
router.post('/:id/warn', requireModerator, warnPlayer);

router.delete('/:id/inventory/clear', requireAdmin, clearInventoryCtrl);

export default router;
