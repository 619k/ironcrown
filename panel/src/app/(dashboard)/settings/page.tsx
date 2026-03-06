'use client';

import { Settings2, Save } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in mt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-2" style={{ color: '#F5F5F0' }}>
                        System Settings
                    </h1>
                    <p className="text-sm" style={{ color: '#606070' }}>
                        Configure web panel branding, API integrations, and plugin behavior.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation Sidebar for settings */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-sm font-medium" style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', borderLeft: '2px solid #D4AF37' }}>
                        <Settings2 size={16} />
                        General Configuration
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-[#F5F5F0]" style={{ color: '#606070', borderLeft: '2px solid transparent' }}>
                        Discord Webhooks
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-[#F5F5F0]" style={{ color: '#606070', borderLeft: '2px solid transparent' }}>
                        Roleplay Settings
                    </button>
                </div>

                {/* Form Area */}
                <div className="lg:col-span-2 space-y-6 p-8 rounded-sm" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-display font-semibold" style={{ color: '#F5F5F0' }}>Server Connection</h3>
                        <p className="text-sm" style={{ color: '#606070' }}>These settings control how the bridge communicates with the Unturned game server.</p>

                        <div className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A0A0B0' }}>Server Internal IP</label>
                                <input
                                    type="text"
                                    defaultValue="127.0.0.1:27015"
                                    className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none transition-colors font-mono"
                                    style={{ color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A0A0B0' }}>RCON Password</label>
                                <input
                                    type="password"
                                    defaultValue="••••••••••••"
                                    className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none transition-colors font-mono"
                                    style={{ color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-sm transition-all hover:opacity-90 tracking-widest uppercase" style={{ background: '#D4AF37', color: '#0A0A0F' }}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
