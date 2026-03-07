'use client';

import { useEffect, useState } from 'react';
import { PunishmentService, Punishment, PlayerService } from '@/lib/services';
import { Search, ShieldAlert, Info } from 'lucide-react';
import { motion } from 'framer-motion';

type Filter = 'ALL' | 'ACTIVE' | 'EXPIRED';

export default function PunishmentsPage() {
    const [punishments, setPunishments] = useState<Punishment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('ALL');
    const [revoking, setRevoking] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        PunishmentService.getAll()
            .then(setPunishments)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const filtered = punishments
        .filter(p => filter === 'ALL' ? true : filter === 'ACTIVE' ? p.isActive : !p.isActive)
        .filter(p =>
            p.player?.playerName.toLowerCase().includes(search.toLowerCase()) ||
            p.player?.steamId.includes(search) ||
            p.reason.toLowerCase().includes(search.toLowerCase())
        );

    const handleRevoke = async (punishment: Punishment) => {
        if (!punishment.playerId) return;
        setRevoking(punishment.id);
        try {
            await PlayerService.unban(punishment.playerId);
            setPunishments(prev => prev.map(p => p.id === punishment.id ? { ...p, isActive: false } : p));
        } catch (e) { console.error(e); }
        setRevoking(null);
    };

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

    const tabs: Filter[] = ['ALL', 'ACTIVE', 'EXPIRED'];

    return (
        <div className="space-y-8 animate-in mt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#F5F5F0' }}>
                        Punishments & Infractions
                    </h1>
                    <p className="text-sm" style={{ color: '#606070' }}>
                        {punishments.filter(p => p.isActive).length} active sanctions across the server.
                    </p>
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color="#606070" />
                    <input
                        type="text"
                        placeholder="Search player, ID, or reason..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none"
                        style={{ color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all"
                        style={{
                            color: filter === tab ? '#D4AF37' : '#606070',
                            borderBottom: filter === tab ? '2px solid #D4AF37' : '2px solid transparent',
                        }}
                    >
                        {tab} {tab === 'ACTIVE' && `(${punishments.filter(p => p.isActive).length})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,15,20,0.5)' }}>
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.02)', color: '#606070', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="col-span-3">Player</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Reason</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-4 animate-pulse">
                                <div className="h-6 w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.03)' }} />
                            </div>
                        ))
                    ) : filtered.map((punishment, idx) => {
                        const colors = getTypeColor(punishment.type);
                        return (
                            <motion.div
                                key={punishment.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors"
                            >
                                <div className="col-span-3">
                                    <div className="text-sm font-medium" style={{ color: '#F5F5F0' }}>
                                        {punishment.player?.playerName ?? 'Unknown'}
                                    </div>
                                    <div className="text-xs font-mono" style={{ color: '#606070' }}>
                                        {punishment.player?.steamId ?? punishment.playerId.slice(0, 12)}...
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-sm uppercase" style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                                        <ShieldAlert size={12} /> {punishment.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="col-span-3 text-sm truncate" style={{ color: '#A0A0B0' }}>
                                    {punishment.reason}
                                </div>
                                <div className="col-span-2">
                                    {punishment.isActive ? (
                                        <span className="text-xs font-semibold text-red-500">Active</span>
                                    ) : (
                                        <span className="text-xs" style={{ color: '#606070' }}>Expired</span>
                                    )}
                                </div>
                                <div className="col-span-1 text-xs" style={{ color: '#606070' }}>
                                    {new Date(punishment.createdAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    {punishment.isActive && (
                                        <button
                                            disabled={revoking === punishment.id}
                                            onClick={() => handleRevoke(punishment)}
                                            className="px-3 py-1 text-[10px] font-semibold uppercase rounded-sm transition-all hover:bg-green-500/20 disabled:opacity-50"
                                            style={{ color: '#27AE60', border: '1px solid rgba(39,174,96,0.25)' }}
                                        >
                                            {revoking === punishment.id ? '...' : 'Revoke'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                {filtered.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center" style={{ color: '#606070' }}>
                        <Info size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No punishments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
