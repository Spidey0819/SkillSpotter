// src/pages/DashboardPage.jsx
import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();

    // Check if user has admin role
    const isAdmin = user?.role === 'admin';

    return isAdmin ? <AdminDashboard /> : <DashboardLayout />;
};

export default DashboardPage;