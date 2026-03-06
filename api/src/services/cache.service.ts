import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

// ── In-memory cache as fallback ───────────────────────
const memCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

let redisClient: import('ioredis').Redis | null = null;

async function getRedisClient() {
    if (redisClient) return redisClient;
    const url = process.env.REDIS_URL;
    if (!url) return null;
    try {
        const { Redis } = await import('ioredis');
        redisClient = new Redis(url);
        redisClient.on('error', (err) => logger.error('[Redis]', err));
        logger.info('[Cache] Redis connected');
        return redisClient;
    } catch {
        logger.warn('[Cache] Redis unavailable, falling back to node-cache');
        return null;
    }
}

export const cache = {
    async get<T>(key: string): Promise<T | undefined> {
        const redis = await getRedisClient();
        if (redis) {
            const val = await redis.get(key);
            return val ? (JSON.parse(val) as T) : undefined;
        }
        return memCache.get<T>(key);
    },

    async set(key: string, value: unknown, ttlSeconds = 30): Promise<void> {
        const redis = await getRedisClient();
        if (redis) {
            await redis.setex(key, ttlSeconds, JSON.stringify(value));
        } else {
            memCache.set(key, value, ttlSeconds);
        }
    },

    async del(key: string): Promise<void> {
        const redis = await getRedisClient();
        if (redis) {
            await redis.del(key);
        } else {
            memCache.del(key);
        }
    },
};

export const CACHE_KEYS = {
    ONLINE_PLAYERS: 'online_players',
    SERVER_STATUS: 'server_status',
    PLAYER_LIST: 'player_list',
};
