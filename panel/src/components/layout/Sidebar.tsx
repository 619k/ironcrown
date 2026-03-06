'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
    LayoutDashboard, Users, Package, Shield, ScrollText,
    Crown, Flag, Swords, Map, Settings, LogOut, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { href: '/dashboard/players', label: 'Players', icon: Users, section: 'main' },
    { href: '/dashboard/punishments', label: 'Punishments', icon: Shield, section: 'main' },
    { href: '/dashboard/logs', label: 'Logs', icon: ScrollText, section: 'main' },
    { href: '/dashboard/kingdoms', label: 'Kingdoms', icon: Crown, section: 'roleplay' },
    { href: '/dashboard/villages', label: 'Villages', icon: Flag, section: 'roleplay' },
    { href: '/dashboard/wars', label: 'Wars', icon: Swords, section: 'roleplay' },
    { href: '/dashboard/map', label: 'Live Map', icon: Map, section: 'roleplay' },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, section: 'system' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const sections = [
        { key: 'main', label: 'Administration' },
        { key: 'roleplay', label: 'Roleplay' },
        { key: 'system', label: 'System' },
    ];

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-64 flex flex-col"
            style={{
                background: 'linear-gradient(180deg, rgba(17,17,24,0.98) 0%, rgba(10,10,15,0.98) 100%)',
                borderRight: '1px solid rgba(212,175,55,0.1)',
                backdropFilter: 'blur(20px)',
                zIndex: 40,
            }}
        >
            {/* Logo area */}
            <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                <div
                    className="w-9 h-9 flex items-center justify-center text-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(160,128,32,0.1) 100%)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        borderRadius: '2px',
                    }}
                >
                    ⚔️
                </div>
                <div>
                    <div className="font-display font-semibold text-base" style={{ color: '#D4AF37', letterSpacing: '0.05em' }}>
                        IronCrown
                    </div>
                    <div className="text-xs" style={{ color: '#606070' }}>Admin Suite</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {sections.map((section) => {
                    const items = NAV_ITEMS.filter((i) => i.section === section.key);
                    return (
                        <div key={section.key}>
                            <div className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#404055' }}>
                                {section.label}
                            </div>
                            <ul className="space-y-0.5">
                                {items.map((item) => {
                                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'group flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-all duration-200',
                                                    active
                                                        ? 'text-[#D4AF37]'
                                                        : 'hover:text-[#F5F5F0] text-[#606070]',
                                                )}
                                                style={
                                                    active
                                                        ? {
                                                            background: 'rgba(212,175,55,0.08)',
                                                            borderLeft: '2px solid #D4AF37',
                                                            paddingLeft: '10px',
                                                        }
                                                        : { borderLeft: '2px solid transparent', paddingLeft: '10px' }
                                                }
                                            >
                                                <item.icon size={16} className="shrink-0" />
                                                <span className="flex-1">{item.label}</span>
                                                {active && <ChevronRight size={12} className="opacity-50" />}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="px-3 py-2 rounded-sm mb-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-sm font-medium" style={{ color: '#F5F5F0' }}>{user?.username}</div>
                    <div className="text-xs" style={{ color: '#606070' }}>
                        <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase"
                            style={{
                                background: 'rgba(212,175,55,0.12)',
                                color: '#D4AF37',
                                border: '1px solid rgba(212,175,55,0.2)',
                            }}
                        >
                            {user?.role}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors"
                    style={{ color: '#606070' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#E74C3C'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#606070'}
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </motion.aside>
    );
}
