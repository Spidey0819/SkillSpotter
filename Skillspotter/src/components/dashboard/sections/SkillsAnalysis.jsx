// src/components/dashboard/sections/SkillsAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import SkillsService from '../../../services/SkillsService';
import UserService from '../../../services/UserService';

const SkillsAnalysis = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userSkills, setUserSkills] = useState([]);
    const [recommendedSkills, setRecommendedSkills] = useState([]);
    const [skillGaps, setSkillGaps] = useState([]);
    const [topSkillsInDemand, setTopSkillsInDemand] = useState([]);
    const [hasResume, setHasResume] = useState(false);
    const [industryComparison, setIndustryComparison] = useState(null);

    useEffect(() => {
        fetchSkillsData();
        checkResumeStatus();
    }, [user]);

    const checkResumeStatus = async () => {
        try {
            const resumeData = await UserService.getResumeData(user?.userId);
            setHasResume(!!resumeData);
        } catch (err) {
            console.error('Error checking resume status:', err);
            setHasResume(false);
        }
    };

    const fetchSkillsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get skills analysis data
            const analysis = await SkillsService.getSkillsAnalysis(user?.userId);

            if (analysis) {
                setUserSkills(analysis.userSkills || []);
                setRecommendedSkills(analysis.recommendedSkills || []);
                setSkillGaps(analysis.skillGaps || []);
                setTopSkillsInDemand(analysis.topSkillsInDemand || []);
                setIndustryComparison(analysis.industryComparison || null);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching skills analysis:', err);
            setError('Failed to load skills analysis. Please try again later.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Skills Analysis</h1>
            <p className="mt-1 text-sm text-gray-600">Overview of your skills and potential gaps</p>

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

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Your Skills */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900">Your Skills</h2>
                    <p className="text-sm text-gray-500 mb-4">Skills extracted from your resume</p>

                    {!hasResume && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No skills detected yet. Upload your resume to get a skills analysis.</p>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/dashboard/resume'}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Upload Resume
                            </button>
                        </div>
                    )}

                    {hasResume && userSkills.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No skills could be detected in your resume. Try uploading a more detailed resume.</p>
                        </div>
                    )}

                    {userSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {userSkills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommended Skills */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900">Recommended Skills</h2>
                    <p className="text-sm text-gray-500 mb-4">Skills that could improve your job matches</p>

                    {!hasResume && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">Upload your resume to see skill recommendations.</p>
                        </div>
                    )}

                    {hasResume && skillGaps.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No skill gaps detected at this time.</p>
                        </div>
                    )}

                    {skillGaps.length > 0 && (
                        <div className="space-y-4">
                            {recommendedSkills.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {item.skill}
                                        </span>
                                        <p className="mt-1 text-xs text-gray-500">{item.reason}</p>
                                    </div>
                                    {item.demandScore && (
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-900 mr-2">{item.demandScore}</span>
                                            <span className="text-xs text-gray-500">jobs</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Skills Analysis */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900">Skills Analysis</h2>
                <p className="text-sm text-gray-500 mb-4">Comparison with industry demand</p>

                {!hasResume && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No skills analysis available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload your resume to get a detailed skills analysis
                        </p>
                    </div>
                )}

                {hasResume && industryComparison && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Your Skills vs. Industry Average</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-500">Your skills count:</span>
                                    <span className="text-sm font-medium text-gray-900">{industryComparison.userSkillCount}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm text-gray-500">Industry average:</span>
                                    <span className="text-sm font-medium text-gray-900">{industryComparison.averageSkillCount}</span>
                                </div>
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                                Skills percentile: {industryComparison.percentile}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                        <div style={{ width: `${industryComparison.percentile}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Top Skills in Demand</h3>
                            {topSkillsInDemand.length > 0 ? (
                                <div className="space-y-2">
                                    {topSkillsInDemand.slice(0, 5).map((skill, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <span className="text-sm text-gray-900">{skill}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                userSkills.includes(skill) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {userSkills.includes(skill) ? 'You have this skill' : 'Skill gap'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No industry data available at this time.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsAnalysis;