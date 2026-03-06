'use client';

import { useEffect, useState } from 'react';
import { PunishmentService, Punishment } from '@/lib/services';
import { Search, ShieldAlert, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PunishmentsPage() {
    const [punishments, setPunishments] = useState<Punishment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        PunishmentService.getAll()
            .then(setPunishments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = punishments.filter((p) =>
        p.player?.playerName.toLowerCase().includes(search.toLowerCase()) ||
        p.player?.steamId.includes(search) ||
        p.reason.toLowerCase().includes(search.toLowerCase())
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'WARN': return { bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.3)', text: '#D4AF37' };
            case 'KICK': return { bg: 'rgba(230,126,34,0.1)', border: 'rgba(230,126,34,0.3)', text: '#E67E22' };
            case 'MUTE': return { bg: 'rgba(52,152,219,0.1)', border: 'rgba(52,152,219,0.3)', text: '#3498DB' };
            case 'TEMP_BAN': return { bg: 'rgba(231,76,60,0.1)', border: 'rgba(231,76,60,0.3)', text: '#E74C3C' };
            case 'PERMANENT_BAN': return { bg: 'rgba(192,57,43,0.15)', border: 'rgba(192,57,43,0.4)', text: '#C0392B' };
            default: return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#9090A0' };
        }
    };

    return (
        <div className="space-y-8 animate-in mt-4">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#F5F5F0' }}>
                        Punishments & Infractions
                    </h1>
                    <p className="text-sm" style={{ color: '#606070' }}>
                        {punishments.filter(p => p.isActive).length} active punishments recorded across the server.
                    </p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color="#606070" />
                    <input
                        type="text"
                        placeholder="Search player, Steam ID, or reason..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none transition-colors"
                        style={{
                            color: '#F5F5F0',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.02)'
                        }}
                    />
                </div>
            </div>

            {/* List */}
            <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,15,20,0.5)' }}>
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.02)', color: '#606070', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="col-span-3">Player</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-4">Reason</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Date</div>
                </div>

                {/* Rows */}
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-4 flex animate-pulse">
                                <div className="h-6 w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.03)' }} />
                            </div>
                        ))
                    ) : (
                        filtered.map((punishment, idx) => {
                            const colors = getTypeColor(punishment.type);
                            const isTemp = punishment.type === 'TEMP_BAN';

                            return (
                                <motion.div
                                    key={punishment.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-white/5"
                                >
                                    <div className="col-span-3">
                                        <div className="text-sm font-medium" style={{ color: '#F5F5F0' }}>
                                            {punishment.player?.playerName || 'Unknown'}
                                        </div>
                                        <div className="text-xs font-mono" style={{ color: '#606070' }}>
                                            {punishment.player?.steamId || punishment.playerId}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <span
                                            className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-sm uppercase"
                                            style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                                        >
                                            <ShieldAlert size={12} />
                                            {punishment.type.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="col-span-4 text-sm max-w-[90%] truncate" style={{ color: '#A0A0B0' }}>
                                        {punishment.reason}
                                    </div>

                                    <div className="col-span-2">
                                        {punishment.isActive ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-red-500 font-medium">Active</span>
                                                {isTemp && punishment.expiresAt && (
                                                    <span className="text-[10px]" style={{ color: '#606070' }}>
                                                        Until: {new Date(punishment.expiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs" style={{ color: '#606070' }}>Expired / Revoked</span>
                                        )}
                                    </div>

                                    <div className="col-span-1 text-right text-xs" style={{ color: '#606070' }}>
                                        {new Date(punishment.createdAt).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    {filtered.length === 0 && !loading && (
                        <div className="px-6 py-12 text-center" style={{ color: '#606070' }}>
                            <Info size={24} className="mx-auto mb-2 opacity-50" />
                            <p>No punishments found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
