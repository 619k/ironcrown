import rateLimit from 'express-rate-limit';

/** Standard API rate limiter */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});

/** Strict limiter for auth endpoint */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Blocked for 15 minutes.' },
    skipSuccessfulRequests: true,
});

/** Strict limiter for bridge routes */
export const bridgeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: Number(process.env.BRIDGE_RATE_LIMIT_PER_MINUTE) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Bridge rate limit exceeded' },
});
