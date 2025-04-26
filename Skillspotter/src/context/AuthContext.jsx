// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import config from '../services/configService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null);

    // Helper function to store authentication data
    const storeAuthData = (data) => {
        if (data.token) {
            localStorage.setItem('token', data.token);

            // Set default role if not provided by API
            if (!data.role) {
                // Assign admin role for specific emails (for demo purposes)
                if (data.email && (data.email.includes('admin') || data.email === 'admin@example.com')) {
                    data.role = 'admin';
                } else {
                    data.role = 'user';
                }
            }

            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);

            // Setup token refresh if needed (every 45 minutes)
            if (tokenRefreshTimer) {
                clearTimeout(tokenRefreshTimer);
            }

            // Token refresh every 45 minutes to prevent expiry
            // Adjust this based on your token expiration policy
            const timer = setTimeout(() => {
                refreshToken();
            }, 45 * 60 * 1000);

            setTokenRefreshTimer(timer);
        }
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        setLoading(false);

        // Cleanup token refresh timer
        return () => {
            if (tokenRefreshTimer) {
                clearTimeout(tokenRefreshTimer);
            }
        };
    }, [tokenRefreshTimer]);

    // Refresh authentication token
    const refreshToken = useCallback(async () => {
        if (!localStorage.getItem('token')) return null;

        try {
            setLoading(true);
            const response = await authAPI.refreshToken();

            if (response.data && response.data.token) {
                // Update existing user data with new token
                const userData = { ...user, token: response.data.token };
                storeAuthData(userData);
                return userData;
            }
        } catch (err) {
            console.error('Token refresh failed:', err);
            // If token refresh fails, log the user out
            logout();
        } finally {
            setLoading(false);
        }

        return null;
    }, [user]);

    // Check if user token is still valid
    const checkAuthStatus = useCallback(async () => {
        try {
            if (localStorage.getItem('token')) {
                setLoading(true);
                const { data } = await authAPI.getCurrentUser();

                // If token is valid but we need to update user data
                if (data && (!user || data.userId !== user.userId)) {
                    // Merge with existing token
                    const userData = {
                        ...data,
                        token: localStorage.getItem('token')
                    };
                    storeAuthData(userData);
                    return userData;
                }

                return user;
            }
        } catch (err) {
            console.error('Auth validation failed:', err);
            logout();
        } finally {
            setLoading(false);
        }
        return null;
    }, [user]);

    // Load user data on first render if token exists
    useEffect(() => {
        const initAuth = async () => {
            await checkAuthStatus();
        };

        initAuth();
    }, [checkAuthStatus]);

    // Login function
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await authAPI.login({ email, password });
            storeAuthData(data);

            return data;
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await authAPI.register(userData);
            storeAuthData(data);

            return data;
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        // Clear timer
        if (tokenRefreshTimer) {
            clearTimeout(tokenRefreshTimer);
            setTokenRefreshTimer(null);
        }

        // Clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);

        // Attempt to notify the server about logout
        try {
            authAPI.logout().catch(err => {
                // Silent catch - if the server logout fails, we still log out locally
                console.log('Server logout notification failed, but local logout completed');
            });
        } catch (e) {
            // Silent fail - even if server notification fails, we still log out locally
        }
    };

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    const authValues = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuthStatus,
        refreshToken,
        isAuthenticated: !!user,
        isAdmin,
        apiEndpoint: config.apiUrl
    };

    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};