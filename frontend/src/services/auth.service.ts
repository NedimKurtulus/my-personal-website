import api from './api';

export const authService = {
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async register(email: string, password: string, confirmPassword: string, role: string, adminCode?: string) {  // BU SATIR DEĞİŞTİ
        const response = await api.post('/auth/register', {
            email,
            password,
            confirmPassword,
            role,
            adminCode: role === 'admin' ? adminCode : undefined  // BU SATIR EKLENDİ
        });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },
};