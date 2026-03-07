'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';
import { PlayerService } from '@/lib/services';

type PunishType = 'kick' | 'warn' | 'temp_ban' | 'perm_ban';

interface PunishModalProps {
    playerId: string;
    playerName: string;
    type: PunishType;
    onClose: () => void;
    onSuccess: () => void;
}

const CONFIG: Record<PunishType, { label: string; color: string; bg: string }> = {
    kick: { label: 'Kick Player', color: '#E67E22', bg: 'rgba(230,126,34,0.1)' },
    warn: { label: 'Issue Warning', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
    temp_ban: { label: 'Temporary Ban', color: '#E74C3C', bg: 'rgba(231,76,60,0.1)' },
    perm_ban: { label: 'Permanent Ban', color: '#C0392B', bg: 'rgba(192,57,43,0.12)' },
};

export function PunishModal({ playerId, playerName, type, onClose, onSuccess }: PunishModalProps) {
    const [reason, setReason] = useState('');
    const [evidence, setEvidence] = useState('');
    const [duration, setDuration] = useState('60');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cfg = CONFIG[type];

    const handleSubmit = async () => {
        if (!reason.trim()) { setError('Reason is required.'); return; }
        setLoading(true);
        setError('');
        try {
            if (type === 'kick') await PlayerService.kick(playerId, reason);
            else if (type === 'warn') await PlayerService.warn(playerId, reason);
            else if (type === 'temp_ban') await PlayerService.tempBan(playerId, reason, Number(duration));
            else if (type === 'perm_ban') await PlayerService.permBan(playerId, reason, evidence || undefined);
            onSuccess();
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: string } } };
            setError(apiError?.response?.data?.error ?? 'Action failed. Try again.');
        }
        setLoading(false);
    };

    return (
        <>
            {/* overlay */}
            <motion.div
                key="punish-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60]"
                style={{ background: 'rgba(0,0,0,0.7)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                key="punish-modal"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm"
            >
                <div className="rounded-sm overflow-hidden" style={{ background: '#0d0d12', border: `1px solid ${cfg.color}30` }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4" style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.color}20` }}>
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={16} style={{ color: cfg.color }} />
                            <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <button onClick={onClose} style={{ color: '#606070' }}><X size={16} /></button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <p className="text-sm" style={{ color: '#808090' }}>
                            Target: <span className="font-semibold" style={{ color: '#F5F5F0' }}>{playerName}</span>
                        </p>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#606070' }}>Reason *</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason..."
                                className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                                style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#F5F5F0', background: 'rgba(255,255,255,0.02)' }}
                            />
                        </div>

                        {type === 'temp_ban' && (
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#606070' }}>Duration (minutes)</label>
                                <input
                                    type="number"
                                    min="5" max="43200"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#F5F5F0', background: 'rgba(255,255,255,0.02)' }}
                                />
                            </div>
                        )}

                        {type === 'perm_ban' && (
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#606070' }}>Evidence URL (optional)</label>
                                <input
                                    type="text"
                                    value={evidence}
                                    onChange={e => setEvidence(e.target.value)}
                                    placeholder="https://screenshot.url"
                                    className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#F5F5F0', background: 'rgba(255,255,255,0.02)' }}
                                />
                            </div>
                        )}

                        {error && <p className="text-xs text-red-400">{error}</p>}

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-sm hover:bg-white/5 transition-colors" style={{ color: '#606070', border: '1px solid rgba(255,255,255,0.06)' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-2.5 text-sm rounded-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: cfg.color, color: '#0A0A0F' }}
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
