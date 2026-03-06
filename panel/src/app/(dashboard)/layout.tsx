'use client';

import { GradientBackground } from '@/components/layout/GradientBackground';
import { Sidebar } from '@/components/layout/Sidebar';
import { Providers } from '@/components/Providers';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;
    return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <AuthGuard>
                <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
                    {/* Animated gradient orbs */}
                    <GradientBackground />

                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main content */}
                    <main
                        className="relative"
                        style={{ marginLeft: '256px', minHeight: '100vh', zIndex: 1 }}
                    >
                        <div className="px-8 py-8 max-w-[1400px]">
                            {children}
                        </div>
                    </main>
                </div>
            </AuthGuard>
        </Providers>
    );
}
