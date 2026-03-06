import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(d);
}

export function timeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export function truncate(str: string, len: number) {
    return str.length > len ? str.slice(0, len) + '…' : str;
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function steamIdToProfileUrl(steamId: string) {
    return `https://steamcommunity.com/profiles/${steamId}`;
}
