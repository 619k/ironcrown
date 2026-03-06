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
        const { data } = await api.get('/players?limit=100');
        // Backend returns: { success: true, data: { players: [], total: ... } }
        return data.data.players as Player[];
    },
    getOnline: async () => {
        const { data } = await api.get('/bridge/online');
        return data.data as Player[];
    }
};

export const PunishmentService = {
    getAll: async () => {
        const { data } = await api.get('/punishments');
        return data.data as Punishment[];
    }
};

export const LogService = {
    getEvents: async () => {
        const { data } = await api.get('/logs');
        return data.data as EventLog[];
    }
};

export const RpService = {
    getKingdoms: async () => {
        const { data } = await api.get('/kingdoms');
        return data.data as Kingdom[];
    },
    getWars: async () => {
        const { data } = await api.get('/wars');
        return data.data as War[];
    }
};
