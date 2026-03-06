import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireModerator, requireAdmin } from '../middleware/rbac.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(authMiddleware, requireModerator);

router.get('/', asyncHandler(async (_req, res) => {
    const kingdoms = await prisma.kingdom.findMany({
        include: { villages: { select: { id: true, name: true } }, _count: { select: { players: true } } },
        orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: kingdoms });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const kingdom = await prisma.kingdom.findUnique({
        where: { id: req.params.id },
        include: { players: { select: { id: true, playerName: true, isOnline: true } }, villages: true },
    });
    if (!kingdom) { res.status(404).json({ error: 'Kingdom not found' }); return; }
    res.json({ success: true, data: kingdom });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
    const kingdom = await prisma.kingdom.create({ data: req.body });
    res.status(201).json({ success: true, data: kingdom });
}));

router.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
    const kingdom = await prisma.kingdom.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: kingdom });
}));

export default router;
