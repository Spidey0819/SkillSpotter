// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './sections/AdminOverview';
import JobPostingSection from './sections/JobPostingSection';
import UserManagementSection from './sections/UserManagementSection';
import AnalyticsSection from './sections/AnalyticsSection';
import AdminSettingsSection from './sections/AdminSettingsSection';
import AdminJobsSection from './sections/AdminJobsSection';

const AdminDashboard = () => {
    const { user, logout, isAuthenticated, checkAuthStatus } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const initDashboard = async () => {
            if (!isAuthenticated) {
                // If not authenticated, try to validate token
                const userData = await checkAuthStatus();
                if (!userData) {
                    navigate('/login');
                    return;
                }
            }

            // Check if user is admin
            if (user?.role !== 'admin') {
                navigate('/dashboard');
                return;
            }

            // Simulate loading data
            setTimeout(() => {
                setLoading(false);
            }, 800);
        };

        initDashboard();
    }, [isAuthenticated, checkAuthStatus, navigate, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile menu button */}
            <div className="fixed top-0 left-0 p-4 z-20 md:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 focus:outline-none"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <AdminSidebar
                user={user}
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />

            {/* Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main content */}
            <div className="md:pl-64">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {currentSection === 'overview' && <AdminOverview />}
                    {currentSection === 'job-posting' && <JobPostingSection />}
                    {currentSection === 'jobs' && <AdminJobsSection />}
                    {currentSection === 'users' && <UserManagementSection />}
                    {currentSection === 'analytics' && <AnalyticsSection />}
                    {currentSection === 'settings' && <AdminSettingsSection user={user} />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;