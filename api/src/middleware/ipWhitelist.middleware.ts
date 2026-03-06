import { Request, Response, NextFunction } from 'express';

/**
 * IP whitelist middleware for /bridge/* routes.
 * Uses BRIDGE_ALLOWED_IPS env (comma-separated).
 * Defaults to localhost only if not set.
 */
export function ipWhitelistMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const allowedRaw = process.env.BRIDGE_ALLOWED_IPS || '*';
    const allowed = allowedRaw.split(',').map((ip) => ip.trim());

    // Get real IP, accounting for proxies
    const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        '';

    if (allowedRaw !== '*' && !allowed.includes(clientIp)) {
        res.status(403).json({
            error: 'IP not whitelisted for bridge access',
            ip: clientIp,
        });
        return;
    }
    next();
}
