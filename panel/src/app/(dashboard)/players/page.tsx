'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Users, Wifi, WifiOff, Crown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';

interface Player {
    id: string; steamId: string; playerName: string;
    isOnline: boolean; lastSeen: string;
    kingdom?: { name: string }; village?: { name: string };
}

function PlayerRow({ player, index }: { player: Player; index: number }) {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="group"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: player.isOnline ? '#1ABC9C' : '#404055', boxShadow: player.isOnline ? '0 0 6px rgba(26,188,156,0.6)' : 'none' }}
                    />
                    <div>
                        <div className="text-sm font-medium" style={{ color: '#F5F5F0' }}>{player.playerName}</div>
                        <div className="text-xs font-mono" style={{ color: '#404055' }}>{player.steamId}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold"
                    style={player.isOnline ? { background: 'rgba(26,188,156,0.1)', color: '#1ABC9C', border: '1px solid rgba(26,188,156,0.2)' }
                        : { background: 'rgba(64,64,85,0.2)', color: '#606070', border: '1px solid rgba(64,64,85,0.2)' }}
                >
                    {player.isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {player.isOnline ? 'Online' : 'Offline'}
                </span>
            </td>
            <td className="px-4 py-3">
                {player.kingdom ? (
                    <span className="flex items-center gap-1 text-sm" style={{ color: '#D4AF37' }}>
                        <Crown size={12} />{player.kingdom.name}
                    </span>
                ) : <span style={{ color: '#404055' }}>—</span>}
            </td>
            <td className="px-4 py-3 text-xs font-mono" style={{ color: '#606070' }}>
                {player.isOnline ? 'Now' : timeAgo(player.lastSeen)}
            </td>
            <td className="px-4 py-3">
                <Link
                    href={`/dashboard/players/${player.id}`}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: '#606070' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#606070'}
                >
                    View <ChevronRight size={12} />
                </Link>
            </td>
        </motion.tr>
    );
}

export default function PlayersPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['players', debouncedSearch],
        queryFn: () => api.get(`/players?search=${debouncedSearch}&limit=50`).then((r) => r.data.data),
        refetchInterval: 30_000,
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st);
        (window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => setDebouncedSearch(value), 400);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold" style={{ color: '#D4AF37' }}>Players</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#606070' }}>
                        {data?.total ?? 0} registered • {data?.players?.filter((p: Player) => p.isOnline).length ?? 0} online
                    </p>
                </div>
            </div>

            {/* Search bar */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#606070' }} />
                <input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or SteamID…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-sm outline-none"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(212,175,55,0.1)',
                        color: '#F5F5F0',
                    }}
                />
            </div>

            {/* Table */}
            <div className="glass-card rounded-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                            {['Player', 'Status', 'Kingdom', 'Last Seen', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#404055' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        {Array.from({ length: 5 }).map((__, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="skeleton h-4 rounded-sm" style={{ width: ['140px', '60px', '80px', '60px', '40px'][j] }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data?.players?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-16 text-center">
                                        <Users size={32} className="mx-auto mb-3 opacity-20" style={{ color: '#606070' }} />
                                        <p style={{ color: '#404055' }}>No players found</p>
                                    </td>
                                </tr>
                            ) : (
                                (data?.players ?? []).map((player: Player, i: number) => (
                                    <PlayerRow key={player.id} player={player} index={i} />
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
