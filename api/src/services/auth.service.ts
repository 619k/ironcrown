import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REFRESH_DAYS = 7;

function signAccess(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
    });
}

function signRefresh(payload: object) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
    return jwt.sign(payload, secret, {
        expiresIn: REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
    });
}

export async function loginUser(email: string, password: string, ip?: string, ua?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw new AppError('Invalid credentials', 401);
    }

    const payload = { id: user.id, email: user.email, username: user.username, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user.id });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await prisma.adminSession.create({
        data: { userId: user.id, refreshToken, expiresAt, ipAddress: ip, userAgent: ua },
    });

    return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
}

export async function refreshAccessToken(token: string) {
    let decoded: { id: string };
    try {
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
        decoded = jwt.verify(token, secret) as { id: string };
    } catch {
        throw new AppError('Invalid refresh token', 401);
    }

    const session = await prisma.adminSession.findUnique({ where: { refreshToken: token } });
    if (!session || session.expiresAt < new Date()) {
        throw new AppError('Refresh token expired or not found', 401);
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, username: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
        throw new AppError('User account inactive', 401);
    }

    const accessToken = signAccess({
        id: user.id, email: user.email, username: user.username, role: user.role,
    });
    return { accessToken };
}

export async function logoutUser(token: string) {
    await prisma.adminSession.deleteMany({ where: { refreshToken: token } });
}
