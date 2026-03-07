'use client';

import { useEffect, useState } from 'react';
import { RpService, Kingdom } from '@/lib/services';
import { Crown, Shield, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KingdomsPage() {
    const [kingdoms, setKingdoms] = useState<Kingdom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        RpService.getKingdoms().then(setKingdoms).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 animate-in mt-4">
            <div>
                <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#D4AF37' }}>
                    Kingdom Realms
                </h1>
                <p className="text-sm" style={{ color: '#606070' }}>
                    {kingdoms.length} established factions across the continent.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-sm animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)
                ) : kingdoms.map((k, idx) => (
                    <motion.div
                        key={k.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative rounded-sm overflow-hidden flex flex-col justify-between p-6 transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, rgba(20,20,25,0.8), rgba(10,10,15,0.95))', border: '1px solid rgba(212,175,55,0.1)' }}
                    >
                        {/* Top color bar */}
                        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: k.colorHex || '#D4AF37', boxShadow: `0 0 15px ${k.colorHex || '#D4AF37'}50` }} />

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-display font-bold uppercase tracking-widest" style={{ color: '#F5F5F0' }}>{k.name}</h3>
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: k.isActive ? '#27AE60' : '#606070' }}>
                                    {k.isActive ? '● Active Realm' : '○ Fallen'}
                                </span>
                            </div>
                            <Crown size={24} color={k.colorHex || "#D4AF37"} className="opacity-80" />
                        </div>

                        <p className="text-sm line-clamp-2 mb-6" style={{ color: '#808090' }}>
                            {k.description || 'No lore entered for this kingdom.'}
                        </p>

                        <div className="grid grid-cols-3 gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex flex-col gap-1">
                                <Users size={14} color="#606070" />
                                <span className="text-xs font-semibold" style={{ color: '#F5F5F0' }}>
                                    {k._count?.players ?? 0} Players
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Shield size={14} color="#606070" />
                                <span className="text-xs font-semibold" style={{ color: '#F5F5F0' }}>Active</span>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <MapPin size={14} color="#606070" />
                                <span className="text-xs font-semibold" style={{ color: '#F5F5F0' }}>
                                    {k.villages?.length ?? 0} Villages
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {kingdoms.length === 0 && !loading && (
                <div className="p-12 text-center rounded-sm" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#606070' }}>No kingdoms established yet.</p>
                </div>
            )}
        </div>
    );
}
