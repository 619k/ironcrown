'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { PlayerService } from '@/lib/services';

interface GiveItemModalProps {
    playerId: string;
    playerName: string;
    onClose: () => void;
}

export function GiveItemModal({ playerId, playerName, onClose }: GiveItemModalProps) {
    const [itemId, setItemId] = useState('');
    const [amount, setAmount] = useState('1');
    const [quality, setQuality] = useState('100');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!itemId || isNaN(Number(itemId))) { setError('Valid item ID required.'); return; }
        setLoading(true);
        setError('');
        try {
            await PlayerService.giveItem(playerId, Number(itemId), Number(amount), Number(quality));
            setSuccess(true);
            setTimeout(onClose, 1500);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: string } } };
            setError(apiError?.response?.data?.error ?? 'Failed to queue item. Player may be offline.');
        }
        setLoading(false);
    };

    return (
        <>
            <motion.div
                key="item-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60]"
                style={{ background: 'rgba(0,0,0,0.7)' }}
                onClick={onClose}
            />
            <motion.div
                key="item-modal"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm"
            >
                <div className="rounded-sm overflow-hidden" style={{ background: '#0d0d12', border: '1px solid rgba(93,173,226,0.2)' }}>
                    <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(93,173,226,0.08)', borderBottom: '1px solid rgba(93,173,226,0.12)' }}>
                        <div className="flex items-center gap-2">
                            <Package size={16} style={{ color: '#5DADE2' }} />
                            <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#5DADE2' }}>Give Item</span>
                        </div>
                        <button onClick={onClose} style={{ color: '#606070' }}><X size={16} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {success ? (
                            <div className="py-8 text-center">
                                <p className="text-green-400 font-semibold">✓ Item queued successfully!</p>
                                <p className="text-xs mt-1" style={{ color: '#606070' }}>Will be delivered when {playerName} is online.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm" style={{ color: '#808090' }}>
                                    Sending to: <span className="font-semibold" style={{ color: '#F5F5F0' }}>{playerName}</span>
                                </p>
                                <div className="space-y-3">
                                    <Field label="Unturned Item ID *" value={itemId} onChange={setItemId} placeholder="e.g. 363 (Maple Rifle)" type="number" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Amount" value={amount} onChange={setAmount} placeholder="1" type="number" />
                                        <Field label="Quality %" value={quality} onChange={setQuality} placeholder="100" type="number" />
                                    </div>
                                </div>
                                {error && <p className="text-xs text-red-400">{error}</p>}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-sm hover:bg-white/5 transition-colors" style={{ color: '#606070', border: '1px solid rgba(255,255,255,0.06)' }}>Cancel</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 py-2.5 text-sm rounded-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: '#5DADE2', color: '#0A0A0F' }}
                                    >
                                        {loading ? 'Queuing...' : 'Give Item'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#606070' }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#F5F5F0', background: 'rgba(255,255,255,0.02)' }}
            />
        </div>
    );
}
