'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sword } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Providers } from '@/components/Providers';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'At least 6 characters'),
});
type Form = z.infer<typeof schema>;

function LoginForm() {
    const [showPass, setShowPass] = useState(false);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: Form) => {
        try {
            const res = await api.post('/auth/login', data);
            const { user, accessToken, refreshToken } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            toast.success(`Welcome, ${user.username}!`);
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed';
            toast.error(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#606070' }}>
                    Email
                </label>
                <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="admin@ironcrown.local"
                    className="w-full px-4 py-3 text-sm rounded-sm outline-none transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: errors.email ? '1px solid rgba(192,57,43,0.6)' : '1px solid rgba(212,175,55,0.1)',
                        color: '#F5F5F0',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
                    onBlur={(e) => e.target.style.borderColor = errors.email ? 'rgba(192,57,43,0.6)' : 'rgba(212,175,55,0.1)'}
                />
                {errors.email && <p className="mt-1 text-xs" style={{ color: '#E74C3C' }}>{errors.email.message}</p>}
            </div>

            <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#606070' }}>
                    Password
                </label>
                <div className="relative">
                    <input
                        {...register('password')}
                        type={showPass ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-11 text-sm rounded-sm outline-none transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: errors.password ? '1px solid rgba(192,57,43,0.6)' : '1px solid rgba(212,175,55,0.1)',
                            color: '#F5F5F0',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
                        onBlur={(e) => e.target.style.borderColor = errors.password ? 'rgba(192,57,43,0.6)' : 'rgba(212,175,55,0.1)'}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#606070' }}
                    >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {errors.password && <p className="mt-1 text-xs" style={{ color: '#E74C3C' }}>{errors.password.message}</p>}
            </div>

            <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-shine w-full py-3 text-sm font-semibold uppercase tracking-widest rounded-sm transition-all"
                style={{
                    background: isSubmitting
                        ? 'rgba(212,175,55,0.3)'
                        : 'linear-gradient(135deg, #D4AF37 0%, #A08020 100%)',
                    color: '#0a0a0f',
                    border: 'none',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                }}
            >
                {isSubmitting ? 'Authenticating…' : 'Enter the Kingdom'}
            </motion.button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <Providers>
            <div
                className="min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{ background: 'var(--bg-base)' }}
            >
                {/* Background orbs */}
                <div className="grain-overlay" aria-hidden />
                <motion.div
                    className="orb orb-gold"
                    style={{ top: '-200px', left: '-100px' }}
                    animate={{ y: [0, -25, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="orb orb-crimson"
                    style={{ bottom: '-150px', right: '-80px' }}
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                />

                {/* Login card */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="relative z-10 w-full max-w-md mx-4"
                >
                    <div
                        className="p-8 rounded-sm"
                        style={{
                            background: 'linear-gradient(135deg, rgba(21,21,32,0.95) 0%, rgba(26,26,40,0.90) 100%)',
                            border: '1px solid rgba(212,175,55,0.12)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.04)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div
                                className="inline-flex items-center justify-center w-14 h-14 mb-4 text-3xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(160,128,32,0.08) 100%)',
                                    border: '1px solid rgba(212,175,55,0.25)',
                                    borderRadius: '2px',
                                }}
                            >
                                <Sword style={{ color: '#D4AF37' }} size={28} />
                            </div>
                            <h1 className="font-display text-2xl font-semibold" style={{ color: '#D4AF37', letterSpacing: '0.08em' }}>
                                IronCrown
                            </h1>
                            <p className="text-sm mt-1" style={{ color: '#606070' }}>Admin Command Console</p>
                        </div>

                        <LoginForm />

                        <p className="text-center text-xs mt-6" style={{ color: '#404055' }}>
                            Unauthorized access is prohibited
                        </p>
                    </div>
                </motion.div>
            </div>
        </Providers>
    );
}
