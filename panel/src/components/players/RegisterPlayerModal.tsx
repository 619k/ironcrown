'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

interface RegisterPlayerModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function RegisterPlayerModal({ onClose, onSuccess }: RegisterPlayerModalProps) {
    const [steamId, setSteamId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!steamId.trim() || !playerName.trim()) {
            setError('Both Steam ID and player name are required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/players/upsert', { steamId: steamId.trim(), playerName: playerName.trim() }, {
                headers: { 'X-API-Key': process.env.NEXT_PUBLIC_PLUGIN_API_KEY || '' }
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: string } } };
            setError(apiError?.response?.data?.error ?? 'Failed to register player.');
        }
        setLoading(false);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.7)' }}
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-sm"
            >
                <div className="rounded-sm overflow-hidden" style={{ background: '#0d0d12', border: '1px solid rgba(27,188,156,0.2)' }}>
                    <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(27,188,156,0.08)', borderBottom: '1px solid rgba(27,188,156,0.12)' }}>
                        <div className="flex items-center gap-2">
                            <UserPlus size={16} style={{ color: '#1ABC9C' }} />
                            <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#1ABC9C' }}>Register Player</span>
                        </div>
                        <button onClick={onClose} style={{ color: '#606070' }}><X size={16} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-xs" style={{ color: '#808090' }}>
                            Manually register a player in the database. Use this when the plugin is offline.
                        </p>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#606070' }}>Steam ID *</label>
                                <input
                                    value={steamId}
                                    onChange={e => setSteamId(e.target.value)}
                                    placeholder="76561198XXXXXXXXX"
                                    className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none font-mono"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#F5F5F0', background: 'rgba(255,255,255,0.02)' }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#606070' }}>Player Name *</label>
                                <input
                                    value={playerName}
                                    onChange={e => setPlayerName(e.target.value)}
                                    placeholder="In-game display name"
                                    className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#F5F5F0', background: 'rgba(255,255,255,0.02)' }}
                                />
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-sm hover:bg-white/5" style={{ color: '#606070', border: '1px solid rgba(255,255,255,0.06)' }}>Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-2.5 text-sm rounded-sm font-semibold disabled:opacity-50 transition-all hover:opacity-90"
                                style={{ background: '#1ABC9C', color: '#0A0A0F' }}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
