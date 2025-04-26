// src/services/api.js
import axios from 'axios';
import config from './configService';

// Use the dynamic API URL from configuration
const API_URL = config.apiUrl;

// Create an axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and not from auth endpoints, try to refresh token
        if (error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/register') &&
            !originalRequest.url.includes('/auth/refresh')) {

            originalRequest._retry = true;

            try {
                // Try to silently refresh the token
                const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (refreshResponse.data && refreshResponse.data.token) {
                    // Update the token in localStorage
                    localStorage.setItem('token', refreshResponse.data.token);

                    // Update user data if needed
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    userData.token = refreshResponse.data.token;
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Update the Authorization header for the original request
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;

                    // Retry the original request with the new token
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // If refresh token fails, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        // For other errors, just reject the promise
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    refreshToken: () => api.post('/auth/refresh'),
    logout: () => api.post('/auth/logout')
};

// Resume API
export const resumeAPI = {
    getStatus: () => api.get('/user/resume/status'),
    uploadResume: (formData, config) => {
        // Special headers for file upload
        return api.post('/user/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config
        });
    },
    getSkills: async () => {
        try {
            const response = await api.get('/user/resume/skills');
            return response;
        } catch (error) {
            console.error('Error fetching skills:', error);

            // Try to get skills from local storage as fallback
            const cachedSkills = localStorage.getItem('cachedSkills');
            if (cachedSkills) {
                return { data: JSON.parse(cachedSkills) };
            }

            // For development mode, return dummy skills
            if (process.env.NODE_ENV !== 'production') {
                return { data: ['JavaScript', 'React', 'AWS', 'Node.js'] };
            }

            throw error;
        }
    },
    getResumeData: async () => {
        try {
            const response = await api.get('/user/resume');
            return response;
        } catch (error) {
            console.error('Error fetching resume data:', error);

            // Try to get resume data from local storage as fallback
            const cachedResumeData = localStorage.getItem('cachedResumeData');
            if (cachedResumeData) {
                return { data: JSON.parse(cachedResumeData) };
            }

            throw error;
        }
    }
};

// Jobs API
export const jobsAPI = {
    // Public jobs endpoints
    getPublicJobs: (filters) => api.get('/jobs', { params: filters }),

    // User's job matches
    getMatches: (filters) => api.get('/user/job-matches', { params: filters }),
    getJobDetails: (jobId) => api.get(`/user/jobs/${jobId}`),
    applyForJob: (jobId, applicationData) => api.post(`/user/jobs/${jobId}/apply`, applicationData),

    // Direct S3 upload for job descriptions
    uploadJobDescription: async (jobData) => {
        try {
            console.log('Uploading job description:', jobData);

            // First try to use the admin API endpoint
            try {
                const response = await adminAPI.createJob(jobData);
                console.log('Job creation success via API:', response);
                return response;
            } catch (apiError) {
                console.error('API method failed, trying S3 direct upload:', apiError);

                // Fallback to S3 direct upload
                // Convert job data to JSON
                const jobBlob = new Blob([JSON.stringify(jobData)], {
                    type: 'application/json'
                });

                // Get the bucket name from config
                const jobsBucket = window.APP_CONFIG ? window.APP_CONFIG.jobDescBucket : 'skillspotter-jobdesc-b01006794';

                // Get presigned URL for upload or use S3 direct upload helper
                const filename = `jobs/job_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.json`;
                const result = await uploadFileToS3(jobBlob, 'jobs/', filename);

                return {
                    success: true,
                    message: 'Job description uploaded successfully via S3',
                    status: 'processing'
                };
            }
        } catch (error) {
            console.error('Error uploading job description:', error);
            throw new Error('Failed to upload job description. Please try again.');
        }
    }
};

// Skills API
export const skillsAPI = {
    getSkillsAnalysis: () => api.get('/user/skills/analysis'),
    getSkillGaps: () => api.get('/user/skills/gaps'),
    getIndustryDemand: () => api.get('/user/skills/industry-demand'),
};

// Dashboard API
export const dashboardAPI = {
    getOverview: () => api.get('/user/dashboard/overview'),
    getRecentActivity: () => api.get('/user/dashboard/activity'),
};

// Admin API
export const adminAPI = {
    // Users management
    getUsers: (filters) => api.get('/admin/users', { params: filters }),
    getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

    // Jobs management - Updated for new API Gateway integration
    getAllJobs: async (filters) => {
        try {
            // Try the API Gateway endpoint first
            const response = await api.get('/admin/jobs', { params: filters });
            return response;
        } catch (error) {
            console.error('Error fetching jobs from API Gateway:', error);

            // For development/testing, return mock data
            if (process.env.NODE_ENV !== 'production') {
                console.log('Returning mock job data for development');
                return {
                    data: {
                        jobs: [
                            {
                                id: 'job1',
                                title: 'Frontend Developer',
                                company: 'Tech Solutions Inc.',
                                location: 'Remote',
                                description: 'Building web applications with React',
                                skills: ['JavaScript', 'React', 'HTML', 'CSS'],
                                postedDate: new Date().toISOString(),
                                status: 'ACTIVE'
                            },
                            {
                                id: 'job2',
                                title: 'Backend Developer',
                                company: 'Data Systems Ltd',
                                location: 'New York, NY',
                                description: 'Developing APIs with Node.js',
                                skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
                                postedDate: new Date().toISOString(),
                                status: 'ACTIVE'
                            }
                        ],
                        page: 1,
                        totalPages: 1,
                        totalResults: 2
                    }
                };
            }

            throw error;
        }
    },

    createJob: async (jobData) => {
        try {
            console.log('Creating job via API Gateway:', jobData);

            // Format the job data properly - ensure skills are under the right property name
            const processedJob = {
                ...jobData,
                // Ensure skills are in the format expected by the backend
                requiredSkills: jobData.skills || [],
                status: jobData.status || 'ACTIVE'
            };

            // Send to the API Gateway endpoint
            const response = await api.post('/admin/jobs', processedJob);
            console.log('Job creation response:', response.data);
            return response;
        } catch (error) {
            console.error('Job creation error details:', error.response?.data || error.message);

            // Try direct S3 upload as fallback
            try {
                console.log('Trying S3 direct upload as fallback');
                return await jobsAPI.uploadJobDescription(jobData);
            } catch (s3Error) {
                console.error('Both API and S3 methods failed:', s3Error);

                // Specific error handling
                if (error.response?.status === 401) {
                    throw new Error('Authentication required. Please log in again.');
                } else if (error.response?.status === 400) {
                    throw new Error(error.response.data?.message || 'Invalid job data. Please check your inputs.');
                } else {
                    throw new Error('Failed to create job. Network or server error.');
                }
            }
        }
    },

    updateJob: async (jobId, jobData) => {
        try {
            const response = await api.put(`/admin/jobs/${jobId}`, jobData);
            return response;
        } catch (error) {
            console.error('Error updating job:', error);
            throw new Error('Failed to update job. Please try again.');
        }
    },

    deleteJob: async (jobId) => {
        try {
            const response = await api.delete(`/admin/jobs/${jobId}`);
            return response;
        } catch (error) {
            console.error('Error deleting job:', error);
            throw new Error('Failed to delete job. Please try again.');
        }
    },

    getJobTypes: () => api.get('/admin/job-types'),
    getPopularSkills: () => api.get('/admin/popular-skills'),

    // Analytics
    getStats: (timeRange, options) => api.get('/admin/analytics/stats', {
        params: { timeRange, ...options },
        responseType: options?.format === 'export' ? 'blob' : 'json'
    }),
    getUserStats: () => api.get('/admin/analytics/users'),
    getJobStats: () => api.get('/admin/analytics/jobs'),
    getSkillStats: () => api.get('/admin/analytics/skills'),
    getMatchStats: () => api.get('/admin/analytics/matches'),
    getActivityTimeline: (timeRange) => api.get('/admin/analytics/activity', { params: { timeRange } }),

    // Settings
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (settingsData) => api.put('/admin/settings', settingsData),
    generateApiKeys: () => api.post('/admin/settings/generate-keys'),
};

// S3 Direct Upload API
export const s3API = {
    getPresignedUrl: async (fileType, fileName) => {
        try {
            const response = await api.get('/storage/presigned-url', {
                params: {
                    fileType,
                    fileName
                }
            });
            return response;
        } catch (error) {
            console.error('Error getting presigned URL:', error);

            // For testing - simulate presigned URL
            if (process.env.NODE_ENV !== 'production') {
                return {
                    data: {
                        url: 'https://example.com/mock-presigned-url',
                        key: fileName
                    }
                };
            }
            throw error;
        }
    },
    uploadToS3: (presignedUrl, file) => {
        // For actual S3 upload
        if (presignedUrl.startsWith('http')) {
            return axios.put(presignedUrl, file, {
                headers: {
                    'Content-Type': file.type
                }
            });
        }

        // For development/testing - simulate S3 upload
        console.log('Simulating S3 upload to:', presignedUrl);
        return Promise.resolve({ status: 200 });
    }
};

// Helper function for direct S3 uploads
export const uploadFileToS3 = async (file, prefix = 'uploads/', customFileName = null) => {
    try {
        console.log('Starting direct S3 upload, file:', file);

        // Get bucket name from config
        const bucketName = window.APP_CONFIG ?
            (prefix.startsWith('uploads/') ? window.APP_CONFIG.resumeBucket : window.APP_CONFIG.jobDescBucket) :
            (prefix.startsWith('uploads/') ? 'skillspotter-resumes-b01006794' : 'skillspotter-jobdesc-b01006794');

        console.log('Using bucket:', bucketName);

        // Generate file name
        const fileName = customFileName || `${prefix}${Date.now()}_${file.name || 'file'}`;

        // First, try to get a presigned URL from the API
        try {
            const urlResponse = await s3API.getPresignedUrl(
                file.type || 'application/octet-stream',
                fileName
            );

            console.log('Got presigned URL:', urlResponse.data);

            // Upload the file
            await s3API.uploadToS3(urlResponse.data.url, file);

            console.log('S3 upload successful');

            return {
                success: true,
                key: urlResponse.data.key || fileName,
                bucket: bucketName
            };
        } catch (error) {
            console.error('Error with API presigned URL method:', error);

            // For dev/testing, simulate a successful upload
            if (process.env.NODE_ENV !== 'production') {
                console.log('Simulating successful upload for development');
                return {
                    success: true,
                    key: fileName,
                    bucket: bucketName
                };
            }

            throw error;
        }
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Failed to upload file. Please try again.');
    }
};

// API Health check
export const checkApiHealth = async () => {
    try {
        const response = await api.get('/auth/health');
        return {
            isHealthy: response.data.status === 'healthy',
            data: response.data
        };
    } catch (error) {
        console.error('API health check failed:', error);
        return {
            isHealthy: false,
            error: error.message
        };
    }
};

// Export the general API instance as default
export default api;