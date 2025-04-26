// src/services/JobsService.js
import api from './api';

class JobsService {
    /**
     * Get job listings with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise} Promise resolving to job data
     */
    static async getJobs(filters = {}) {
        try {
            // First try to get jobs from the API
            const response = await api.get('/jobs', { params: filters });
            return response.data;
        } catch (error) {
            console.warn('Error fetching jobs from API:', error);

            // Fall back to localStorage for jobs that were created through our direct upload
            const localJobs = this.getLocalJobs();

            // Apply filters if they exist
            let filteredJobs = [...localJobs];

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredJobs = filteredJobs.filter(job =>
                    job.title.toLowerCase().includes(searchTerm) ||
                    job.company.toLowerCase().includes(searchTerm) ||
                    job.description.toLowerCase().includes(searchTerm)
                );
            }

            if (filters.status && filters.status !== 'all') {
                filteredJobs = filteredJobs.filter(job => job.status === filters.status);
            }

            // Sort by date (newest first)
            filteredJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

            // Paginate results
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

            return {
                jobs: paginatedJobs,
                page: page,
                limit: limit,
                totalPages: Math.ceil(filteredJobs.length / limit),
                totalResults: filteredJobs.length
            };
        }
    }

    /**
     * Get job listings specifically for the admin panel
     */
    static async getAdminJobs(filters = {}) {
        try {
            // Try to get admin jobs from API
            const response = await api.get('/admin/jobs', { params: filters });
            return response.data;
        } catch (error) {
            console.warn('Error fetching admin jobs from API:', error);

            // Fall back to localStorage
            return this.getJobs(filters);
        }
    }

    /**
     * Get job matches for a specific user
     */
    static async getJobMatches(userId, filters = {}) {
        try {
            // Try to get job matches from API
            const response = await api.get('/user/job-matches', { params: filters });
            return response.data;
        } catch (error) {
            console.warn('Error fetching job matches from API:', error);

            // Fall back to localStorage
            const localJobs = this.getLocalJobs();
            const userSkills = this.getUserSkills(userId);

            if (!userSkills || userSkills.length === 0) {
                return {
                    jobs: [],
                    page: 1,
                    totalPages: 0,
                    totalResults: 0,
                    message: "Upload your resume to get job matches"
                };
            }

            // Calculate match percentages
            const jobMatches = localJobs.map(job => {
                const requiredSkills = job.skills || job.requiredSkills || [];
                const matchingSkills = userSkills.filter(skill =>
                    requiredSkills.includes(skill)
                );

                const matchPercentage = requiredSkills.length > 0
                    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
                    : 0;

                return {
                    ...job,
                    matchPercentage,
                    matchingSkills
                };
            });

            // Filter by minimum match percentage
            const minMatch = filters.minMatch || 0;
            const matchedJobs = jobMatches.filter(job => job.matchPercentage >= minMatch);

            // Sort by match percentage (high to low)
            matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

            // Paginate results
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedJobs = matchedJobs.slice(startIndex, endIndex);

            return {
                jobs: paginatedJobs,
                page: page,
                totalPages: Math.ceil(matchedJobs.length / limit),
                totalResults: matchedJobs.length
            };
        }
    }

    /**
     * Get jobs from localStorage
     */
    static getLocalJobs() {
        try {
            const localJobs = localStorage.getItem('mockJobs');
            if (localJobs) {
                return JSON.parse(localJobs);
            }

            // If no jobs in localStorage, return sample jobs in development
            if (process.env.NODE_ENV !== 'production') {
                const sampleJobs = this.getSampleJobs();
                localStorage.setItem('mockJobs', JSON.stringify(sampleJobs));
                return sampleJobs;
            }

            return [];
        } catch (error) {
            console.error('Error getting local jobs:', error);
            return [];
        }
    }

    /**
     * Get user skills from localStorage
     */
    static getUserSkills(userId) {
        try {
            const skills = localStorage.getItem('extractedSkills');
            if (skills) {
                return JSON.parse(skills);
            }
            return [];
        } catch (error) {
            console.error('Error getting user skills:', error);
            return [];
        }
    }

    /**
     * Get sample jobs for development/testing
     */
    static getSampleJobs() {
        return [
            {
                id: 'job1',
                title: 'Senior Frontend Developer',
                company: 'Tech Innovations Inc.',
                location: 'Remote',
                type: 'Full-time',
                description: 'We are looking for a skilled frontend developer with experience in React, Redux, and modern JavaScript.',
                skills: ['JavaScript', 'React', 'Redux', 'HTML', 'CSS', 'Git'],
                salary: '$90,000 - $120,000',
                postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                status: 'ACTIVE',
                remote: true
            },
            {
                id: 'job2',
                title: 'Data Scientist',
                company: 'Analytics Solutions',
                location: 'New York, NY',
                type: 'Full-time',
                description: 'Join our data science team to build machine learning models and analyze large datasets.',
                skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis', 'Statistics'],
                salary: '$100,000 - $140,000',
                postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                status: 'ACTIVE',
                remote: false
            },
            {
                id: 'job3',
                title: 'DevOps Engineer',
                company: 'Cloud Systems Inc',
                location: 'San Francisco, CA',
                type: 'Full-time',
                description: 'Seeking a DevOps engineer to maintain and improve our cloud infrastructure and CI/CD pipelines.',
                skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Python'],
                salary: '$110,000 - $150,000',
                postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                status: 'ACTIVE',
                remote: true
            }
        ];
    }
}

export default JobsService;