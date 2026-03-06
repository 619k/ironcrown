import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: false,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('ironcrown_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: handle 401 ─────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('ironcrown_refresh');
                if (refreshToken) {
                    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                    localStorage.setItem('ironcrown_token', data.data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('ironcrown_token');
                    localStorage.removeItem('ironcrown_refresh');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    },
);
