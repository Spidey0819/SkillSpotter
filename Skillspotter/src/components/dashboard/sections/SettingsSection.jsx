// src/components/dashboard/sections/SettingsSection.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const SettingsSection = ({ user }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        jobMatchNotifications: true,
        resumeAnalysisNotifications: true,
        weeklyDigestNotifications: false
    });
    const [userSettings, setUserSettings] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user settings when component mounts
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user settings from backend
            const response = await api.get('/user/settings');

            // Update state with fetched settings
            const settings = response.data;
            setUserSettings(settings);

            // Update form data with fetched settings
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                jobMatchNotifications: settings.notifications?.jobMatch ?? true,
                resumeAnalysisNotifications: settings.notifications?.resumeAnalysis ?? true,
                weeklyDigestNotifications: settings.notifications?.weeklyDigest ?? false
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching user settings:', err);
            setError('Failed to load your settings. Please try again.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);

        try {
            // Prepare data for the API call
            const settingsData = {
                name: formData.name,
                notifications: {
                    jobMatch: formData.jobMatchNotifications,
                    resumeAnalysis: formData.resumeAnalysisNotifications,
                    weeklyDigest: formData.weeklyDigestNotifications
                }
            };

            // Update user settings via API
            await api.put('/user/settings', settingsData);

            setSaveSuccess(true);
            setIsSaving(false);

            // Update local storage with new name if changed
            if (formData.name !== user.name) {
                const updatedUser = { ...user, name: formData.name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
            setIsSaving(false);
        }
    };

    // Handle password change
    const handlePasswordChange = () => {
        // Redirect to password change form or open modal
        window.location.href = '/change-password';
    };

    // Handle data download
    const handleDataDownload = async () => {
        try {
            const response = await api.get('/user/data/export', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my-skillspotter-data.json');
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Error downloading data:', err);
            alert('Failed to download your data. Please try again.');
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await api.delete('/user/account');
                // Clear local storage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } catch (err) {
                console.error('Error deleting account:', err);
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your account preferences</p>

            {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {saveSuccess && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                Your settings have been saved successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Profile section */}
                <div className="mt-6 shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                            <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>
                        </div>

                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    readOnly
                                    className="mt-1 bg-gray-50 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact support for assistance.</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>

                {/* Notifications section */}
                <div className="mt-6 shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage your notification preferences.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="jobMatchNotifications"
                                        name="jobMatchNotifications"
                                        type="checkbox"
                                        checked={formData.jobMatchNotifications}
                                        onChange={handleChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="jobMatchNotifications" className="font-medium text-gray-700">Job matches</label>
                                    <p className="text-gray-500">Get notified when new jobs match your profile.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="resumeAnalysisNotifications"
                                        name="resumeAnalysisNotifications"
                                        type="checkbox"
                                        checked={formData.resumeAnalysisNotifications}
                                        onChange={handleChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="resumeAnalysisNotifications" className="font-medium text-gray-700">Resume analysis</label>
                                    <p className="text-gray-500">Get notified when your resume is analyzed.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="weeklyDigestNotifications"
                                        name="weeklyDigestNotifications"
                                        type="checkbox"
                                        checked={formData.weeklyDigestNotifications}
                                        onChange={handleChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="weeklyDigestNotifications" className="font-medium text-gray-700">Weekly digest</label>
                                    <p className="text-gray-500">Receive a weekly summary of job market trends and opportunities.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`${
                                isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {isSaving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Privacy & Security section */}
            <div className="mt-6 shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Privacy & Security</h3>
                        <p className="mt-1 text-sm text-gray-500">Manage your privacy and security settings.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Password</h4>
                            <button
                                type="button"
                                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={handlePasswordChange}
                            >
                                Change Password
                            </button>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                            <button
                                type="button"
                                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Enable 2FA
                            </button>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Data Privacy</h4>
                            <button
                                type="button"
                                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={handleDataDownload}
                            >
                                Download My Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 sm:p-6">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-red-700">Danger Zone</h3>
                        <p className="mt-1 text-sm text-gray-500">Be careful with these actions.</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={handleDeleteAccount}
                            >
                                Delete Account
                            </button>
                            <p className="mt-1 text-xs text-gray-500">
                                This action cannot be undone. All of your data will be permanently removed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsSection;