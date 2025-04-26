// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, checkAuthStatus } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            checkAuthStatus();
        }
    }, [isAuthenticated, loading, checkAuthStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Return the user to the login page, but save where they were trying to go
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Admin Route component - only accessible to admins
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading, checkAuthStatus } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            checkAuthStatus();
        }
    }, [isAuthenticated, loading, checkAuthStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// App Routes component that must be inside the AuthProvider
const AppRoutes = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Get the intended destination from the state, if any
    const from = location.state?.from?.pathname || '/dashboard';

    // Add smooth scrolling behavior
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = '';
        };
    }, []);

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={
                isAuthenticated ? <Navigate to={from} /> : <Navigate to="/login" />
            } />
            <Route path="/login" element={
                isAuthenticated ? <Navigate to={from} /> : <LoginPage />
            } />
            <Route path="/register" element={
                isAuthenticated ? <Navigate to={from} /> : <RegisterPage />
            } />

            {/* Protected routes */}
            <Route path="/dashboard/*" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
                <AdminRoute>
                    <DashboardPage />
                </AdminRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;