// src/components/admin/sections/AnalyticsSection.jsx
import React, { useState, useEffect } from 'react';
import AnalyticsService from '../../../services/AnalyticsService';

const AnalyticsSection = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [tab, setTab] = useState('overview');
    const [userStats, setUserStats] = useState(null);
    const [jobStats, setJobStats] = useState(null);
    const [skillStats, setSkillStats] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    useEffect(() => {
        if (tab === 'users' && !userStats) {
            fetchUserStats();
        } else if (tab === 'jobs' && !jobStats) {
            fetchJobStats();
        } else if (tab === 'skills' && !skillStats) {
            fetchSkillStats();
        }
    }, [tab]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const analyticsData = await AnalyticsService.getOverviewStats({ timeRange });
            setStats(analyticsData);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data. Please try again later.');
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const data = await AnalyticsService.getUserStats();
            setUserStats(data);
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    const fetchJobStats = async () => {
        try {
            const data = await AnalyticsService.getJobStats();
            setJobStats(data);
        } catch (err) {
            console.error('Error fetching job stats:', err);
        }
    };

    const fetchSkillStats = async () => {
        try {
            const data = await AnalyticsService.getSkillStats();
            setSkillStats(data);
        } catch (err) {
            console.error('Error fetching skill stats:', err);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">Platform insights and statistics</p>

            {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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
            )}

            {/* Time Range Filter */}
            <div className="mt-6 bg-white shadow rounded-lg p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-medium text-gray-900">Analytics Dashboard</h2>
                        <div className="inline-block">
                            <select
                                className="rounded-md border-gray-300 py-2 text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="year">Last 12 Months</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setTab('overview')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    tab === 'overview'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setTab('users')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    tab === 'users'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setTab('jobs')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    tab === 'jobs'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Jobs
                            </button>
                            <button
                                onClick={() => setTab('skills')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    tab === 'skills'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Skills
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && stats && (
                <div className="mt-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stats.users.active}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                                        {stats.users.newUsers} new this week
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stats.jobs.active}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                        {stats.jobs.total} total jobs
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Resume Uploads</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stats.activity.resumeUploads}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                        View user activity
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Skill Matches</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stats.activity.skillMatches}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500">
                                        {stats.activity.applications} applications
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Most Popular Skills</h3>
                                <div className="mt-5 max-w-lg">
                                    <div className="space-y-4">
                                        {stats.skills.mostPopular.map((skill, index) => (
                                            <div key={index} className="flex items-center">
                                                <div className="w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{skill.name}</p>
                                                </div>
                                                <div className="ml-3 flex-shrink-0">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {skill.count} jobs
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Highest Demand Growth</h3>
                                <div className="mt-5 max-w-lg">
                                    <div className="space-y-4">
                                        {stats.skills.highestDemand.map((skill, index) => (
                                            <div key={index} className="flex items-center">
                                                <div className="w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{skill.name}</p>
                                                </div>
                                                <div className="ml-3 flex-shrink-0">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        +{skill.growth}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Stats Tab */}
            {tab === 'users' && (
                <div className="mt-6">
                    {!userStats ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* User Stats Cards */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{userStats.userCount}</dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{userStats.activeUsersCount}</dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Admin Users</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{userStats.adminCount}</dd>
                                    </div>
                                </div>
                            </div>

                            {/* User Activity Timeline */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">User Activity Timeline</h3>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex justify-center">
                                        <p className="text-sm text-gray-500">
                                            Activity visualization not available in this demo version.
                                            In a production environment, this would show a chart of user activity over time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Jobs Stats Tab */}
            {tab === 'jobs' && (
                <div className="mt-6">
                    {!jobStats ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Jobs Stats Cards */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{jobStats.jobCount}</dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{jobStats.activeJobsCount}</dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Top Companies</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{jobStats.topCompanies.length}</dd>
                                    </div>
                                </div>
                            </div>

                            {/* Job Type Distribution */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Job Type Distribution</h3>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <h4 className="text-base font-medium text-gray-900">Job Types</h4>
                                            <div className="mt-4 space-y-4">
                                                {jobStats.jobTypeDistribution.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-900">{item.type}</div>
                                                        <div className="ml-3">
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                                {item.count} jobs
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-medium text-gray-900">Top Companies</h4>
                                            <div className="mt-4 space-y-4">
                                                {jobStats.topCompanies.map((company, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-900">{company.name}</div>
                                                        <div className="ml-3">
                                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                                {company.jobCount} jobs
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Skills Stats Tab */}
            {tab === 'skills' && (
                <div className="mt-6">
                    {!skillStats ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Skills Stats Cards */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Skills Mentioned</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{skillStats.totalSkillsMentioned}</dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Unique Skills</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{skillStats.uniqueSkills}</dd>
                                    </div>
                                </div>
                            </div>

                            {/* Top Skills */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Top Skills</h3>
                                </div>
                                <div className="border-t border-gray-200">
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                            {skillStats.topSkills.map((skill, index) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="font-medium text-gray-900">{skill.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {skill.count} job{skill.count !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skill Categories */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Skill Categories</h3>
                                </div>
                                <div className="border-t border-gray-200">
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="space-y-4">
                                            {skillStats.categoryDistribution.map((category, index) => (
                                                <div key={index} className="flex items-center">
                                                    <div className="w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{category.category}</p>
                                                        <div className="flex items-center">
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(category.count / skillStats.totalSkillsMentioned) * 100}%` }}></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{Math.round((category.count / skillStats.totalSkillsMentioned) * 100)}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3 flex-shrink-0">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {category.count}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalyticsSection;