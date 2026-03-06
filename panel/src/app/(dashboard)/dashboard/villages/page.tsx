'use client';

import { Flag, Home, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VillagesPage() {
    return (
        <div className="space-y-8 animate-in mt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#F5F5F0' }}>
                        Village Settlements
                    </h1>
                    <p className="text-sm" style={{ color: '#606070' }}>
                        View established towns and their demographic data.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i, idx) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="rounded-sm p-5 relative overflow-hidden"
                        style={{
                            border: '1px solid rgba(255,255,255,0.05)',
                            background: 'linear-gradient(180deg, rgba(20,20,25,0.8), rgba(15,15,20,0.95))'
                        }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Flag size={18} color="#606070" />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}>
                                Neutral
                            </span>
                        </div>

                        <h3 className="text-lg font-display font-semibold mb-1" style={{ color: '#F5F5F0' }}>Town {i}</h3>
                        <p className="text-xs mb-4" style={{ color: '#606070' }}>A small trading post near the coast.</p>

                        <div className="flex justify-between text-xs pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#A0A0B0' }}>
                            <div className="flex items-center gap-1.5"><Users size={14} color="#606070" /> 8 Citizens</div>
                            <div className="flex items-center gap-1.5"><Home size={14} color="#606070" /> 12 Claims</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 text-center rounded-sm" style={{ border: '1px border-dashed rgba(255,255,255,0.1)' }}>
                <p className="text-sm italic" style={{ color: '#606070' }}>
                    Note: Villages data model is currently mocked. Database table missing in Prisma schema for this feature.
                </p>
            </div>
        </div>
    );
}
