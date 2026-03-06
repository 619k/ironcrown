'use client';

import { Map as MapIcon, Compass } from 'lucide-react';

export default function MapPage() {
    return (
        <div className="space-y-6 animate-in mt-4 flex flex-col h-[calc(100vh-8rem)]">
            <div className="shrink-0 flex items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#F5F5F0' }}>
                        Live Map Viewer
                    </h1>
                    <p className="text-sm" style={{ color: '#606070' }}>
                        Real-time tracking of player positions and kingdom territories.
                    </p>
                </div>
            </div>

            <div className="flex-1 relative rounded-sm overflow-hidden flex items-center justify-center flex-col gap-4 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0f' }}>
                {/* Radar Grid Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />

                <MapIcon size={48} color="#D4AF37" className="opacity-50" />
                <div>
                    <h3 className="font-display text-xl mb-2" style={{ color: '#F5F5F0' }}>Cartography Offline</h3>
                    <p className="text-sm max-w-md mx-auto" style={{ color: '#606070' }}>
                        The live map module requires a pre-rendered coordinate map of the active Unturned level (e.g., PEI, Washington, or Custom).
                    </p>
                </div>

                <button className="mt-4 flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-sm transition-all hover:bg-white/10 tracking-widest uppercase border" style={{ color: '#F5F5F0', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Compass size={16} /> Upload Map Layer
                </button>
            </div>
        </div>
    );
}
