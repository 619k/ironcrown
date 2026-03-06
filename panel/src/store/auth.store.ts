'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    username: string;
    role: 'SUPERADMIN' | 'ADMIN' | 'MODERATOR';
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, token, refreshToken) => {
                // Also store in localStorage for axios interceptor
                localStorage.setItem('ironcrown_token', token);
                localStorage.setItem('ironcrown_refresh', refreshToken);
                set({ user, token, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('ironcrown_token');
                localStorage.removeItem('ironcrown_refresh');
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
            },
        }),
        { name: 'ironcrown-auth' },
    ),
);

// ── Permission helpers ────────────────────────────────
export function useCanAdmin() {
    const role = useAuthStore((s) => s.user?.role);
    return role === 'ADMIN' || role === 'SUPERADMIN';
}

export function useCanSuperAdmin() {
    return useAuthStore((s) => s.user?.role) === 'SUPERADMIN';
}
