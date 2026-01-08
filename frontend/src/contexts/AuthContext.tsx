import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';

interface User {
    id: number;
    email: string;
    role: string;
    profilePhoto?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, confirmPassword: string, role: string, adminCode?: string) => Promise<void>;  // BU SATIR DEĞİŞTİ
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const data = await authService.login(email, password);
        setUser(data.user);
    };

    const register = async (email: string, password: string, confirmPassword: string, role: string, adminCode?: string) => {  // BU SATIR DEĞİŞTİ
        const data = await authService.register(email, password, confirmPassword, role, adminCode);  // BU SATIR DEĞİŞTİ
        setUser(data.user);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};