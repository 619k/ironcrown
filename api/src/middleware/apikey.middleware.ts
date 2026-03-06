import { Request, Response, NextFunction } from 'express';

/** Validates X-API-Key header against PLUGIN_API_KEY env */
export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
    const key = req.headers['x-api-key'];
    const expected = process.env.PLUGIN_API_KEY || process.env.API_KEY;

    if (!expected) {
        res.status(500).json({ error: 'API key not configured on server' });
        return;
    }
    if (key !== expected) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }
    next();
}
