import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler } from '../middleware/error.middleware';

export const listPunishments = asyncHandler(async (req: Request, res: Response) => {
    const punishments = await prisma.punishment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
            player: {
                select: {
                    playerName: true,
                    steamId: true
                }
            }
        }
    });

    res.json({ success: true, data: punishments });
});
