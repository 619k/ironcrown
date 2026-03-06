import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AdminRole } from '@prisma/client';

type Role = keyof typeof AdminRole;

/**
 * Require the authenticated user to have at minimum the given role.
 * Role hierarchy: SUPERADMIN > ADMIN > MODERATOR
 */
export function requireRole(...roles: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role as Role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}

// Shorthand helpers
export const requireAdmin = requireRole('ADMIN', 'SUPERADMIN');
export const requireSuperAdmin = requireRole('SUPERADMIN');
export const requireModerator = requireRole('MODERATOR', 'ADMIN', 'SUPERADMIN');
