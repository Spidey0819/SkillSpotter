// src/components/admin/sections/UserManagementSection.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';

const UserManagementSection = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 0
    });

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter, searchTerm, pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const queryParams = {
                page: pagination.page,
                limit: pagination.limit,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchTerm || undefined
            };

            // Remove undefined values
            Object.keys(queryParams).forEach(key =>
                queryParams[key] === undefined && delete queryParams[key]
            );

            // Fetch users with filters
            const response = await adminAPI.getUsers(queryParams);

            // Update state with fetched data
            setUsers(response.data.users || []);
            setPagination({
                page: response.data.page || 1,
                limit: response.data.limit || 10,
                totalPages: response.data.totalPages || 1,
                totalResults: response.data.totalResults || 0
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load user data. Please try again.');
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);

        // Reset to first page when search term changes
        setPagination({
            ...pagination,
            page: 1
        });
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Open user details modal
    const openUserModal = async (userId) => {
        try {
            setLoading(true);

            // Fetch user details
            const response = await adminAPI.getUserDetails(userId);
            setSelectedUser(response.data);
            setIsUserModalOpen(true);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching user details:', err);
            setError('Failed to retrieve user details. Please try again.');
            setLoading(false);
        }
    };

    // Close user details modal
    const closeUserModal = () => {
        setSelectedUser(null);
        setIsUserModalOpen(false);
    };

    // Handle page change
    const goToPage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination({
                ...pagination,
                page: newPage
            });
        }
    };

    // Handle update user
    const handleUpdateUser = async (userId, userData) => {
        try {
            setLoading(true);

            // Update user data
            await adminAPI.updateUser(userId, userData);

            // Close modal and refresh user list
            closeUserModal();
            await fetchUsers();

            setLoading(false);
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Failed to update user data. Please try again.');
            setLoading(false);
        }
    };

    // Handle delete user
    const handleDeleteUser = async (userId) => {
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                setLoading(true);

                // Delete user
                await adminAPI.deleteUser(userId);

                // Close modal and refresh user list
                closeUserModal();
                await fetchUsers();

                setLoading(false);
            } catch (err) {
                console.error('Error deleting user:', err);
                setError('Failed to delete user. Please try again.');
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage user accounts</p>

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

            {/* Filters and search */}
            <div className="mt-6 bg-white shadow rounded-lg p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <select
                            className="rounded-md border-gray-300 py-2 text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPagination({...pagination, page: 1});
                            }}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select
                            className="rounded-md border-gray-300 py-2 text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination({...pagination, page: 1});
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <div className="relative max-w-xs">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                value={searchTerm}
                                onChange={handleSearchChange}
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
                        Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{pagination.totalResults}</span> users
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/admin/users/new'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New User
                        </button>
                    </div>
                </div>
            </div>

            {/* User table */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                                {loading && users.length === 0 ? (
                                    <div className="flex justify-center items-center h-48">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Try adjusting your search or filter criteria.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registered
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Activity
                                            </th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.userId}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                                <span className="text-lg font-medium text-purple-800">
                                                                    {user.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.role === 'admin' ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span>User</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>
                                                        <div>Last active: {formatDate(user.lastActive)}</div>
                                                        <div className="text-xs">
                                                            {user.resumeCount || 0} {user.resumeCount === 1 ? 'resume' : 'resumes'},
                                                            {' '}{user.jobMatches || 0} {user.jobMatches === 1 ? 'match' : 'matches'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openUserModal(user.userId)}
                                                        className="text-purple-600 hover:text-purple-900 mr-4"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => window.location.href = `/admin/users/${user.userId}/edit`}
                                                        className="text-purple-600 hover:text-purple-900"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalResults)}</span> of{' '}
                                    <span className="font-medium">{pagination.totalResults}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => goToPage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                            pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        // Show pages centered around current page
                                        let startPage = Math.max(1, pagination.page - 2);
                                        let endPage = Math.min(pagination.totalPages, startPage + 4);

                                        // Adjust if we're near the end
                                        if (endPage - startPage < 4) {
                                            startPage = Math.max(1, endPage - 4);
                                        }

                                        const pageNumber = startPage + i;
                                        if (pageNumber <= endPage) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => goToPage(pageNumber)}
                                                    aria-current={pagination.page === pageNumber ? 'page' : undefined}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        pagination.page === pageNumber
                                                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => goToPage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                            pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </nav>
                )}
            </div>

            {/* User details modal */}
            {isUserModalOpen && selectedUser && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <span className="text-lg font-medium text-purple-800">
                                            {selectedUser.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            User Details
                                        </h3>
                                        <div className="mt-4">
                                            <div className="flex flex-col space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Role</p>
                                                    <p className="text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                                    <p className="text-sm text-gray-900 capitalize">{selectedUser.status}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Registered</p>
                                                    <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Last Active</p>
                                                    <p className="text-sm text-gray-900">{formatDate(selectedUser.lastActive)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Activity</p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedUser.resumeCount || 0} {selectedUser.resumeCount === 1 ? 'resume' : 'resumes'},
                                                        {' '}{selectedUser.jobMatches || 0} {selectedUser.jobMatches === 1 ? 'match' : 'matches'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={closeUserModal}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => window.location.href = `/admin/users/${selectedUser.userId}/edit`}
                                >
                                    Edit User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementSection;