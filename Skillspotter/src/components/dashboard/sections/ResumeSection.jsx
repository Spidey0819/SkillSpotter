// src/components/dashboard/sections/ResumeSection.jsx - Modified version
import React, { useState, useEffect } from 'react';
import DirectUploadService from '../../../services/DirectUploadService';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api'; // Import API client

const ResumeSection = () => {
    const { user } = useAuth(); // Get current user context
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [extractedSkills, setExtractedSkills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        // Load resume data and extracted skills from backend
        const fetchResumeData = async () => {
            try {
                setLoading(true);

                // Get userId from auth context
                const userId = user?.userId;

                if (!userId) {
                    console.warn("No user ID available, cannot fetch resume data");
                    setLoading(false);
                    return;
                }

                // Fetch resume data from the backend
                const response = await api.get(`/user/resume?userId=${userId}`);

                if (response.data && response.data.resume) {
                    const resumeInfo = response.data.resume;
                    setResumeData({
                        fileName: resumeInfo.fileName || 'Resume.pdf',
                        fileSize: resumeInfo.fileSize || `${Math.round(resumeInfo.fileSize / 1024)} KB`,
                        uploadTimestamp: resumeInfo.uploadTimestamp || new Date().toISOString(),
                        downloadUrl: resumeInfo.downloadUrl || '#',
                        key: resumeInfo.originalKey || ''
                    });

                    // Set the actual extracted skills from the resume
                    if (resumeInfo.extractedSkills && Array.isArray(resumeInfo.extractedSkills)) {
                        setExtractedSkills(resumeInfo.extractedSkills);
                    }
                } else {
                    // Fallback to localStorage only if API call fails or returns no data
                    const savedResumeData = localStorage.getItem('resumeData');
                    if (savedResumeData) {
                        setResumeData(JSON.parse(savedResumeData));
                    }

                    const savedSkills = localStorage.getItem('extractedSkills');
                    if (savedSkills) {
                        setExtractedSkills(JSON.parse(savedSkills));
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching resume data:', err);

                // Fallback to localStorage on error
                const savedResumeData = localStorage.getItem('resumeData');
                if (savedResumeData) {
                    setResumeData(JSON.parse(savedResumeData));
                }

                const savedSkills = localStorage.getItem('extractedSkills');
                if (savedSkills) {
                    setExtractedSkills(JSON.parse(savedSkills));
                }

                setLoading(false);
            }
        };

        fetchResumeData();
    }, [user]);

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setError(null);
            setUploadSuccess(false);
            setIsUploading(true);
            setUploadProgress(0);

            try {
                console.log('Starting resume upload:', file.name);

                // Upload file directly to S3 using our service
                const result = await DirectUploadService.uploadResume(file, (progress) => {
                    setUploadProgress(progress);
                });

                console.log('Upload result:', result);

                if (result && result.success) {
                    setUploadSuccess(true);

                    // Create resume data
                    const resumeInfo = {
                        fileName: file.name,
                        fileSize: `${Math.round(file.size / 1024)} KB`,
                        uploadTimestamp: new Date().toISOString(),
                        downloadUrl: result.location || '#',
                        key: result.key
                    };

                    // Save to localStorage for persistence
                    localStorage.setItem('resumeData', JSON.stringify(resumeInfo));
                    setResumeData(resumeInfo);

                    // Show processing state while Lambda would be working
                    setIsUploading(false);
                    setIsProcessing(true);

                    // Poll for resume processing results
                    let attempts = 0;
                    const maxAttempts = 10;
                    const pollInterval = 3000; // 3 seconds

                    const pollForSkills = async () => {
                        try {
                            attempts++;
                            // Query backend for processed skills
                            const userId = user?.userId;
                            if (!userId) {
                                throw new Error("No user ID available");
                            }

                            const pollResponse = await api.get(`/user/resume/skills?userId=${userId}`);

                            if (pollResponse.data && pollResponse.data.skills && pollResponse.data.skills.length > 0) {
                                // Skills have been extracted
                                setExtractedSkills(pollResponse.data.skills);
                                localStorage.setItem('extractedSkills', JSON.stringify(pollResponse.data.skills));
                                setIsProcessing(false);
                                return;
                            }

                            if (attempts >= maxAttempts) {
                                // Give up after max attempts
                                setIsProcessing(false);
                                setExtractedSkills([]);
                                setError("Resume processing took too long. Skills will appear when processing completes.");
                                return;
                            }

                            // Try again after interval
                            setTimeout(pollForSkills, pollInterval);
                        } catch (pollError) {
                            console.error('Error polling for skills:', pollError);
                            setIsProcessing(false);
                            // No skills available yet
                        }
                    };

                    // Start polling
                    setTimeout(pollForSkills, pollInterval);

                } else {
                    throw new Error('Upload failed without specific error');
                }
            } catch (err) {
                console.error('Error uploading resume:', err);
                setError(`Failed to upload resume: ${err.message || 'Unknown error'}`);
                setIsUploading(false);
                setIsProcessing(false);
            }
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Resume</h1>
            <p className="mt-1 text-sm text-gray-600">Upload and manage your resume</p>

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

            {uploadSuccess && !error && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                Resume uploaded successfully!
                                {isProcessing ? ' Processing resume...' : ' Skills extracted successfully.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {resumeData ? 'Current Resume' : 'Upload Your Resume'}
                    </h3>

                    {!resumeData && !isUploading && !isProcessing && (
                        <div className="mt-6 max-w-xl">
                            <p className="text-sm text-gray-500">
                                Upload your resume to get started with job matching and skills analysis.
                            </p>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <span>Select file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only"
                                           onChange={handleResumeUpload}
                                           accept=".pdf,.doc,.docx,.txt" />
                                </label>
                                <p className="ml-3 text-xs text-gray-500">PDF, DOCX, or TXT up to 10MB</p>
                            </div>
                            {process.env.NODE_ENV !== 'production' && (
                                <button
                                    type="button"
                                    onClick={toggleSimulation}
                                    className="mt-4 text-xs text-gray-500 underline"
                                >
                                    Toggle simulation mode
                                </button>
                            )}
                        </div>
                    )}

                    {isUploading && (
                        <div className="mt-6 max-w-xl">
                            <div className="mb-1 text-sm flex justify-between">
                                <span className="text-gray-700">Uploading...</span>
                                <span className="text-indigo-600">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="mt-6 max-w-xl">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
                                <span className="text-gray-700">Processing your resume...</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                We're extracting skills and matching with jobs. This may take a few moments.
                            </p>
                        </div>
                    )}

                    {resumeData && !isUploading && !isProcessing && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="flex items-center">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">{resumeData.fileName}</p>
                                        <p className="text-xs text-gray-500">{resumeData.fileSize} • Uploaded {new Date(resumeData.uploadTimestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <label
                                        htmlFor="replace-file-upload"
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        Replace
                                        <input id="replace-file-upload" name="replace-file-upload" type="file" className="sr-only"
                                               onChange={handleResumeUpload}
                                               accept=".pdf,.doc,.docx,.txt" />
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-md font-medium text-gray-900">Extracted Skills</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {extractedSkills.length > 0 ? (
                                        extractedSkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No skills have been extracted yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeSection;