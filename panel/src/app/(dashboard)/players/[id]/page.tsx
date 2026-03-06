'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ChevronLeft, Wifi, WifiOff, Crown, ExternalLink, Package, Shield, ScrollText } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, timeAgo, steamIdToProfileUrl } from '@/lib/utils';
import { useCanAdmin } from '@/store/auth.store';
import { useState } from 'react';

const PUNISHMENT_COLORS: Record<string, string> = {
    PERMANENT_BAN: '#E74C3C', TEMP_BAN: '#E67E22',
    KICK: '#F39C12', WARN: '#D4AF37', MUTE: '#5DADE2',
};

function ConfirmModal({ open, title, onConfirm, onCancel }: { open: boolean; title: string; onConfirm: () => void; onCancel: () => void }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card rounded-sm p-6 max-w-sm w-full mx-4"
                style={{ border: '1px solid rgba(192,57,43,0.3)' }}
            >
                <h3 className="text-base font-semibold mb-3" style={{ color: '#F5F5F0' }}>{title}</h3>
                <p className="text-sm mb-6" style={{ color: '#606070' }}>This action will be logged and cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm rounded-sm" style={{ background: 'rgba(255,255,255,0.04)', color: '#606070', border: '1px solid rgba(255,255,255,0.06)' }}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 text-sm rounded-sm font-semibold" style={{ background: 'rgba(192,57,43,0.2)', color: '#E74C3C', border: '1px solid rgba(192,57,43,0.3)' }}>Confirm</button>
                </div>
            </motion.div>
        </div>
    );
}

function ActionButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide rounded-sm btn-shine transition-all"
            style={{ background: `rgba(${color},0.1)`, color: `rgb(${color})`, border: `1px solid rgba(${color},0.2)` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${color},0.2)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${color},0.1)`; }}
        >
            {label}
        </button>
    );
}

export default function PlayerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const qc = useQueryClient();
    const canAdmin = useCanAdmin();
    const [tab, setTab] = useState<'info' | 'inventory' | 'punishments' | 'logs'>('info');
    const [confirm, setConfirm] = useState<{ action: string; label: string } | null>(null);
    const [reasonInput, setReasonInput] = useState('');

    const { data: player, isLoading } = useQuery({
        queryKey: ['player', id],
        queryFn: () => api.get(`/players/${id}`).then((r) => r.data.data),
    });

    const { data: inventory } = useQuery({
        queryKey: ['inventory', id],
        queryFn: () => api.get(`/players/${id}/inventory`).then((r) => r.data.data),
        enabled: tab === 'inventory',
    });

    const { data: logs } = useQuery({
        queryKey: ['player-logs', id],
        queryFn: () => api.get(`/players/${id}/logs`).then((r) => r.data.data),
        enabled: tab === 'logs',
    });

    const actionMutation = useMutation({
        mutationFn: ({ action, reason }: { action: string; reason: string }) => {
            const endpoints: Record<string, string> = { kick: 'kick', ban: 'ban', warn: 'warn', unban: 'unban' };
            return api.post(`/players/${id}/${endpoints[action]}`, { reason });
        },
        onSuccess: (_, vars) => {
            toast.success(`${vars.action} applied successfully`);
            qc.invalidateQueries({ queryKey: ['player', id] });
            setConfirm(null);
            setReasonInput('');
        },
        onError: () => toast.error('Action failed'),
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-fade-in">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton rounded-sm" style={{ height: 48, width: `${[100, 60, 80, 40, 90, 55][i]}%` }} />
                ))}
            </div>
        );
    }

    if (!player) return <div style={{ color: '#E74C3C' }}>Player not found</div>;

    const tabs = [
        { key: 'info', label: 'Profile', icon: Shield },
        { key: 'inventory', label: 'Inventory', icon: Package },
        { key: 'punishments', label: 'Punishments', icon: Shield },
        { key: 'logs', label: 'Logs', icon: ScrollText },
    ] as const;

    return (
        <div className="space-y-6 animate-fade-in">
            <ConfirmModal
                open={!!confirm}
                title={`Confirm: ${confirm?.label}`}
                onConfirm={() => confirm && actionMutation.mutate({ action: confirm.action, reason: reasonInput })}
                onCancel={() => { setConfirm(null); setReasonInput(''); }}
            />

            {/* Breadcrumb */}
            <Link href="/dashboard/players" className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: '#606070' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#D4AF37'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#606070'}>
                <ChevronLeft size={14} /> Players
            </Link>

            {/* Player header card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-sm p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar placeholder */}
                    <div className="w-16 h-16 rounded-sm flex-shrink-0 flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                        ⚔️
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="font-display text-xl font-semibold" style={{ color: '#F5F5F0' }}>{player.playerName}</h1>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold"
                                style={player.isOnline
                                    ? { background: 'rgba(26,188,156,0.1)', color: '#1ABC9C', border: '1px solid rgba(26,188,156,0.2)' }
                                    : { background: 'rgba(64,64,85,0.1)', color: '#606070', border: '1px solid rgba(64,64,85,0.2)' }}>
                                {player.isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                                {player.isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="text-xs font-mono" style={{ color: '#404055' }}>{player.steamId}</span>
                            {player.kingdom && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: '#D4AF37' }}>
                                    <Crown size={11} /> {player.kingdom.name}
                                </span>
                            )}
                            <span className="text-xs" style={{ color: '#606070' }}>
                                {player.isOnline ? '● Online now' : `Last seen ${timeAgo(player.lastSeen)}`}
                            </span>
                            <a href={steamIdToProfileUrl(player.steamId)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs" style={{ color: '#5DADE2' }}>
                                Steam <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>

                    {/* Action buttons */}
                    {canAdmin && (
                        <div className="flex gap-2 flex-wrap">
                            <ActionButton label="Kick" color="230,126,34" onClick={() => { setConfirm({ action: 'kick', label: 'Kick Player' }); setReasonInput(''); }} />
                            <ActionButton label="Warn" color="212,175,55" onClick={() => { setConfirm({ action: 'warn', label: 'Warn Player' }); setReasonInput(''); }} />
                            <ActionButton label="Ban" color="192,57,43" onClick={() => { setConfirm({ action: 'ban', label: 'Ban Player' }); setReasonInput(''); }} />
                            {player.punishments?.some((p: { type: string; isActive: boolean }) => p.isActive && p.type.includes('BAN')) && (
                                <ActionButton label="Unban" color="26,188,156" onClick={() => setConfirm({ action: 'unban', label: 'Unban Player' })} />
                            )}
                        </div>
                    )}
                </div>

                {/* Reason input (shows when confirm is pending) */}
                {confirm && confirm.action !== 'unban' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <input value={reasonInput} onChange={(e) => setReasonInput(e.target.value)}
                            placeholder="Reason (required)…"
                            className="w-full px-3 py-2 text-sm rounded-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', color: '#F5F5F0' }} />
                    </motion.div>
                )}
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-0.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setTab(key as typeof tab)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors relative"
                        style={{ color: tab === key ? '#D4AF37' : '#606070', borderBottom: tab === key ? '2px solid #D4AF37' : '2px solid transparent', marginBottom: '-1px' }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {tab === 'info' && (
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Steam ID', value: player.steamId, mono: true },
                            { label: 'First Seen', value: formatDate(player.firstSeen) },
                            { label: 'Last Seen', value: formatDate(player.lastSeen) },
                            { label: 'Kingdom', value: player.kingdom?.name ?? '—' },
                            { label: 'Village', value: player.village?.name ?? '—' },
                            { label: 'Total Punishments', value: player.punishments?.length ?? 0 },
                        ].map(({ label, value, mono }) => (
                            <div key={label} className="glass-card rounded-sm px-5 py-4">
                                <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: '#404055' }}>{label}</p>
                                <p className="text-sm font-medium" style={{ color: '#F5F5F0', fontFamily: mono ? 'JetBrains Mono, monospace' : undefined }}>{String(value)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'inventory' && (
                    <div>
                        {!inventory ? (
                            <div className="glass-card rounded-sm p-12 text-center">
                                <Package size={32} className="mx-auto mb-3 opacity-20" style={{ color: '#606070' }} />
                                <p style={{ color: '#404055' }}>No inventory snapshot available. Connect plugin to capture.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {['primary', 'secondary', 'hotbar', 'clothing', 'backpack', 'storage'].map((container) => {
                                    const items = inventory.items?.filter((i: { container: string }) => i.container === container);
                                    if (!items?.length) return null;
                                    return (
                                        <div key={container} className="glass-card rounded-sm p-4">
                                            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 capitalize" style={{ color: '#606070' }}>{container}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item: { id: string; itemId: number; amount: number; quality: number; durability: number; isFlagged: boolean }) => (
                                                    <div key={item.id}
                                                        className="relative group w-14 h-14 rounded-sm flex items-center justify-center text-xs font-mono font-bold cursor-default"
                                                        style={{
                                                            background: item.isFlagged ? 'rgba(192,57,43,0.15)' : 'rgba(255,255,255,0.04)',
                                                            border: item.isFlagged ? '1px solid rgba(192,57,43,0.4)' : '1px solid rgba(212,175,55,0.08)',
                                                            color: '#D4AF37',
                                                        }}>
                                                        {item.itemId}
                                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
                                                            style={{ background: '#D4AF37', color: '#0a0a0f' }}>{item.amount}</span>
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 p-3 rounded-sm text-xs"
                                                            style={{ background: 'rgba(17,17,24,0.98)', border: '1px solid rgba(212,175,55,0.15)', color: '#F5F5F0' }}>
                                                            <div className="font-semibold mb-1">ID: {item.itemId}</div>
                                                            <div style={{ color: '#606070' }}>Quality: {item.quality}%</div>
                                                            <div style={{ color: '#606070' }}>Durability: {Math.round(item.durability)}%</div>
                                                            {/* Quality bar */}
                                                            <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                                                <div className="h-1 rounded-full" style={{ width: `${item.quality}%`, background: item.quality > 70 ? '#1ABC9C' : item.quality > 30 ? '#E67E22' : '#E74C3C' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'punishments' && (
                    <div className="space-y-2">
                        {player.punishments?.length === 0 ? (
                            <div className="glass-card rounded-sm p-12 text-center">
                                <Shield size={32} className="mx-auto mb-3 opacity-20" style={{ color: '#606070' }} />
                                <p style={{ color: '#404055' }}>No punishments on record</p>
                            </div>
                        ) : (
                            player.punishments?.map((p: { id: string; type: string; reason: string; isActive: boolean; createdAt: string; expiresAt?: string }) => (
                                <div key={p.id} className="glass-card rounded-sm px-5 py-4 flex items-start gap-4">
                                    <span className="px-2 py-0.5 rounded-sm text-xs font-semibold flex-shrink-0"
                                        style={{ background: `${PUNISHMENT_COLORS[p.type] ?? '#D4AF37'}18`, color: PUNISHMENT_COLORS[p.type] ?? '#D4AF37', border: `1px solid ${PUNISHMENT_COLORS[p.type] ?? '#D4AF37'}30` }}>
                                        {p.type.replace('_', ' ')}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm" style={{ color: '#F5F5F0' }}>{p.reason}</p>
                                        <p className="text-xs mt-1" style={{ color: '#606070' }}>{formatDate(p.createdAt)}</p>
                                    </div>
                                    {p.isActive ? (
                                        <span className="text-xs px-2 py-0.5 rounded-sm" style={{ background: 'rgba(192,57,43,0.1)', color: '#E74C3C', border: '1px solid rgba(192,57,43,0.2)' }}>Active</span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 rounded-sm" style={{ background: 'rgba(64,64,85,0.1)', color: '#606070', border: '1px solid rgba(64,64,85,0.2)' }}>Ended</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'logs' && (
                    <div className="space-y-2">
                        {(!logs?.actionLogs || logs.actionLogs.length === 0) ? (
                            <div className="glass-card rounded-sm p-12 text-center">
                                <ScrollText size={32} className="mx-auto mb-3 opacity-20" style={{ color: '#606070' }} />
                                <p style={{ color: '#404055' }}>No action logs</p>
                            </div>
                        ) : (
                            logs.actionLogs.map((log: { id: string; admin: { username: string }; actionType: string; createdAt: string; result?: string }) => (
                                <div key={log.id} className="glass-card rounded-sm px-5 py-3 flex items-center gap-4">
                                    <span className="text-xs font-mono px-2 py-0.5 rounded-sm" style={{ background: 'rgba(93,173,226,0.1)', color: '#5DADE2', border: '1px solid rgba(93,173,226,0.2)' }}>
                                        {log.actionType.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm" style={{ color: '#D4AF37' }}>by {log.admin.username}</span>
                                    <span className="ml-auto text-xs font-mono" style={{ color: '#404055' }}>{formatDate(log.createdAt)}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
