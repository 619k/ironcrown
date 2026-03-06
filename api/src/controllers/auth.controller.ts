import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { LoginSchema, RefreshTokenSchema } from '../schemas';
import { loginUser, refreshAccessToken, logoutUser } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

export const seedAdmin = asyncHandler(async (req: Request, res: Response) => {
    const count = await prisma.user.count();
    if (count > 0) {
        res.status(400).json({ error: 'Already seeded' });
        return;
    }
    const hash = await bcrypt.hash('superadmin123', 12);
    await prisma.user.create({
        data: {
            email: 'superadmin@ironcrown.local',
            username: 'SuperAdmin',
            passwordHash: hash,
            role: 'SUPERADMIN'
        }
    });
    res.json({ success: true, message: 'Seeded' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = LoginSchema.parse(req.body);
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await loginUser(email, password, ip, ua);
    res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    const result = await refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    await logoutUser(refreshToken);
    res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: req.user });
});
