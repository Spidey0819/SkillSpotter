// src/services/AnalyticsService.js
import api from './api';
import JobsService from './JobsService';
import UserService from './UserService';
import SkillsService from './SkillsService';

class AnalyticsService {
    /**
     * Get overview analytics data for admin dashboard
     * @param {Object} filters - Filter parameters like timeRange
     * @returns {Promise} Promise resolving to analytics data
     */
    static async getOverviewStats(filters = {}) {
        try {
            // First try to get data from the API
            const response = await api.get('/admin/analytics/stats', { params: filters });
            return response.data;
        } catch (error) {
            console.warn('Error fetching analytics from API:', error);

            // Generate mock analytics based on local data
            try {
                // Get local data
                const jobs = JobsService.getLocalJobs();
                const users = UserService.getLocalUsers();

                // Apply time range filter if specified
                const now = new Date();
                let startDate = new Date(0); // Beginning of time

                if (filters.timeRange === 'week') {
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                } else if (filters.timeRange === 'month') {
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                } else if (filters.timeRange === 'year') {
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                }

                // Filter data by date
                const filteredJobs = jobs.filter(job =>
                    new Date(job.postedDate) >= startDate
                );

                const filteredUsers = users.filter(user =>
                    new Date(user.createdAt) >= startDate
                );

                // Count active jobs
                const activeJobs = filteredJobs.filter(job => job.status === 'ACTIVE').length;

                // Return formatted analytics data
                return {
                    jobs: {
                        total: filteredJobs.length,
                        active: activeJobs,
                        draft: filteredJobs.filter(job => job.status === 'DRAFT').length,
                        expired: filteredJobs.filter(job => job.status === 'EXPIRED').length,
                        avgApplicationsPerJob: Math.round(Math.random() * 10 + 5) // Mock data
                    },
                    users: {
                        total: filteredUsers.length,
                        active: filteredUsers.filter(user => user.status === 'active').length,
                        admins: filteredUsers.filter(user => user.role === 'admin').length,
                        newUsers: filteredUsers.filter(user =>
                            new Date(user.createdAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                        ).length
                    },
                    skills: {
                        mostPopular: this.generateMostPopularSkills(filteredJobs),
                        highestDemand: this.generateHighestDemandSkills(filteredJobs)
                    },
                    activity: {
                        resumeUploads: Math.round(Math.random() * 50 + 10), // Mock data
                        skillMatches: Math.round(Math.random() * 100 + 20), // Mock data
                        applications: Math.round(Math.random() * 40 + 5) // Mock data
                    }
                };
            } catch (analysisError) {
                console.error('Error generating analytics:', analysisError);
                return {
                    jobs: { total: 0, active: 0, draft: 0, expired: 0, avgApplicationsPerJob: 0 },
                    users: { total: 0, active: 0, admins: 0, newUsers: 0 },
                    skills: { mostPopular: [], highestDemand: [] },
                    activity: { resumeUploads: 0, skillMatches: 0, applications: 0 }
                };
            }
        }
    }

    /**
     * Generate most popular skills from jobs
     */
    static generateMostPopularSkills(jobs) {
        // Count skill frequency in jobs
        const skillCounts = {};
        jobs.forEach(job => {
            const jobSkills = job.skills || job.requiredSkills || [];
            jobSkills.forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });

        // Convert to array and sort by frequency
        return Object.entries(skillCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 skills
    }

    /**
     * Generate highest demand skills (growing trend, mock data)
     */
    static generateHighestDemandSkills(jobs) {
        // For mock data, we'll just create some growth numbers
        const growthSkills = [
            { name: 'React', growth: 45 },
            { name: 'Python', growth: 38 },
            { name: 'AWS', growth: 32 },
            { name: 'Docker', growth: 28 },
            { name: 'Machine Learning', growth: 25 }
        ];

        // Check if any of these skills actually exist in our jobs
        const skillsInJobs = new Set();
        jobs.forEach(job => {
            const jobSkills = job.skills || job.requiredSkills || [];
            jobSkills.forEach(skill => skillsInJobs.add(skill));
        });

        // Filter to only include skills that exist in jobs
        return growthSkills.filter(item => skillsInJobs.has(item.name));
    }

    /**
     * Get user statistics for analytics
     */
    static async getUserStats() {
        try {
            // Try to get from API first
            const response = await api.get('/admin/analytics/users');
            return response.data;
        } catch (error) {
            console.warn('Error fetching user stats from API:', error);

            // Generate mock user stats
            try {
                const users = UserService.getLocalUsers();

                // Generate activity timeline (last 30 days)
                const timeline = [];
                const now = new Date();

                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = date.toISOString().split('T')[0];

                    timeline.push({
                        date: dateStr,
                        newUsers: Math.floor(Math.random() * 5), // Random number 0-4
                        activeUsers: Math.floor(Math.random() * 20 + 5) // Random number 5-24
                    });
                }

                return {
                    userCount: users.length,
                    activeUsersCount: users.filter(user => user.status === 'active').length,
                    adminCount: users.filter(user => user.role === 'admin').length,
                    timeline
                };
            } catch (error) {
                console.error('Error generating user stats:', error);
                return {
                    userCount: 0,
                    activeUsersCount: 0,
                    adminCount: 0,
                    timeline: []
                };
            }
        }
    }

    /**
     * Get job statistics for analytics
     */
    static async getJobStats() {
        try {
            // Try to get from API first
            const response = await api.get('/admin/analytics/jobs');
            return response.data;
        } catch (error) {
            console.warn('Error fetching job stats from API:', error);

            // Generate mock job stats
            try {
                const jobs = JobsService.getLocalJobs();

                // Generate job postings timeline (last 30 days)
                const timeline = [];
                const now = new Date();

                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = date.toISOString().split('T')[0];

                    // Count jobs posted on this date
                    const jobsPostedOnDate = jobs.filter(job => {
                        const jobDate = new Date(job.postedDate).toISOString().split('T')[0];
                        return jobDate === dateStr;
                    }).length;

                    timeline.push({
                        date: dateStr,
                        jobsPosted: jobsPostedOnDate || Math.floor(Math.random() * 3) // Use actual count or random
                    });
                }

                // Count jobs by type
                const jobsByType = {};
                jobs.forEach(job => {
                    const type = job.type || 'Full-time';
                    jobsByType[type] = (jobsByType[type] || 0) + 1;
                });

                // Convert to array
                const jobTypeDistribution = Object.entries(jobsByType)
                    .map(([type, count]) => ({ type, count }));

                return {
                    jobCount: jobs.length,
                    activeJobsCount: jobs.filter(job => job.status === 'ACTIVE').length,
                    topCompanies: this.getTopCompanies(jobs),
                    jobTypeDistribution,
                    timeline
                };
            } catch (error) {
                console.error('Error generating job stats:', error);
                return {
                    jobCount: 0,
                    activeJobsCount: 0,
                    topCompanies: [],
                    jobTypeDistribution: [],
                    timeline: []
                };
            }
        }
    }

    /**
     * Get top companies with most job postings
     */
    static getTopCompanies(jobs) {
        // Count jobs by company
        const companyCount = {};
        jobs.forEach(job => {
            const company = job.company;
            if (company) {
                companyCount[company] = (companyCount[company] || 0) + 1;
            }
        });

        // Convert to array and sort
        return Object.entries(companyCount)
            .map(([name, jobCount]) => ({ name, jobCount }))
            .sort((a, b) => b.jobCount - a.jobCount)
            .slice(0, 5); // Top 5 companies
    }

    /**
     * Get skill statistics for analytics
     */
    static async getSkillStats() {
        try {
            // Try to get from API first
            const response = await api.get('/admin/analytics/skills');
            return response.data;
        } catch (error) {
            console.warn('Error fetching skill stats from API:', error);

            // Generate mock skill stats
            try {
                const jobs = JobsService.getLocalJobs();

                // Get skill distribution
                const skillCounts = {};
                jobs.forEach(job => {
                    const jobSkills = job.skills || job.requiredSkills || [];
                    jobSkills.forEach(skill => {
                        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    });
                });

                // Convert to array and sort by frequency
                const skillDistribution = Object.entries(skillCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                // Group skills by category (mock categorization)
                const skillCategories = {
                    'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'],
                    'Web Technologies': ['HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js'],
                    'Database': ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
                    'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
                    'Data Science': ['Machine Learning', 'Data Analysis', 'Statistics', 'AI']
                };

                // Count skills by category
                const skillsByCategory = {};

                skillDistribution.forEach(({name, count}) => {
                    // Find which category this skill belongs to
                    for (const [category, skills] of Object.entries(skillCategories)) {
                        if (skills.includes(name)) {
                            skillsByCategory[category] = (skillsByCategory[category] || 0) + count;
                            break;
                        }
                    }
                });

                // Convert categories to array
                const categoryDistribution = Object.entries(skillsByCategory)
                    .map(([category, count]) => ({ category, count }))
                    .sort((a, b) => b.count - a.count);

                return {
                    totalSkillsMentioned: Object.values(skillCounts).reduce((sum, count) => sum + count, 0),
                    uniqueSkills: skillDistribution.length,
                    topSkills: skillDistribution.slice(0, 10),
                    categoryDistribution
                };
            } catch (error) {
                console.error('Error generating skill stats:', error);
                return {
                    totalSkillsMentioned: 0,
                    uniqueSkills: 0,
                    topSkills: [],
                    categoryDistribution: []
                };
            }
        }
    }
}

export default AnalyticsService;