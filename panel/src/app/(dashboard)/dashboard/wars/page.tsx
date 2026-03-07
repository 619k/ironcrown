'use client';

import { useEffect, useState } from 'react';
import { RpService, War } from '@/lib/services';
import { Swords, Trophy, Clock, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WarsPage() {
    const [wars, setWars] = useState<War[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        RpService.getWars().then(setWars).catch(console.error).finally(() => setLoading(false));
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: 'rgba(231,76,60,0.1)', text: '#E74C3C', border: 'rgba(231,76,60,0.3)', icon: <Swords size={12} className="animate-pulse" /> };
            case 'PENDING': return { bg: 'rgba(212,175,55,0.1)', text: '#D4AF37', border: 'rgba(212,175,55,0.3)', icon: <Clock size={12} /> };
            case 'ENDED': return { bg: 'rgba(39,174,96,0.1)', text: '#27AE60', border: 'rgba(39,174,96,0.3)', icon: <Trophy size={12} /> };
            default: return { bg: 'rgba(255,255,255,0.05)', text: '#9090A0', border: 'rgba(255,255,255,0.1)', icon: <Skull size={12} /> };
        }
    };

    return (
        <div className="space-y-8 animate-in mt-4">
            <div>
                <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#E74C3C' }}>
                    War Declarations
                </h1>
                <p className="text-sm" style={{ color: '#606070' }}>
                    {wars.filter(w => w.status === 'ACTIVE').length} active conflicts · {wars.length} total
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-sm animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)
                ) : wars.map((war, idx) => {
                    const state = getStatusStyle(war.status);
                    return (
                        <motion.div
                            key={war.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative rounded-sm p-6 overflow-hidden flex flex-col gap-4 transition-all hover:bg-white/5"
                            style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(20,20,25,0.8), rgba(15,15,20,0.95))' }}
                        >
                            {war.status === 'ACTIVE' && (
                                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#E74C3C' }} />
                            )}

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-display font-semibold uppercase tracking-widest" style={{ color: '#F5F5F0' }}>{war.name}</h3>
                                    <p className="text-xs mt-1" style={{ color: '#A0A0B0' }}>{war.description || 'No details recorded.'}</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-sm shrink-0" style={{ background: state.bg, color: state.text, border: `1px solid ${state.border}` }}>
                                    {state.icon} {war.status}
                                </span>
                            </div>

                            {/* Attacker vs Defender */}
                            <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: '#606070' }}>Attacker</span>
                                    <span className="font-semibold" style={{ color: '#E74C3C' }}>
                                        {war.attackerKingdom?.name ?? 'Unknown Kingdom'}
                                    </span>
                                </div>
                                <Swords size={18} color="#E74C3C" className="opacity-40" />
                                <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: '#606070' }}>Defender</span>
                                    <span className="font-semibold" style={{ color: '#5DADE2' }}>
                                        {war.defenderKingdom?.name ?? 'Unknown Kingdom'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {wars.length === 0 && !loading && (
                <div className="p-12 text-center rounded-sm" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#606070' }}>Peace reigns across the realms. No wars declared.</p>
                </div>
            )}
        </div>
    );
}
