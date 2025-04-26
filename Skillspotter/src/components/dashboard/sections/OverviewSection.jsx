// src/components/dashboard/sections/OverviewSection.jsx
import React, { useState, useEffect } from 'react';

const OverviewSection = ({ user, setCurrentSection }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        resumeStatus: null,
        jobMatches: 0,
        skillGaps: 0,
        recentActivity: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Instead of API calls, use hardcoded data
            setTimeout(() => {
                setDashboardData({
                    resumeStatus: true, // Resume is uploaded
                    jobMatches: 24, // 24 job matches
                    skillGaps: 5, // 5 skill gaps identified
                    recentActivity: [
                        {
                            id: 1,
                            title: "Resume Analyzed",
                            description: "Your resume was successfully analyzed for skills",
                            status: "Completed",
                            timestamp: "2025-04-18T09:30:00Z"
                        },
                        {
                            id: 2,
                            title: "New Job Match",
                            description: "Your profile matched with Senior Frontend Developer position",
                            status: "New",
                            timestamp: "2025-04-17T15:45:00Z"
                        },
                        {
                            id: 3,
                            title: "Skill Gap Identified",
                            description: "Consider adding React Native to your skillset",
                            status: "Alert",
                            timestamp: "2025-04-16T11:20:00Z"
                        },
                        {
                            id: 4,
                            title: "Profile Updated",
                            description: "Your profile information was updated",
                            status: "Completed",
                            timestamp: "2025-04-14T13:10:00Z"
                        },
                        {
                            id: 5,
                            title: "New Job Match",
                            description: "Your profile matched with JavaScript Developer position",
                            status: "New",
                            timestamp: "2025-04-10T16:22:00Z"
                        }
                    ]
                });
                setIsLoading(false);
            }, 1000); // Simulate loading delay of 1 second
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
            setIsLoading(false);
        }
    };

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.name || 'User'}!</p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Resume Status Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Resume Status
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {dashboardData.resumeStatus ? 'Uploaded' : 'Not Uploaded'}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <button
                                onClick={() => setCurrentSection('resume')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                {dashboardData.resumeStatus ? 'View Resume' : 'Upload Resume'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Job Matches Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Job Matches
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {dashboardData.jobMatches}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <button
                                onClick={() => setCurrentSection('jobs')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                View Job Matches
                            </button>
                        </div>
                    </div>
                </div>

                {/* Skill Gaps Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Skill Gaps
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {dashboardData.skillGaps} identified
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <button
                                onClick={() => setCurrentSection('skills')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                View Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>

                {dashboardData.recentActivity.length === 0 ? (
                    <div className="mt-4 bg-white rounded-md shadow p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload your resume to start seeing activity here
                        </p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentSection('resume')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Upload Resume
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {dashboardData.recentActivity.map((activity, index) => (
                                <li key={index}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {activity.title}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {activity.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p>
                                                    {formatDate(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewSection;