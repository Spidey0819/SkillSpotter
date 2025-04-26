// src/components/admin/sections/AdminJobsSection.jsx
import React, { useState, useEffect } from 'react';
import JobsService from '../../../services/JobsService';

const AdminJobsSection = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalResults: 0
    });

    useEffect(() => {
        fetchJobs();
    }, [searchTerm, statusFilter, pagination.page]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const queryParams = {
                page: pagination.page,
                limit: 10,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchTerm || undefined
            };

            // Fetch jobs from admin service
            const response = await JobsService.getAdminJobs(queryParams);

            // Check if we got a proper response
            if (!response) {
                throw new Error('Invalid data format received from server');
            }

            setJobs(response.jobs || []);
            setPagination({
                page: response.page || 1,
                totalPages: response.totalPages || 1,
                totalResults: response.totalResults || 0
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching admin jobs:', err);
            setError('Failed to load job data. Please try again.');
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Delete a job
    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                // Try to delete from API/service
                // For demo purposes, just remove from local storage
                const localJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
                const updatedJobs = localJobs.filter(job => job.id !== jobId);
                localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));

                // Refresh the job list
                fetchJobs();
            } catch (err) {
                console.error('Error deleting job:', err);
                alert('Failed to delete job. Please try again.');
            }
        }
    };

    if (loading && jobs.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Job Management</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage job listings</p>

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

            {/* Filters and search */}
            <div className="mt-6 bg-white shadow rounded-lg p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <select
                            className="rounded-md border-gray-300 py-2 text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination({...pagination, page: 1});
                            }}
                        >
                            <option value="all">All Jobs</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <div className="relative max-w-xs">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                <div className="mt-4 sm:flex sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{jobs.length}</span> of <span className="font-medium">{pagination.totalResults}</span> jobs
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <a
                            href="/admin/jobs/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Job
                        </a>
                    </div>
                </div>
            </div>

            {/* Jobs table */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="overflow-x-auto">
                    {loading && jobs.length > 0 ? (
                        <div className="flex justify-center items-center h-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filter criteria, or create a new job.
                            </p>
                            <div className="mt-6">
                                <a
                                    href="/admin/jobs/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create New Job
                                </a>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Job Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Skills
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posted
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {jobs.map((job) => (
                                <tr key={job.id || job.jobId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                                <div className="text-sm text-gray-500">{job.company} • {job.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(job.skills || job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                    {skill}
                                                </span>
                                            ))}
                                            {(job.skills || job.requiredSkills || []).length > 3 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    +{(job.skills || job.requiredSkills || []).length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(job.postedDate || job.postTimestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a
                                            href={`/admin/jobs/edit/${job.id || job.jobId}`}
                                            className="text-purple-600 hover:text-purple-900 mr-4"
                                        >
                                            Edit
                                        </a>
                                        <button
                                            onClick={() => handleDeleteJob(job.id || job.jobId)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                    {/* Previous page button */}
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

                                    {/* Page numbers */}
                                    {[...Array(pagination.totalPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPagination({ ...pagination, page: idx + 1 })}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                pagination.page === idx + 1
                                                    ? 'z-10 bg-indigo-50 border-purple-500 text-purple-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}

                                    {/* Next page button */}
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
        </div>
    );
};

export default AdminJobsSection;