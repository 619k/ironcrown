'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Shield, Swords, Wifi, WifiOff, Activity, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';

function StatCard({ label, value, icon: Icon, color, delay = 0 }: {
    label: string; value: string | number; icon: React.ElementType;
    color: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            className="glass-card rounded-sm p-6 relative overflow-hidden"
        >
            <div
                className="absolute inset-0 opacity-5"
                style={{ background: `radial-gradient(circle at top right, ${color}, transparent 60%)` }}
            />
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#606070' }}>{label}</p>
                    <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
                </div>
                <div
                    className="p-2 rounded-sm"
                    style={{ background: `rgba(${color === '#D4AF37' ? '212,175,55' : color === '#1ABC9C' ? '26,188,156' : color === '#C0392B' ? '192,57,43' : '93,173,226'},0.12)` }}
                >
                    <Icon size={20} style={{ color }} />
                </div>
            </div>
        </motion.div>
    );
}

function ServerStatusCard({ isOnline, onlineCount, lastSeen }: { isOnline: boolean; onlineCount: number; lastSeen?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="glass-card rounded-sm p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#606070' }}>Server Status</h3>
                <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold"
                    style={{
                        background: isOnline ? 'rgba(26,188,156,0.12)' : 'rgba(192,57,43,0.12)',
                        color: isOnline ? '#1ABC9C' : '#E74C3C',
                        border: `1px solid ${isOnline ? 'rgba(26,188,156,0.25)' : 'rgba(192,57,43,0.25)'}`,
                    }}
                >
                    {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                    {isOnline ? 'Plugin Online' : 'Plugin Offline'}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-2xl font-bold font-mono" style={{ color: '#5DADE2' }}>{onlineCount}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#606070' }}>Online Players</p>
                </div>
                <div>
                    <p className="text-sm font-mono" style={{ color: '#F5F5F0' }}>
                        {lastSeen ? timeAgo(lastSeen) : 'Never'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#606070' }}>Last Heartbeat</p>
                </div>
            </div>
        </motion.div>
    );
}

function RecentLogs({ logs }: { logs: Array<{ adminName: string; actionType: string; playerName?: string; createdAt: string }> }) {
    const colorMap: Record<string, string> = {
        ban: '#E74C3C', temp_ban: '#E74C3C', kick: '#E67E22',
        warn: '#F39C12', unban: '#1ABC9C', give_item: '#5DADE2',
        clear_inventory: '#E67E22',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="glass-card rounded-sm p-6 col-span-2"
        >
            <div className="flex items-center gap-2 mb-5">
                <Activity size={16} style={{ color: '#D4AF37' }} />
                <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#606070' }}>Recent Admin Actions</h3>
            </div>
            {logs.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#404055' }}>
                    <Shield size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No actions yet</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {logs.map((log, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.06 }}
                            className="flex items-center gap-3 py-2 text-sm"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        >
                            <span
                                className="px-2 py-0.5 rounded-sm text-xs font-semibold uppercase min-w-[80px] text-center"
                                style={{
                                    background: `${colorMap[log.actionType] ?? '#606070'}18`,
                                    color: colorMap[log.actionType] ?? '#606070',
                                    border: `1px solid ${colorMap[log.actionType] ?? '#606070'}30`,
                                }}
                            >
                                {log.actionType.replace('_', ' ')}
                            </span>
                            <span style={{ color: '#D4AF37' }}>{log.adminName}</span>
                            <span style={{ color: '#606070' }}>→</span>
                            <span style={{ color: '#F5F5F0' }}>{log.playerName ?? '—'}</span>
                            <span className="ml-auto text-xs font-mono flex items-center gap-1" style={{ color: '#404055' }}>
                                <Clock size={10} />
                                {timeAgo(log.createdAt)}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}

export default function DashboardPage() {
    const { data: status } = useQuery({
        queryKey: ['server-status'],
        queryFn: () => api.get('/map/status').then((r) => r.data.data),
        refetchInterval: 15_000,
    });

    const { data: players } = useQuery({
        queryKey: ['players-count'],
        queryFn: () => api.get('/players?limit=1').then((r) => r.data.data),
        refetchInterval: 30_000,
    });

    const { data: wars } = useQuery({
        queryKey: ['wars-active'],
        queryFn: () => api.get('/wars').then((r) => r.data.data),
        refetchInterval: 60_000,
    });

    const { data: logs } = useQuery({
        queryKey: ['recent-logs'],
        queryFn: () => api.get('/logs/admin-actions?limit=8').then((r) => r.data.data),
        refetchInterval: 30_000,
    });

    const { data: bans } = useQuery({
        queryKey: ['recent-bans'],
        queryFn: () => api.get('/logs/punishments?limit=5&type=PERMANENT_BAN').then((r) => r.data.data),
    });

    const activeWars = (wars ?? []).filter((w: { status: string }) => w.status === 'ACTIVE').length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-display text-3xl font-semibold" style={{ color: '#D4AF37', letterSpacing: '0.04em' }}>
                    Command Dashboard
                </h1>
                <p className="text-sm mt-1" style={{ color: '#606070' }}>
                    Medieval Roleplay Server Administration
                </p>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Online Players" value={status?.onlineCount ?? 0} icon={Users} color="#5DADE2" delay={0} />
                <StatCard label="Total Players" value={players?.total ?? 0} icon={Shield} color="#1ABC9C" delay={0.08} />
                <StatCard label="Active Wars" value={activeWars} icon={Swords} color="#C0392B" delay={0.16} />
                <StatCard label="Recent Bans" value={bans?.length ?? 0} icon={AlertTriangle} color="#D4AF37" delay={0.24} />
            </div>

            {/* Status + Logs row */}
            <div className="grid grid-cols-3 gap-4">
                <ServerStatusCard
                    isOnline={status?.isOnline ?? false}
                    onlineCount={status?.onlineCount ?? 0}
                    lastSeen={status?.lastSeen}
                />
                <RecentLogs logs={logs ?? []} />
            </div>
        </div>
    );
}
