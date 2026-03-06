import { api } from './api';

// ── Types ───────────────────────────────────────────────────

export interface Player {
    id: string;
    steamId: string;
    playerName: string;
    isOnline: boolean;
    lastSeen: string;
    firstSeen: string;
    totalPlaytime: number;
    kingdomId?: string;
    villageId?: string;
}

export interface Punishment {
    id: string;
    playerId: string;
    adminId: string;
    type: 'WARN' | 'KICK' | 'MUTE' | 'TEMP_BAN' | 'PERMANENT_BAN';
    reason: string;
    expiresAt?: string;
    isActive: boolean;
    createdAt: string;
    player?: Player;
}

export interface EventLog {
    id: string;
    eventType: 'PLAYER_JOIN' | 'PLAYER_LEAVE' | 'PLAYER_DEATH' | 'ITEM_PICKUP' | 'ITEM_DROP';
    steamId: string;
    playerName?: string;
    metadata?: any;
    createdAt: string;
}

export interface Kingdom {
    id: string;
    name: string;
    description?: string;
    colorHex: string;
    isActive: boolean;
}

export interface War {
    id: string;
    name: string;
    description?: string;
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
    winnerId?: string;
}

// ── Services ────────────────────────────────────────────────

export const PlayerService = {
    getAll: async () => {
        try {
            const { data } = await api.get('/players?limit=100');
            return (data.data.players || []) as Player[];
        } catch { return []; }
    },
    getOnline: async () => {
        try {
            const { data } = await api.get('/bridge/online');
            return (data.data || []) as Player[];
        } catch { return []; }
    }
};

export const PunishmentService = {
    getAll: async () => {
        try {
            const { data } = await api.get('/punishments');
            return (Array.isArray(data.data) ? data.data : []) as Punishment[];
        } catch { return []; }
    }
};

export const LogService = {
    getEvents: async () => {
        try {
            const { data } = await api.get('/logs/events?limit=50');
            return (Array.isArray(data.data) ? data.data : []) as EventLog[];
        } catch { return []; }
    }
};

export const RpService = {
    getKingdoms: async () => {
        try {
            const { data } = await api.get('/kingdoms');
            return (Array.isArray(data.data) ? data.data : []) as Kingdom[];
        } catch { return []; }
    },
    getWars: async () => {
        try {
            const { data } = await api.get('/wars');
            return (Array.isArray(data.data) ? data.data : []) as War[];
        } catch { return []; }
    }
};
