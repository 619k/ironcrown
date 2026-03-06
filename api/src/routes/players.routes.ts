import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireModerator, requireAdmin } from '../middleware/rbac.middleware';
import {
    listPlayers, getPlayer, getInventory, getPlayerLogsCtrl,
    giveItemCtrl, kickPlayer, banPlayer, tempBanPlayer,
    unbanPlayerCtrl, warnPlayer, clearInventoryCtrl,
} from '../controllers/players.controller';

const router = Router();

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
