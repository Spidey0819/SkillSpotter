// src/components/admin/sections/JobPostingSection.jsx
import React, { useState } from 'react';
import DirectUploadService from '../../../services/DirectUploadService';

const JobPostingSection = () => {
    // State for job posting form
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
        requirements: '',
        benefits: '',
        salary: '',
        skills: [],
        remote: false,
        featured: false,
    });
    const [skillInput, setSkillInput] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobPreview, setJobPreview] = useState(null);
    const [jobTypes] = useState(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']);
    const [popularSkills] = useState([
        { name: 'JavaScript', count: 10 },
        { name: 'React', count: 8 },
        { name: 'Python', count: 7 },
        { name: 'AWS', count: 6 },
        { name: 'Node.js', count: 5 },
        { name: 'SQL', count: 5 },
        { name: 'MongoDB', count: 4 },
        { name: 'Docker', count: 3 },
    ]);
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear error when field is modified
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    // Handle skill input
    const handleSkillInputChange = (e) => {
        setSkillInput(e.target.value);
    };

    // Add skill to the list
    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()]
            });
            setSkillInput('');

            // Clear skill error if it exists
            if (errors.skills) {
                setErrors({
                    ...errors,
                    skills: null
                });
            }
        }
    };

    // Remove skill from the list
    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    // Add a suggested skill
    const addSuggestedSkill = (skill) => {
        if (!formData.skills.includes(skill)) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skill]
            });

            // Clear skill error if it exists
            if (errors.skills) {
                setErrors({
                    ...errors,
                    skills: null
                });
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.description.trim()) newErrors.description = "Job description is required";
        if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";

        // If there are errors, display them and don't submit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Show preview instead of actual submission
        setIsSubmitting(true);
        try {
            // Create a preview of the job
            setJobPreview(formData);
            setIsSubmitting(false);
        } catch (err) {
            console.error('Error creating job preview:', err);
            setErrors({ submit: 'Failed to create job preview. Please try again.' });
            setIsSubmitting(false);
        }
    };

    // Close preview and go back to form
    const closePreview = () => {
        setJobPreview(null);
        setSuccessMessage('');
    };

    // Publish job after preview
    const publishJob = async () => {
        setIsSubmitting(true);
        setErrors({});
        setUploadProgress(0);

        try {
            console.log('Publishing job...');

            // Add any validation needed here
            if (!jobPreview.title || !jobPreview.company || !jobPreview.description) {
                throw new Error('Missing required fields. Please complete all required fields.');
            }

            // Format the job data for S3 upload
            const jobData = {
                ...jobPreview,
                // Include both fields to be compatible with different backend expectations
                skills: jobPreview.skills || [],
                requiredSkills: jobPreview.skills || [],
                status: 'ACTIVE',
                postTimestamp: new Date().toISOString()
            };

            console.log('Uploading job data to S3:', jobData);

            // Upload job data directly
            const result = await DirectUploadService.uploadJobDescription(jobData, (progress) => {
                setUploadProgress(progress);
            });

            console.log('Job upload result:', result);

            if (!result || !result.success) {
                throw new Error('Failed to upload job data');
            }

            // Store in localStorage for persistence in demo mode
            const jobsList = JSON.parse(localStorage.getItem('mockJobs') || '[]');
            const newJob = {
                id: `job_${Date.now()}`,
                ...jobData,
                key: result.key,
                postedDate: new Date().toISOString()
            };
            jobsList.push(newJob);
            localStorage.setItem('mockJobs', JSON.stringify(jobsList));

            // Set success message
            setSuccessMessage('Job posted successfully! The job data has been uploaded and will be processed. Redirecting to jobs list...');

            // Small delay to show success message
            setTimeout(() => {
                // Redirect to jobs list
                window.location.href = '/admin/jobs';
            }, 3000);
        } catch (err) {
            console.error('Error publishing job:', err);
            setErrors({
                submit: err.message || 'Failed to publish job. Please try again.'
            });
            setIsSubmitting(false);
        }
    };

    // Save job as draft
    const saveAsDraft = async () => {
        setIsSubmitting(true);
        setErrors({});
        setUploadProgress(0);

        try {
            console.log('Saving job as draft...');

            // Add draft status to the job data
            const draftJob = {
                ...formData,
                status: 'DRAFT',
                postTimestamp: new Date().toISOString(),
                skills: formData.skills || [],
                requiredSkills: formData.skills || []
            };

            console.log('Uploading draft job:', draftJob);

            // Upload job data
            const result = await DirectUploadService.uploadJobDescription(draftJob, (progress) => {
                setUploadProgress(progress);
            });

            console.log('Draft upload result:', result);

            if (!result || !result.success) {
                throw new Error('Failed to upload draft');
            }

            // Store in localStorage for persistence in demo mode
            const jobsList = JSON.parse(localStorage.getItem('mockJobs') || '[]');
            const newJob = {
                id: `job_draft_${Date.now()}`,
                ...draftJob,
                key: result.key,
                postedDate: new Date().toISOString()
            };
            jobsList.push(newJob);
            localStorage.setItem('mockJobs', JSON.stringify(jobsList));

            // Set success message
            setSuccessMessage('Draft saved successfully! Redirecting to jobs list...');

            // Redirect to jobs list after a short delay
            setTimeout(() => {
                window.location.href = '/admin/jobs';
            }, 2000);
        } catch (err) {
            console.error('Error saving job draft:', err);
            setErrors({
                submit: err.message || 'Failed to save draft. Please try again.'
            });
            setIsSubmitting(false);
        }
    };

    // Format date for job posting
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Render job preview
    if (jobPreview) {
        return (
            <div>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Job Preview</h1>
                    <div>
                        <button
                            type="button"
                            className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={closePreview}
                            disabled={isSubmitting}
                        >
                            Edit Job
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                            onClick={publishJob}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Job'}
                        </button>
                    </div>
                </div>

                {successMessage && (
                    <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {errors.submit && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isSubmitting && (
                    <div className="mt-4">
                        <div className="mb-1 text-sm flex justify-between">
                            <span className="text-gray-700">Uploading job data...</span>
                            <span className="text-indigo-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {jobPreview.title}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {jobPreview.company} • {jobPreview.location} • {jobPreview.type}
                            {jobPreview.remote && ' • Remote'}
                        </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Posted</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {formatDate(new Date())}
                                </dd>
                            </div>

                            {jobPreview.salary && (
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Salary</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {jobPreview.salary}
                                    </dd>
                                </div>
                            )}

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Required Skills</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="flex flex-wrap gap-2">
                                        {jobPreview.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </dd>
                            </div>

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                                    {jobPreview.description}
                                </dd>
                            </div>

                            {jobPreview.requirements && (
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Requirements</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                                        {jobPreview.requirements}
                                    </dd>
                                </div>
                            )}

                            {jobPreview.benefits && (
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Benefits</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                                        {jobPreview.benefits}
                                    </dd>
                                </div>
                            )}

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Featured</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {jobPreview.featured ? 'Yes' : 'No'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        );
    }

    // Rest of the component code remains unchanged...
    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Post a New Job</h1>
            <p className="mt-1 text-sm text-gray-600">Create a new job listing to find the perfect candidate</p>

            {successMessage && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {errors.submit && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Job posting form - this part remains the same as before */}
            <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
                {/* Basic Job Information */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Job details that will be shown to candidates.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Job Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        className={`mt-1 block w-full rounded-md ${
                                            errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                                        } shadow-sm sm:text-sm`}
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                    {errors.title && (
                                        <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        id="company"
                                        className={`mt-1 block w-full rounded-md ${
                                            errors.company ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                                        } shadow-sm sm:text-sm`}
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                    {errors.company && (
                                        <p className="mt-2 text-sm text-red-600">{errors.company}</p>
                                    )}
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        placeholder="City, State or Remote"
                                        className={`mt-1 block w-full rounded-md ${
                                            errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                                        } shadow-sm sm:text-sm`}
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                    {errors.location && (
                                        <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                                    )}
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                        Job Type
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        {jobTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                                        Salary Range (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="salary"
                                        id="salary"
                                        placeholder="e.g. $80,000 - $100,000"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                        value={formData.salary}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <div className="flex items-start pt-5">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="remote"
                                                name="remote"
                                                type="checkbox"
                                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                checked={formData.remote}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="remote" className="font-medium text-gray-700">
                                                Remote Position
                                            </label>
                                            <p className="text-gray-500">Mark if this job can be done remotely.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start mt-4">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="featured"
                                                name="featured"
                                                type="checkbox"
                                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                checked={formData.featured}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="featured" className="font-medium text-gray-700">
                                                Featured Job
                                            </label>
                                            <p className="text-gray-500">Highlight this job in search results.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Required Skills */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Required Skills</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Add skills that will be used for matching candidates.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div>
                                <div className="flex">
                                    <input
                                        type="text"
                                        name="skill"
                                        placeholder="Add a skill (e.g. JavaScript, Python, React)"
                                        className={`block w-full rounded-l-md ${
                                            errors.skills ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                                        } shadow-sm sm:text-sm`}
                                        value={skillInput}
                                        onChange={handleSkillInputChange}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        onClick={addSkill}
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.skills && (
                                    <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
                                )}

                                {/* Popular skills suggestion */}
                                {popularSkills.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-500 mb-2">Popular skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {popularSkills.map((skill, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => addSuggestedSkill(skill.name)}
                                                    disabled={formData.skills.includes(skill.name)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        formData.skills.includes(skill.name)
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    + {skill.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700">Selected Skills:</h4>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.skills.length > 0 ? (
                                            formData.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:bg-purple-500 focus:text-white"
                                                        onClick={() => removeSkill(skill)}
                                                    >
                                                        <span className="sr-only">Remove {skill}</span>
                                                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">No skills added yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Description */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Job Details</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Detailed information about the job position.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Job Description *
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={6}
                                            className={`block w-full rounded-md ${
                                                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                                            } shadow-sm sm:text-sm`}
                                            placeholder="Provide a detailed description of the job role, responsibilities, and expectations..."
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.description && (
                                        <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                                        Requirements (Optional)
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="requirements"
                                            name="requirements"
                                            rows={4}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                            placeholder="List qualifications, experience, education requirements..."
                                            value={formData.requirements}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="benefits" className="block text-sm font-medium text-gray-700">
                                        Benefits (Optional)
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="benefits"
                                            name="benefits"
                                            rows={4}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                            placeholder="List benefits such as healthcare, retirement plans, flexible schedule..."
                                            value={formData.benefits}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form actions */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        onClick={saveAsDraft}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Preview Job Posting'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobPostingSection;