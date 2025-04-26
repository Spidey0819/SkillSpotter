// src/services/SkillsService.js
import api from './api';
import JobsService from './JobsService';

class SkillsService {
    /**
     * Get user's extracted skills from resume
     * @param {string} userId - User ID
     * @returns {Promise} Promise resolving to skills array
     */
    static async getUserSkills(userId) {
        try {
            // First try to get skills from the API
            const response = await api.get('/user/resume/skills');
            return response.data;
        } catch (error) {
            console.warn('Error fetching skills from API:', error);

            // Fall back to localStorage
            try {
                const skills = localStorage.getItem('extractedSkills');
                if (skills) {
                    return JSON.parse(skills);
                }

                // Return empty array if no skills found
                return [];
            } catch (localError) {
                console.error('Error getting skills from localStorage:', localError);
                return [];
            }
        }
    }

    /**
     * Get skills analysis data including skill gaps and recommendations
     * @param {string} userId - User ID
     * @returns {Promise} Promise resolving to skills analysis data
     */
    static async getSkillsAnalysis(userId) {
        try {
            // First try to get skills analysis from the API
            const response = await api.get('/user/skills/analysis');
            return response.data;
        } catch (error) {
            console.warn('Error fetching skills analysis from API:', error);

            // Generate mock skills analysis based on local data
            try {
                // Get user skills
                const userSkills = await this.getUserSkills(userId);

                // Get all jobs to analyze in-demand skills
                const allJobs = JobsService.getLocalJobs();

                // Count skill frequency in jobs
                const skillCounts = {};
                allJobs.forEach(job => {
                    const jobSkills = job.skills || job.requiredSkills || [];
                    jobSkills.forEach(skill => {
                        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    });
                });

                // Convert to array and sort by frequency
                const sortedSkills = Object.entries(skillCounts)
                    .map(([skill, count]) => ({ skill, count }))
                    .sort((a, b) => b.count - a.count);

                // Identify top in-demand skills
                const topInDemandSkills = sortedSkills.slice(0, 10);

                // Identify skill gaps (top skills that user doesn't have)
                const skillGaps = topInDemandSkills
                    .filter(item => !userSkills.includes(item.skill))
                    .slice(0, 5);

                // Prepare recommended skills based on gaps
                const recommendedSkills = skillGaps.map(item => ({
                    skill: item.skill,
                    demandScore: item.count,
                    reason: `In high demand (found in ${item.count} job postings)`
                }));

                return {
                    userSkills,
                    skillGaps: skillGaps.map(item => item.skill),
                    recommendedSkills,
                    topSkillsInDemand: topInDemandSkills.map(item => item.skill),
                    industryComparison: {
                        userSkillCount: userSkills.length,
                        averageSkillCount: 8, // Mock average
                        percentile: userSkills.length >= 8 ? 75 : 50 // Mock percentile
                    }
                };
            } catch (analysisError) {
                console.error('Error generating skills analysis:', analysisError);
                return {
                    userSkills: [],
                    skillGaps: [],
                    recommendedSkills: [],
                    topSkillsInDemand: [],
                    industryComparison: {
                        userSkillCount: 0,
                        averageSkillCount: 8,
                        percentile: 0
                    }
                };
            }
        }
    }

    /**
     * Get popular skills for suggestions in job posting form
     */
    static async getPopularSkills() {
        try {
            // Try to get from API first
            const response = await api.get('/admin/popular-skills');
            return response.data;
        } catch (error) {
            console.warn('Error fetching popular skills from API:', error);

            // Generate mock popular skills based on local data
            try {
                const allJobs = JobsService.getLocalJobs();

                // Count skill frequency in jobs
                const skillCounts = {};
                allJobs.forEach(job => {
                    const jobSkills = job.skills || job.requiredSkills || [];
                    jobSkills.forEach(skill => {
                        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    });
                });

                // Convert to array and sort by frequency
                const popularSkills = Object.entries(skillCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 15); // Limit to top 15 skills

                return popularSkills;
            } catch (error) {
                console.error('Error generating popular skills:', error);
                return [];
            }
        }
    }
}

export default SkillsService;