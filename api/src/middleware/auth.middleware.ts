import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        role: string;
    };
}

export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
            username: string;
            role: string;
        };

        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, username: true, role: true, isActive: true },
        });

        if (!user || !user.isActive) {
            res.status(401).json({ error: 'User account inactive or not found' });
            return;
        }

        req.user = user;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
