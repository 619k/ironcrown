import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireModerator, requireAdmin } from '../middleware/rbac.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { prisma } from '../utils/prisma';
import { CreateWarSchema } from '../schemas';
import { sendDiscordWebhook, buildWarEmbed } from '../services/discord.service';

const router = Router();
router.use(authMiddleware, requireModerator);

// Villages
router.get('/villages', asyncHandler(async (_req, res) => {
    const villages = await prisma.village.findMany({
        include: { kingdom: { select: { id: true, name: true } }, _count: { select: { players: true } } },
        orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: villages });
}));

// Wars
router.get('/', asyncHandler(async (_req, res) => {
    const wars = await prisma.war.findMany({
        include: { sides: { include: { kingdom: { select: { id: true, name: true } }, _count: { select: { participants: true } } } } },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, data: wars });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const war = await prisma.war.findUnique({
        where: { id: req.params.id },
        include: { sides: { include: { participants: { include: { player: { select: { id: true, playerName: true, isOnline: true } } } }, kingdom: true } } },
    });
    if (!war) { res.status(404).json({ error: 'War not found' }); return; }
    res.json({ success: true, data: war });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
    const body = CreateWarSchema.parse(req.body);
    const war = await prisma.war.create({
        data: {
            name: body.name,
            description: body.description,
            zone: body.zone,
            sides: { create: body.sides.map((s) => ({ name: s.name, kingdomId: s.kingdomId })) },
        },
        include: { sides: true },
    });
    res.status(201).json({ success: true, data: war });
}));

router.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
    const { status, startTime, endTime, zone, winnerId, notes } = req.body;
    const war = await prisma.war.update({
        where: { id: req.params.id },
        data: { status, startTime, endTime, zone, winnerId, notes },
    });
    if (status) {
        sendDiscordWebhook('WAR_STATUS', buildWarEmbed(war.name, status)).catch(() => { });
    }
    res.json({ success: true, data: war });
}));

export default router;
