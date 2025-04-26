// src/components/admin/sections/AdminSettingsSection.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';

const AdminSettingsSection = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for general settings
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'SkillSpotter',
        siteDescription: 'AI-powered resume analyzer and job matching platform',
        contactEmail: 'admin@skillspotter.com',
        supportEmail: 'support@skillspotter.com',
        maxResumeSize: 10,
        maxJobsPerEmployer: 25,
        requireEmailVerification: true,
        enableJobAlerts: true,
        alertFrequency: 'daily'
    });

    // State for API settings
    const [apiSettings, setApiSettings] = useState({
        apiKey: '',
        secretKey: '',
        environment: 'production',
        maxApiCalls: 1000,
        enableCache: true,
        cacheExpiration: 30,
        allowThirdPartyAccess: false,
        rateLimitPerMinute: 60
    });

    // State for notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        sendWelcomeEmail: true,
        sendJobMatchAlerts: true,
        sendResumeProcessedNotification: true,
        sendAdminNewUserAlert: true,
        sendAdminNewJobAlert: false,
        enableInAppNotifications: true,
        adminEmailOnError: true,
        dailyReportEmail: true
    });

    // State for saving status
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        // Fetch settings when component mounts
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get settings from API
            const response = await adminAPI.getSettings();
            const settings = response.data;

            // Update state with fetched settings
            if (settings.general) {
                setGeneralSettings(settings.general);
            }

            if (settings.api) {
                setApiSettings({
                    ...settings.api,
                    secretKey: '••••••••••••••••••••••••••' // Mask secret key
                });
            }

            if (settings.notifications) {
                setNotificationSettings(settings.notifications);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError('Failed to load settings. Please try again.');
            setLoading(false);
        }
    };

    // Handle changes for general settings
    const handleGeneralChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGeneralSettings({
            ...generalSettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle changes for API settings
    const handleApiChange = (e) => {
        const { name, value, type, checked } = e.target;
        setApiSettings({
            ...apiSettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle changes for notification settings
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationSettings({
            ...notificationSettings,
            [name]: checked
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);

        try {
            // Prepare data for API call
            const settingsData = {
                general: generalSettings,
                api: {
                    ...apiSettings,
                    // Don't send the masked secret key
                    secretKey: apiSettings.secretKey === '••••••••••••••••••••••••••' ? undefined : apiSettings.secretKey
                },
                notifications: notificationSettings
            };

            // Update settings via API
            await adminAPI.updateSettings(settingsData);

            setSaveSuccess(true);

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Generate new API keys
    const handleGenerateNewKeys = async () => {
        try {
            setIsSaving(true);

            // Call API to generate new keys
            const response = await adminAPI.generateApiKeys();

            // Update state with new keys
            setApiSettings({
                ...apiSettings,
                apiKey: response.data.apiKey,
                secretKey: response.data.secretKey
            });

            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error generating API keys:', err);
            setError('Failed to generate new API keys. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
            <p className="mt-1 text-sm text-gray-600">Configure system settings for the SkillSpotter platform</p>

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
                                Settings saved successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* General Settings */}
                <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Basic configuration for the platform.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                                        Site Name
                                    </label>
                                    <input
                                        type="text"
                                        name="siteName"
                                        id="siteName"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={generalSettings.siteName}
                                        onChange={handleGeneralChange}
                                    />
                                </div>

                                <div className="col-span-6">
                                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                                        Site Description
                                    </label>
                                    <input
                                        type="text"
                                        name="siteDescription"
                                        id="siteDescription"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={generalSettings.siteDescription}
                                        onChange={handleGeneralChange}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        id="contactEmail"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={generalSettings.contactEmail}
                                        onChange={handleGeneralChange}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                                        Support Email
                                    </label>
                                    <input
                                        type="email"
                                        name="supportEmail"
                                        id="supportEmail"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={generalSettings.supportEmail}
                                        onChange={handleGeneralChange}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="maxResumeSize" className="block text-sm font-medium text-gray-700">
                                        Max Resume Size (MB)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxResumeSize"
                                        id="maxResumeSize"
                                        min="1"
                                        max="50"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={generalSettings.maxResumeSize}
                                        onChange={handleGeneralChange}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="maxJobsPerEmployer" className="block text-sm font-medium text-gray-700">
                                        Max Jobs Per Employer
                                    </label>
                                    <input
                                        type="number"
                                        name="maxJobsPerEmployer"
                                        id="maxJobsPerEmployer"
                                        min="1"
                                        max="100"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={generalSettings.maxJobsPerEmployer}
                                        onChange={handleGeneralChange}
                                    />
                                </div>

                                <div className="col-span-6">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="requireEmailVerification"
                                                name="requireEmailVerification"
                                                type="checkbox"
                                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                checked={generalSettings.requireEmailVerification}
                                                onChange={handleGeneralChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="requireEmailVerification" className="font-medium text-gray-700">
                                                Require Email Verification
                                            </label>
                                            <p className="text-gray-500">Users must verify their email address before using the platform.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-6">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="enableJobAlerts"
                                                name="enableJobAlerts"
                                                type="checkbox"
                                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                checked={generalSettings.enableJobAlerts}
                                                onChange={handleGeneralChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="enableJobAlerts" className="font-medium text-gray-700">
                                                Enable Job Alerts
                                            </label>
                                            <p className="text-gray-500">Send automated job match notifications to users.</p>
                                        </div>
                                    </div>
                                </div>

                                {generalSettings.enableJobAlerts && (
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="alertFrequency" className="block text-sm font-medium text-gray-700">
                                            Alert Frequency
                                        </label>
                                        <select
                                            id="alertFrequency"
                                            name="alertFrequency"
                                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                            value={generalSettings.alertFrequency}
                                            onChange={handleGeneralChange}
                                        >
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Settings */}
                <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">API Settings</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Configure API access and settings.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-4">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                                            API Key
                                        </label>
                                        <button
                                            type="button"
                                            className="text-sm text-purple-600 hover:text-purple-500"
                                            onClick={handleGenerateNewKeys}
                                        >
                                            Generate New Keys
                                        </button>
                                    </div>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            name="apiKey"
                                            id="apiKey"
                                            className="focus:ring-purple-500 focus:border-purple-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                            value={apiSettings.apiKey}
                                            readOnly
                                        />
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            onClick={() => {
                                                navigator.clipboard.writeText(apiSettings.apiKey);
                                                alert('API Key copied to clipboard!');
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="col-span-6 sm:col-span-4">
                                    <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700">
                                        Secret Key
                                    </label>
                                    <input
                                        type="text"
                                        name="secretKey"
                                        id="secretKey"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={apiSettings.secretKey}
                                        readOnly
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
                                        Environment
                                    </label>
                                    <select
                                        id="environment"
                                        name="environment"
                                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                        value={apiSettings.environment}
                                        onChange={handleApiChange}
                                    >
                                        <option value="development">Development</option>
                                        <option value="staging">Staging</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="maxApiCalls" className="block text-sm font-medium text-gray-700">
                                        Max API Calls Per Day
                                    </label>
                                    <input
                                        type="number"
                                        name="maxApiCalls"
                                        id="maxApiCalls"
                                        min="100"
                                        max="10000"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={apiSettings.maxApiCalls}
                                        onChange={handleApiChange}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="rateLimitPerMinute" className="block text-sm font-medium text-gray-700">
                                        Rate Limit (Requests Per Minute)
                                    </label>
                                    <input
                                        type="number"
                                        name="rateLimitPerMinute"
                                        id="rateLimitPerMinute"
                                        min="10"
                                        max="1000"
                                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        value={apiSettings.rateLimitPerMinute}
                                        onChange={handleApiChange}
                                    />
                                </div>

                                <div className="col-span-6">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="enableCache"
                                                name="enableCache"
                                                type="checkbox"
                                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                checked={apiSettings.enableCache}
                                                onChange={handleApiChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="enableCache" className="font-medium text-gray-700">
                                                Enable API Response Caching
                                            </label>
                                            <p className="text-gray-500">Cache API responses to improve performance.</p>
                                        </div>
                                    </div>
                                </div>

                                {apiSettings.enableCache && (
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="cacheExpiration" className="block text-sm font-medium text-gray-700">
                                            Cache Expiration (Minutes)
                                        </label>
                                        <input
                                            type="number"
                                            name="cacheExpiration"
                                            id="cacheExpiration"
                                            min="1"
                                            max="1440"
                                            className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            value={apiSettings.cacheExpiration}
                                            onChange={handleApiChange}
                                        />
                                    </div>
                                )}

                                <div className="col-span-6">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="allowThirdPartyAccess"
                                                name="allowThirdPartyAccess"
                                                type="checkbox"
                                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                checked={apiSettings.allowThirdPartyAccess}
                                                onChange={handleApiChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="allowThirdPartyAccess" className="font-medium text-gray-700">
                                                Allow Third-Party API Access
                                            </label>
                                            <p className="text-gray-500">Enable API access for third-party applications and partners.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Configure system notifications and alerts.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sendWelcomeEmail"
                                            name="sendWelcomeEmail"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.sendWelcomeEmail}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sendWelcomeEmail" className="font-medium text-gray-700">
                                            Send Welcome Email
                                        </label>
                                        <p className="text-gray-500">Send a welcome email to new users when they register.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sendJobMatchAlerts"
                                            name="sendJobMatchAlerts"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.sendJobMatchAlerts}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sendJobMatchAlerts" className="font-medium text-gray-700">
                                            Send Job Match Alerts
                                        </label>
                                        <p className="text-gray-500">Send email notifications when new job matches are found.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sendResumeProcessedNotification"
                                            name="sendResumeProcessedNotification"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.sendResumeProcessedNotification}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sendResumeProcessedNotification" className="font-medium text-gray-700">
                                            Send Resume Processed Notification
                                        </label>
                                        <p className="text-gray-500">Notify users when their resume has been processed.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="enableInAppNotifications"
                                            name="enableInAppNotifications"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.enableInAppNotifications}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="enableInAppNotifications" className="font-medium text-gray-700">
                                            Enable In-App Notifications
                                        </label>
                                        <p className="text-gray-500">Show notifications within the application interface.</p>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-900">Admin Notifications</h4>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sendAdminNewUserAlert"
                                            name="sendAdminNewUserAlert"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.sendAdminNewUserAlert}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sendAdminNewUserAlert" className="font-medium text-gray-700">
                                            New User Alerts
                                        </label>
                                        <p className="text-gray-500">Notify admins when new users register.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sendAdminNewJobAlert"
                                            name="sendAdminNewJobAlert"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.sendAdminNewJobAlert}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sendAdminNewJobAlert" className="font-medium text-gray-700">
                                            New Job Alerts
                                        </label>
                                        <p className="text-gray-500">Notify admins when new jobs are posted.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="adminEmailOnError"
                                            name="adminEmailOnError"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.adminEmailOnError}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="adminEmailOnError" className="font-medium text-gray-700">
                                            System Error Alerts
                                        </label>
                                        <p className="text-gray-500">Email administrators when system errors occur.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="dailyReportEmail"
                                            name="dailyReportEmail"
                                            type="checkbox"
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                            checked={notificationSettings.dailyReportEmail}
                                            onChange={handleNotificationChange}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="dailyReportEmail" className="font-medium text-gray-700">
                                            Daily Summary Report
                                        </label>
                                        <p className="text-gray-500">Send a daily summary report to administrators.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form actions */}
                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        onClick={() => fetchSettings()} // Reset to fetched values
                    >
                        Reset to Defaults
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                            isSaving ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsSection;