'use client';

import { useEffect, useState } from 'react';
import { PlayerService, Player } from '@/lib/services';
import { Search, Clock, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerDrawer } from '@/components/players/PlayerDrawer';

export default function PlayersPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Player | null>(null);

    useEffect(() => {
        PlayerService.getAll()
            .then(setPlayers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = players.filter((p) =>
        p.playerName.toLowerCase().includes(search.toLowerCase()) ||
        p.steamId.includes(search)
    );

    return (
        <div className="space-y-8 animate-in mt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#F5F5F0' }}>
                        Player Network
                    </h1>
                    <p className="text-sm" style={{ color: '#606070' }}>
                        {players.length} survivors registered · {players.filter(p => p.isOnline).length} online
                    </p>
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color="#606070" />
                    <input
                        type="text"
                        placeholder="Search by name or Steam ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none"
                        style={{ color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 rounded-sm animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((player, idx) => (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02, duration: 0.2 }}
                            onClick={() => setSelected(player)}
                            className="p-5 rounded-sm group relative overflow-hidden flex flex-col justify-between h-[130px] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, rgba(20,20,25,0.6), rgba(10,10,15,0.9))',
                                border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            {/* Online accent stripe */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300"
                                style={{
                                    background: player.isOnline ? '#27AE60' : 'rgba(255,255,255,0.05)',
                                    boxShadow: player.isOnline ? '0 0 10px rgba(39,174,96,0.4)' : 'none'
                                }}
                            />
                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <div className="font-medium text-base mb-1 truncate max-w-[150px]" style={{ color: '#F5F5F0' }}>
                                        {player.playerName}
                                    </div>
                                    <div className="text-xs font-mono truncate" style={{ color: '#606070' }}>
                                        {player.steamId}
                                    </div>
                                </div>
                                {player.isOnline ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-sm" style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.2)' }}>
                                        <Activity size={10} /> LIVE
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.03)', color: '#606070', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        Offline
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4 mt-auto pl-2">
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Clock size={12} color="#606070" />
                                    <span style={{ color: '#808090' }}>{Math.floor(player.totalPlaytime / 3600)}h</span>
                                </div>
                                {player.kingdomId && (
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <MapPin size={12} color="#D4AF37" />
                                        <span style={{ color: '#808090' }}>RP</span>
                                    </div>
                                )}
                            </div>
                            {/* Hover hint */}
                            <div className="absolute bottom-2 right-3 text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#404055' }}>
                                Click to manage →
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {filtered.length === 0 && !loading && (
                <div className="py-12 text-center" style={{ color: '#606070' }}>
                    <p>No players found matching &ldquo;{search}&rdquo;</p>
                </div>
            )}

            {/* Player Drawer */}
            <AnimatePresence>
                {selected && (
                    <PlayerDrawer player={selected} onClose={() => setSelected(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
