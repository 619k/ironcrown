import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
    ],
});

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}

// Remove prisma.$on('error') as it's not supported by default without additional generic types or specific logging configuration in Prisma Client
// The standard way to log errors is configuring 'log' in the PrismaClient constructor, which we already did above.
