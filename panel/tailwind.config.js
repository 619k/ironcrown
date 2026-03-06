/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    DEFAULT: '#0a0a0f',
                    surface: '#111118',
                    card: '#151520',
                    elevated: '#1a1a28',
                    border: '#1e1e30',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    light: '#F0D060',
                    dark: '#A08020',
                    muted: '#6B5A1A',
                    glow: 'rgba(212,175,55,0.15)',
                },
                crimson: {
                    DEFAULT: '#C0392B',
                    light: '#E74C3C',
                    dark: '#922B21',
                    muted: '#4A1010',
                    glow: 'rgba(192,57,43,0.15)',
                },
                ice: {
                    DEFAULT: '#5DADE2',
                    light: '#85C1E9',
                    dark: '#2E86C1',
                    muted: '#1A3A4A',
                    glow: 'rgba(93,173,226,0.15)',
                },
                emerald: {
                    DEFAULT: '#1ABC9C',
                    light: '#48C9B0',
                    dark: '#148F77',
                    muted: '#0B4A3A',
                },
                amber: {
                    DEFAULT: '#E67E22',
                    light: '#F39C12',
                    dark: '#CA6F1E',
                    muted: '#5D3A0E',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Cinzel', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            borderRadius: {
                sm: '2px',
                DEFAULT: '4px',
                md: '6px',
                lg: '8px',
                xl: '12px',
            },
            boxShadow: {
                'gold': '0 0 20px rgba(212, 175, 55, 0.2), 0 0 40px rgba(212, 175, 55, 0.05)',
                'gold-sm': '0 0 8px rgba(212, 175, 55, 0.15)',
                'crimson': '0 0 20px rgba(192, 57, 43, 0.2)',
                'ice': '0 0 20px rgba(93, 173, 226, 0.2)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
                'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
            },
            keyframes: {
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in': {
                    from: { opacity: '0', transform: 'translateX(-12px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-in': 'slide-in 0.3s ease-out',
                shimmer: 'shimmer 2s linear infinite',
            },
        },
    },
    plugins: [],
};
