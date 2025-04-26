// src/components/dashboard/sections/JobsSection.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import JobsService from '../../../services/JobsService';
import UserService from '../../../services/UserService';

const JobsSection = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [matchFilter, setMatchFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalResults: 0
    });
    const [hasResume, setHasResume] = useState(false);

    useEffect(() => {
        fetchJobMatches();
        checkResumeStatus();
    }, [searchTerm, matchFilter, pagination.page]);

    const checkResumeStatus = async () => {
        try {
            const resumeData = await UserService.getResumeData(user?.userId);
            setHasResume(!!resumeData);
        } catch (err) {
            console.error('Error checking resume status:', err);
            setHasResume(false);
        }
    };

    const fetchJobMatches = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const filters = {
                page: pagination.page,
                limit: 10,
                search: searchTerm || undefined,
                minMatch: matchFilter === 'all' ? 0 : parseInt(matchFilter, 10)
            };

            // Get job matches for the current user
            const result = await JobsService.getJobMatches(user?.userId, filters);

            if (result) {
                setJobs(result.jobs || []);
                setPagination({
                    page: result.page || 1,
                    totalPages: result.totalPages || 1,
                    totalResults: result.totalResults || 0
                });
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching job matches:', err);
            setError('Failed to load job listings. Please try again later.');
            setLoading(false);

            // Clear jobs to show empty state
            setJobs([]);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get match percentage styling
    const getMatchStyle = (percentage) => {
        if (percentage >= 80) {
            return 'bg-green-100 text-green-800';
        } else if (percentage >= 60) {
            return 'bg-blue-100 text-blue-800';
        } else if (percentage >= 40) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && jobs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Job Matches</h1>
            <p className="mt-1 text-sm text-gray-600">Jobs that match your skills and experience</p>

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

            <div className="mt-6 bg-white shadow rounded-lg p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <select
                            className="rounded-md border-gray-300 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={matchFilter}
                            onChange={(e) => {
                                setMatchFilter(e.target.value);
                                setPagination({...pagination, page: 1});
                            }}
                        >
                            <option value="all">All Matches</option>
                            <option value="80">80%+ Match</option>
                            <option value="60">60%+ Match</option>
                            <option value="40">40%+ Match</option>
                        </select>
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <div className="relative max-w-xs">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPagination({...pagination, page: 1});
                                }}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!hasResume && jobs.length === 0 && !loading && (
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No resume uploaded</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Upload your resume to start matching with jobs based on your skills and experience.
                    </p>
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/dashboard/resume'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Upload Resume
                        </button>
                    </div>
                </div>
            )}

            {hasResume && jobs.length === 0 && !loading && (
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                    <div className="rounded-full bg-gray-100 p-6 mx-auto w-24 h-24 flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No job matches found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Try adjusting your filters or upload a more detailed resume to get better matches.
                    </p>
                </div>
            )}

            {jobs.length > 0 && (
                <div className="mt-6 space-y-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">{job.title}</h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {job.company} • {job.location} • {job.type}
                                        {job.remote && ' • Remote'}
                                    </p>
                                </div>
                                <div className="mt-3 sm:mt-0">
                                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getMatchStyle(job.matchPercentage)}`}>
                                        {job.matchPercentage}% Match
                                    </span>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                <dl className="sm:divide-y sm:divide-gray-200">
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Posted</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {formatDate(job.postedDate)}
                                        </dd>
                                    </div>

                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Matching Skills</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            <div className="flex flex-wrap gap-2">
                                                {job.matchingSkills && job.matchingSkills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(!job.matchingSkills || job.matchingSkills.length === 0) && (
                                                    <span className="text-sm text-gray-500">No specific skills matched</span>
                                                )}
                                            </div>
                                        </dd>
                                    </div>

                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {job.description}
                                        </dd>
                                    </div>

                                    <div className="py-4 sm:py-5 sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => window.open(`/job/${job.id}`, '_blank')}
                                        >
                                            View Full Details
                                        </button>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(pagination.page * 10, pagination.totalResults)}</span> of{' '}
                                <span className="font-medium">{pagination.totalResults}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => pagination.page > 1 && setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page <= 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        pagination.page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Page numbers - show up to 5 pages */}
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    // Calculate which page numbers to show
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                pagination.page === pageNum
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => pagination.page < pagination.totalPages && setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        pagination.page >= pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default JobsSection;