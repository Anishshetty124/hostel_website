import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

// 1. Create the Context (The "Brain")
// This is the specific export your error says is missing!
export const AuthContext = createContext();

// 2. Create the Provider (The Wrapper)
export const AuthProvider = ({ children }) => {
    // Read localStorage synchronously during initialization for instant load
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            return stored ? JSON.parse(stored).user : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            return stored ? JSON.parse(stored).token : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Auth data already loaded synchronously, mark as done immediately
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // Accepts identifier (email or first name) per backend API
    const login = async (identifier, password) => {
        try {
            const { data } = await api.post('/auth/login', { identifier, password });
            
            // Save login data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data.user);
            setToken(data.token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};