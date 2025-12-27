import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context (The "Brain")
// This is the specific export your error says is missing!
export const AuthContext = createContext();

// 2. Create the Provider (The Wrapper)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in when app loads
    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.user) setUser(parsed.user);
                if (parsed?.token) setToken(parsed.token);
            } catch {}
        }
        setLoading(false);
    }, []);

    // Accepts identifier (email or first name) per backend API
    const login = async (identifier, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { identifier, password });
            
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