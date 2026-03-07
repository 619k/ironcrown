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
    kingdom?: { id: string; name: string };
    village?: { id: string; name: string };
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
    player?: Pick<Player, 'id' | 'steamId' | 'playerName'>;
}

export interface EventLog {
    id: string;
    eventType: 'PLAYER_JOIN' | 'PLAYER_LEAVE' | 'PLAYER_DEATH' | 'ITEM_PICKUP' | 'ITEM_DROP';
    steamId: string;
    playerName?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface Kingdom {
    id: string;
    name: string;
    description?: string;
    colorHex: string;
    isActive: boolean;
    _count?: { players: number };
    villages?: { id: string; name: string }[];
}

export interface War {
    id: string;
    name: string;
    description?: string;
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
    winnerId?: string;
    attackerKingdom?: { id: string; name: string };
    defenderKingdom?: { id: string; name: string };
}

export interface InventoryItem {
    id: string;
    itemId: number;
    itemName?: string;
    amount: number;
    quality: number;
    container: string;
}

// ── Services ────────────────────────────────────────────────

export const PlayerService = {
    getAll: async () => {
        try {
            const { data } = await api.get('/players?limit=100');
            return (Array.isArray(data.data?.players) ? data.data.players : []) as Player[];
        } catch { return [] as Player[]; }
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/players/${id}`);
        return data.data as Player & { punishments: Punishment[] };
    },
    getInventory: async (id: string) => {
        try {
            const { data } = await api.get(`/players/${id}/inventory`);
            return data.data as { items: InventoryItem[] } | null;
        } catch { return null; }
    },
    getOnline: async () => {
        try {
            const { data } = await api.get('/bridge/online');
            return (Array.isArray(data.data) ? data.data : []) as Player[];
        } catch { return [] as Player[]; }
    },
    // ── Actions ──────────────────────────────────────────────
    kick: async (id: string, reason: string) => {
        const { data } = await api.post(`/players/${id}/kick`, { reason });
        return data;
    },
    warn: async (id: string, reason: string) => {
        const { data } = await api.post(`/players/${id}/warn`, { reason });
        return data;
    },
    tempBan: async (id: string, reason: string, duration: number) => {
        const { data } = await api.post(`/players/${id}/temp-ban`, { reason, duration });
        return data;
    },
    permBan: async (id: string, reason: string, evidence?: string) => {
        const { data } = await api.post(`/players/${id}/ban`, { reason, evidence });
        return data;
    },
    unban: async (id: string) => {
        const { data } = await api.post(`/players/${id}/unban`, {});
        return data;
    },
    giveItem: async (id: string, itemId: number, amount: number, quality: number) => {
        const { data } = await api.post(`/players/${id}/give-item`, { itemId, amount, quality });
        return data;
    },
};

export const PunishmentService = {
    getAll: async (active?: boolean) => {
        try {
            const params = active !== undefined ? `?active=${active}` : '';
            const { data } = await api.get(`/punishments${params}`);
            return (Array.isArray(data.data) ? data.data : []) as Punishment[];
        } catch { return [] as Punishment[]; }
    },
};

export const LogService = {
    getEvents: async (eventType?: string) => {
        try {
            const params = eventType ? `?eventType=${eventType}&limit=50` : '?limit=50';
            const { data } = await api.get(`/logs/events${params}`);
            return (Array.isArray(data.data) ? data.data : []) as EventLog[];
        } catch { return [] as EventLog[]; }
    },
};

export const RpService = {
    getKingdoms: async () => {
        try {
            const { data } = await api.get('/kingdoms');
            return (Array.isArray(data.data) ? data.data : []) as Kingdom[];
        } catch { return [] as Kingdom[]; }
    },
    getWars: async () => {
        try {
            const { data } = await api.get('/wars');
            return (Array.isArray(data.data) ? data.data : []) as War[];
        } catch { return [] as War[]; }
    },
};
