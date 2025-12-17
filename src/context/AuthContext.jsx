import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Loading from '../components/Loading';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem('currentUser');
            }
        }
        setLoading(false);
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    // Update user in state and localStorage
    const updateUser = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return newUser;
    };

    const googleLogin = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture,
                    googleId: decoded.sub
                })
            });
            const data = await res.json();

            if (data.success) {
                // Use server's isNewUser flag to determine hasSeenWelcome
                const userData = {
                    ...data.user,
                    hasSeenWelcome: !data.isNewUser
                };

                setUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
                return { success: true, user: userData, isNewUser: data.isNewUser };
            } else {
                return { success: false, message: data.message || 'Google Auth Failed' };
            }

        } catch (error) {
            console.error("Google Login Error", error);
            return { success: false, message: "Google Login Failed" };
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={{ user, googleLogin, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
