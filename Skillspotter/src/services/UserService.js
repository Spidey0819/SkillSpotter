// src/services/UserService.js
import api from './api';

class UserService {
    /**
     * Get users for admin panel
     * @param {Object} filters - Filter parameters
     * @returns {Promise} Promise resolving to user data
     */
    static async getUsers(filters = {}) {
        try {
            // First try to get users from the API
            const response = await api.get('/admin/users', { params: filters });
            return response.data;
        } catch (error) {
            console.warn('Error fetching users from API:', error);

            // Fall back to localStorage for users created through the registration process
            const localUsers = this.getLocalUsers();

            // Apply filters if they exist
            let filteredUsers = [...localUsers];

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredUsers = filteredUsers.filter(user =>
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
                );
            }

            if (filters.role && filters.role !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.role === filters.role);
            }

            if (filters.status && filters.status !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.status === filters.status);
            }

            // Sort users by creation date (newest first)
            filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Paginate results
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            return {
                users: paginatedUsers,
                page: page,
                limit: limit,
                totalPages: Math.ceil(filteredUsers.length / limit),
                totalResults: filteredUsers.length
            };
        }
    }

    /**
     * Get users from localStorage
     */
    static getLocalUsers() {
        try {
            const localUsers = localStorage.getItem('users');
            if (localUsers) {
                return JSON.parse(localUsers);
            }

            // Check for current user
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                const mockUsers = [user];
                localStorage.setItem('users', JSON.stringify(mockUsers));
                return mockUsers;
            }

            // If no users in localStorage, return sample users in development
            if (process.env.NODE_ENV !== 'production') {
                const sampleUsers = this.getSampleUsers();
                localStorage.setItem('users', JSON.stringify(sampleUsers));
                return sampleUsers;
            }

            return [];
        } catch (error) {
            console.error('Error getting local users:', error);
            return [];
        }
    }

    /**
     * Add a user to localStorage
     */
    static addLocalUser(user) {
        try {
            const users = this.getLocalUsers();
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            return user;
        } catch (error) {
            console.error('Error adding local user:', error);
            return null;
        }
    }

    /**
     * Get sample users for development/testing
     */
    static getSampleUsers() {
        return [
            {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                status: 'active',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
            },
            {
                id: 'user2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'user',
                status: 'active',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
            },
            {
                id: 'admin1',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                status: 'active',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
            }
        ];
    }

    /**
     * Get current user profile data
     */
    static async getCurrentUser() {
        try {
            // Try to get from API first
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            console.warn('Error fetching current user from API:', error);

            // Fall back to localStorage
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    return JSON.parse(userStr);
                }
                return null;
            } catch (localError) {
                console.error('Error getting user from localStorage:', localError);
                return null;
            }
        }
    }

    /**
     * Get user's resume data
     */
    static async getResumeData(userId) {
        try {
            // Try to get from API first
            const response = await api.get('/user/resume');
            return response.data;
        } catch (error) {
            console.warn('Error fetching resume data from API:', error);

            // Fall back to localStorage
            try {
                const resumeDataStr = localStorage.getItem('resumeData');
                if (resumeDataStr) {
                    return JSON.parse(resumeDataStr);
                }
                return null;
            } catch (localError) {
                console.error('Error getting resume data from localStorage:', localError);
                return null;
            }
        }
    }
}

export default UserService;