'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, Archive } from 'lucide-react';
import { PlayerService, InventoryItem } from '@/lib/services';

interface InventoryViewerProps {
    playerId: string;
    playerName: string;
    onClose: () => void;
}

const CONTAINER_LABELS: Record<string, string> = {
    Primary: '🔫 Primary Weapon',
    Secondary: '🔪 Secondary Weapon',
    Hands: '👐 Hands',
    Vest: '🦺 Vest',
    Backpack: '🎒 Backpack',
    Pants: '👖 Pants',
    Storage: '📦 Storage',
};

export function InventoryViewer({ playerId, playerName, onClose }: InventoryViewerProps) {
    const [snapshot, setSnapshot] = useState<{ items: InventoryItem[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        PlayerService.getInventory(playerId).then(setSnapshot).finally(() => setLoading(false));
    }, [playerId]);

    // Group items by container
    const grouped = (snapshot?.items ?? []).reduce<Record<string, InventoryItem[]>>((acc, item) => {
        const key = item.container || 'Storage';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <>
            <motion.div
                key="inv-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60]"
                style={{ background: 'rgba(0,0,0,0.7)' }}
                onClick={onClose}
            />
            <motion.div
                key="inv-modal"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg max-h-[80vh] flex flex-col"
            >
                <div className="rounded-sm overflow-hidden flex flex-col max-h-[80vh]" style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-2">
                            <Archive size={16} style={{ color: '#D4AF37' }} />
                            <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#D4AF37' }}>Inventory</span>
                            <span className="ml-2 text-sm" style={{ color: '#F5F5F0' }}>{playerName}</span>
                        </div>
                        <button onClick={onClose} style={{ color: '#606070' }}><X size={16} /></button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto p-6 space-y-5">
                        {loading ? (
                            <div className="py-12 text-center" style={{ color: '#606070' }}>
                                <div className="w-6 h-6 border border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-sm">Loading inventory...</p>
                            </div>
                        ) : !snapshot || snapshot.items.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package size={32} className="mx-auto mb-3 opacity-20" style={{ color: '#606070' }} />
                                <p className="text-sm" style={{ color: '#606070' }}>No inventory snapshot found.</p>
                                <p className="text-xs mt-1" style={{ color: '#404055' }}>This player may not have connected recently.</p>
                            </div>
                        ) : (
                            Object.entries(grouped).map(([container, items]) => (
                                <div key={container}>
                                    <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#404055' }}>
                                        {CONTAINER_LABELS[container] ?? container}
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div>
                                                    <span className="text-sm font-medium" style={{ color: '#F5F5F0' }}>
                                                        {item.itemName ?? `Item #${item.itemId}`}
                                                    </span>
                                                    <span className="ml-2 text-xs font-mono" style={{ color: '#404055' }}>ID:{item.itemId}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span style={{ color: '#606070' }}>x{item.amount}</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-16 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${item.quality}%`,
                                                                    background: item.quality > 70 ? '#27AE60' : item.quality > 30 ? '#D4AF37' : '#E74C3C'
                                                                }}
                                                            />
                                                        </div>
                                                        <span style={{ color: '#606070' }}>{item.quality}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
