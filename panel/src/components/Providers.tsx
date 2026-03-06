'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,    // 30s
                gcTime: 5 * 60_000,   // 5 min
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#151520',
                        color: '#F5F5F0',
                        border: '1px solid rgba(212,175,55,0.2)',
                        borderRadius: '4px',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#1ABC9C', secondary: '#151520' } },
                    error: { iconTheme: { primary: '#E74C3C', secondary: '#151520' } },
                }}
            />
        </QueryClientProvider>
    );
}
