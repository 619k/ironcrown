'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, UserX, ShieldAlert, Ban, Clock, Package, RotateCcw,
    Activity, Crown, MapPin, Timer, Calendar, Skull, ChevronRight
} from 'lucide-react';
import { Player, PlayerService, Punishment } from '@/lib/services';
import { PunishModal } from './PunishModal';
import { GiveItemModal } from './GiveItemModal';
import { InventoryViewer } from './InventoryViewer';

interface PlayerDrawerProps {
    player: Player | null;
    onClose: () => void;
}

type ModalType = 'kick' | 'warn' | 'temp_ban' | 'perm_ban' | 'give_item' | 'inventory' | null;

export function PlayerDrawer({ player, onClose }: PlayerDrawerProps) {
    const [detail, setDetail] = useState<(Player & { punishments: Punishment[] }) | null>(null);
    const [modal, setModal] = useState<ModalType>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!player) { setDetail(null); return; }
        setLoading(true);
        PlayerService.getById(player.id)
            .then(setDetail)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [player]);

    if (!player) return null;

    const activePunishments = detail?.punishments?.filter(p => p.isActive) ?? [];

    return (
        <>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, #0d0d12 0%, #0a0a0f 100%)',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-sm flex items-center justify-center text-2xl font-bold uppercase"
                            style={{
                                background: player.isOnline
                                    ? 'linear-gradient(135deg, rgba(39,174,96,0.2), rgba(39,174,96,0.05))'
                                    : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${player.isOnline ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                color: player.isOnline ? '#27AE60' : '#606070',
                            }}
                        >
                            {player.playerName[0]}
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-semibold" style={{ color: '#F5F5F0' }}>
                                {player.playerName}
                            </h2>
                            <div className="text-xs font-mono mt-0.5" style={{ color: '#606070' }}>
                                {player.steamId}
                            </div>
                            {player.isOnline && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Activity size={10} color="#27AE60" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#27AE60' }}>Online</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-sm hover:bg-white/5 transition-colors" style={{ color: '#606070' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-sm animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <Stat icon={<Timer size={14} />} label="Playtime" value={`${Math.floor((detail?.totalPlaytime ?? player.totalPlaytime) / 3600)}h`} />
                                <Stat icon={<Calendar size={14} />} label="First Seen" value={formatDate(detail?.firstSeen ?? player.firstSeen)} />
                                {detail?.kingdom && <Stat icon={<Crown size={14} />} label="Kingdom" value={detail.kingdom.name} color="#D4AF37" />}
                                {detail?.village && <Stat icon={<MapPin size={14} />} label="Village" value={detail.village.name} />}
                            </div>

                            {/* Active Punishments */}
                            {activePunishments.length > 0 && (
                                <div className="rounded-sm p-4" style={{ background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.15)' }}>
                                    <div className="flex items-center gap-2 mb-3 text-red-500">
                                        <ShieldAlert size={14} />
                                        <span className="text-xs font-semibold uppercase tracking-widest">Active Sanctions ({activePunishments.length})</span>
                                    </div>
                                    <div className="space-y-2">
                                        {activePunishments.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-red-400">{p.type.replace('_', ' ')}</span>
                                                <span className="truncate mx-2 max-w-[120px]" style={{ color: '#A0A0B0' }}>{p.reason}</span>
                                                <button
                                                    onClick={() => PlayerService.unban(player.id).then(() => { setDetail(d => d ? { ...d, punishments: d.punishments.map(x => x.id === p.id ? { ...x, isActive: false } : x) } : d); })}
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase transition-colors hover:bg-green-500/20"
                                                    style={{ color: '#27AE60', border: '1px solid rgba(39,174,96,0.2)' }}
                                                >
                                                    <RotateCcw size={10} /> Revoke
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent punishment history */}
                            {(detail?.punishments ?? []).filter(p => !p.isActive).slice(0, 3).length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#404055' }}>Sanction History</div>
                                    <div className="space-y-1.5">
                                        {(detail?.punishments ?? []).filter(p => !p.isActive).slice(0, 3).map(p => (
                                            <div key={p.id} className="flex items-center text-xs gap-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#606070' }}>
                                                <Skull size={12} opacity={0.4} />
                                                <span style={{ color: '#808090' }}>{p.type.replace('_', ' ')}</span>
                                                <span className="flex-1 truncate">{p.reason}</span>
                                                <span>{formatDate(p.createdAt)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="shrink-0 p-4 grid grid-cols-2 gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <ActionBtn onClick={() => setModal('kick')} icon={<UserX size={14} />} label="Kick" color="#E67E22" />
                    <ActionBtn onClick={() => setModal('warn')} icon={<ShieldAlert size={14} />} label="Warn" color="#D4AF37" />
                    <ActionBtn onClick={() => setModal('temp_ban')} icon={<Clock size={14} />} label="Temp Ban" color="#E74C3C" />
                    <ActionBtn onClick={() => setModal('perm_ban')} icon={<Ban size={14} />} label="Perm Ban" color="#C0392B" danger />
                    <ActionBtn onClick={() => setModal('give_item')} icon={<Package size={14} />} label="Give Item" color="#5DADE2" />
                    <ActionBtn onClick={() => setModal('inventory')} icon={<ChevronRight size={14} />} label="Inventory" color="#9B59B6" />
                </div>
            </motion.aside>

            {/* Modals */}
            <AnimatePresence>
                {modal === 'give_item' && (
                    <GiveItemModal
                        playerId={player.id}
                        playerName={player.playerName}
                        onClose={() => setModal(null)}
                    />
                )}
                {modal === 'inventory' && (
                    <InventoryViewer
                        playerId={player.id}
                        playerName={player.playerName}
                        onClose={() => setModal(null)}
                    />
                )}
                {(modal === 'kick' || modal === 'warn' || modal === 'temp_ban' || modal === 'perm_ban') && (
                    <PunishModal
                        playerId={player.id}
                        playerName={player.playerName}
                        type={modal}
                        onClose={() => setModal(null)}
                        onSuccess={() => {
                            setModal(null);
                            // Refresh punishments
                            PlayerService.getById(player.id).then(setDetail).catch(console.error);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: color ?? '#606070' }}>{icon}</span>
            <div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: '#404055' }}>{label}</div>
                <div className="text-sm font-semibold" style={{ color: color ?? '#F5F5F0' }}>{value}</div>
            </div>
        </div>
    );
}

function ActionBtn({ onClick, icon, label, color, danger }: { onClick: () => void; icon: React.ReactNode; label: string; color: string; danger?: boolean }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold transition-all hover:scale-[1.02] active:scale-100"
            style={{
                background: danger ? `${color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}30`,
                color,
            }}
        >
            {icon} {label}
        </button>
    );
}

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
