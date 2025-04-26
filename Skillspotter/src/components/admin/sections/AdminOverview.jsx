// src/components/admin/sections/AdminOverview.jsx
import React, { useState, useEffect } from 'react';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        userStats: { total: 0, active: 0, inactive: 0, newThisMonth: 0, growthRate: '0%' },
        jobStats: { totalJobs: 0, activeJobs: 0, expiredJobs: 0, averageApplications: 0 },
        resumeStats: { total: 0, processedToday: 0, averageSkills: 0 },
        matchStats: { total: 0, averageScore: 0 }
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminOverviewData();
    }, []);

    const fetchAdminOverviewData = async () => {
        try {
            setLoading(true);

            // Hardcoded data instead of API calls
            setTimeout(() => {
                // Set hardcoded stats
                setStats({
                    userStats: {
                        total: 1248,
                        active: 985,
                        inactive: 263,
                        newThisMonth: 87,
                        growthRate: '+12.4%'
                    },
                    jobStats: {
                        totalJobs: 342,
                        activeJobs: 256,
                        expiredJobs: 86,
                        averageApplications: 15
                    },
                    resumeStats: {
                        total: 897,
                        processedToday: 24,
                        averageSkills: 12
                    },
                    matchStats: {
                        total: 4328,
                        averageScore: 72
                    }
                });

                // Set hardcoded recent activity
                setRecentActivity([
                    {
                        id: 'act-001',
                        type: 'job_posted',
                        title: 'Senior React Developer',
                        company: 'TechInnovate Inc.',
                        time: '45 minutes ago'
                    },
                    {
                        id: 'act-002',
                        type: 'user_registered',
                        name: 'Emily Johnson',
                        email: 'emily.johnson@example.com',
                        time: '2 hours ago'
                    },
                    {
                        id: 'act-003',
                        type: 'resume_processed',
                        name: 'Michael Chen',
                        skills: 14,
                        time: '3 hours ago'
                    },
                    {
                        id: 'act-004',
                        type: 'match_created',
                        user: 'Sarah Williams',
                        job: 'UX Designer',
                        match: '94%',
                        time: '5 hours ago'
                    },
                    {
                        id: 'act-005',
                        type: 'job_posted',
                        title: 'DevOps Engineer',
                        company: 'Cloud Solutions Ltd',
                        time: 'Yesterday at 4:35 PM'
                    },
                    {
                        id: 'act-006',
                        type: 'user_registered',
                        name: 'Alex Rodriguez',
                        email: 'alex.r@example.com',
                        time: 'Yesterday at 1:22 PM'
                    },
                    {
                        id: 'act-007',
                        type: 'match_created',
                        user: 'David Kim',
                        job: 'Full Stack Developer',
                        match: '89%',
                        time: 'Yesterday at 11:45 AM'
                    },
                    {
                        id: 'act-008',
                        type: 'resume_processed',
                        name: 'Jennifer Lopez',
                        skills: 12,
                        time: 'Yesterday at 10:17 AM'
                    }
                ]);

                setLoading(false);
            }, 1200); // Simulate loading delay
        } catch (err) {
            console.error('Error fetching admin overview data:', err);
            setError('Failed to load admin dashboard data');
            setLoading(false);
        }
    };

    // Helper function to format numbers with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Welcome to the SkillSpotter admin panel</p>
                </div>
                <div>
                    <span className="inline-flex rounded-md shadow-sm">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/admin/jobs/new'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Job Posting
                        </button>
                    </span>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* User Stats */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                            <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                                {formatNumber(stats.userStats.total)}
                            </div>
                            <div className={`${
                                stats.userStats.growthRate.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            } inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0`}>
                                {stats.userStats.growthRate.startsWith('+') ? (
                                    <svg className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span className="sr-only">{stats.userStats.growthRate.startsWith('+') ? 'Increased' : 'Decreased'} by</span>
                                {stats.userStats.growthRate}
                            </div>
                        </dd>
                    </div>
                </div>

                {/* Jobs Stats */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Job Listings</dt>
                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                            <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                                {formatNumber(stats.jobStats.activeJobs)}
                            </div>
                            <div className="bg-green-100 text-green-800 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0">
                                <svg className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Increased by</span>
                                +{Math.round((stats.jobStats.activeJobs / stats.jobStats.totalJobs) * 100)}%
                            </div>
                        </dd>
                    </div>
                </div>

                {/* Resumes Stats */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Resumes Processed</dt>
                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                            <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                                {formatNumber(stats.resumeStats.total)}
                            </div>
                            <div className="bg-green-100 text-green-800 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0">
                                <svg className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Increased by</span>
                                +{stats.resumeStats.processedToday} today
                            </div>
                        </dd>
                    </div>
                </div>

                {/* Job Matches Stats */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Job Matches Created</dt>
                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                            <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                                {formatNumber(stats.matchStats.total)}
                            </div>
                            <div className="bg-green-100 text-green-800 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0">
                                <svg className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Average score</span>
                                {stats.matchStats.averageScore}% avg
                            </div>
                        </dd>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Post New Job
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            Create a new job listing
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <a href="/admin/jobs/new" className="font-medium text-purple-600 hover:text-purple-500">
                                    Create new job
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Manage Users
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            View and manage user accounts
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <a href="/admin/users" className="font-medium text-purple-600 hover:text-purple-500">
                                    View users
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            View Analytics
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            Check performance metrics
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <a href="/admin/analytics" className="font-medium text-purple-600 hover:text-purple-500">
                                    See analytics
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Activity</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <tr key={activity.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {activity.type === 'job_posted' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                                                New Job Posted
                                            </span>
                                        )}
                                        {activity.type === 'user_registered' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                                New User
                                            </span>
                                        )}
                                        {activity.type === 'resume_processed' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                                                Resume Processed
                                            </span>
                                        )}
                                        {activity.type === 'match_created' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                                                Match Created
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {activity.type === 'job_posted' && (
                                            <div>
                                                <div className="font-medium text-gray-900">{activity.title}</div>
                                                <div>{activity.company}</div>
                                            </div>
                                        )}
                                        {activity.type === 'user_registered' && (
                                            <div>
                                                <div className="font-medium text-gray-900">{activity.name}</div>
                                                <div>{activity.email}</div>
                                            </div>
                                        )}
                                        {activity.type === 'resume_processed' && (
                                            <div>
                                                <div className="font-medium text-gray-900">{activity.name}</div>
                                                <div>{activity.skills} skills identified</div>
                                            </div>
                                        )}
                                        {activity.type === 'match_created' && (
                                            <div>
                                                <div className="font-medium text-gray-900">{activity.user}</div>
                                                <div>{activity.job} • {activity.match} match</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{activity.time}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <a href="#" className="text-purple-600 hover:text-purple-900">
                                            View<span className="sr-only">, {activity.id}</span>
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-4 text-center text-sm text-gray-500">
                                    No recent activity found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;