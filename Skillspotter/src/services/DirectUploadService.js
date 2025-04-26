// src/services/DirectUploadService.js
import axios from 'axios';
class DirectUploadService {
    /**
     * Upload a file directly to S3 using fetch
     * @param {File} file - The file to upload
     * @param {string} prefix - Folder prefix (e.g., 'uploads/' for resumes)
     * @param {Function} onProgress - Progress callback (optional)
     */
    static async uploadFile(file, prefix = 'uploads/', onProgress = null) {
        try {
            console.log(`Starting upload for ${file.name} with prefix ${prefix}`);

            // Generate a unique file name
            const fileName = `${prefix}${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            // For testing/development, simulate a successful upload
            if (process.env.NODE_ENV === 'development' && window.localStorage.getItem('simulateS3Upload') === 'true') {
                console.log('Simulating S3 upload in development mode');

                // Simulate progress if provided
                if (onProgress) {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        onProgress(progress);
                        if (progress >= 100) {
                            clearInterval(interval);
                        }
                    }, 300);
                }

                // Return mock success data
                await new Promise(resolve => setTimeout(resolve, 2000));
                return {
                    success: true,
                    fileName: fileName,
                    key: fileName,
                    location: `https://example-bucket.s3.amazonaws.com/${fileName}`
                };
            }

            // Option 1: Try to use the S3 bucket directly (works in some configurations)
            try {
                const bucketName = prefix.startsWith('uploads/')
                    ? (window.APP_CONFIG?.resumeBucket || 'skillspotter-resumes-b01006794')
                    : (window.APP_CONFIG?.jobDescBucket || 'skillspotter-jobdesc-b01006794');

                const region = window.APP_CONFIG?.region || 'us-east-1';
                const url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

                const uploadResponse = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream'
                    },
                    body: file
                });

                if (uploadResponse.ok) {
                    console.log('Direct S3 upload successful');
                    return {
                        success: true,
                        fileName: fileName,
                        key: fileName,
                        location: url
                    };
                }
            } catch (directError) {
                console.warn('Direct S3 upload failed, trying alternative method:', directError);
            }

            // Option 2: Find URLs in window config that might work
            const config = window.APP_CONFIG || {};
            if (config.s3UploadUrl) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('prefix', prefix);

                    const response = await axios.post(config.s3UploadUrl, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: progressEvent => {
                            if (onProgress) {
                                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                onProgress(percentCompleted);
                            }
                        }
                    });

                    console.log('Upload successful via configured upload URL:', response.data);
                    return {
                        success: true,
                        ...response.data
                    };
                } catch (configError) {
                    console.warn('Upload via configured URL failed:', configError);
                }
            }

            // Option 3: Try using the path directly as a fallback
            // This often works with properly configured CORS on the S3 bucket
            try {
                // Just upload to the path directly as a last resort
                const uploadUrl = `/${prefix}${fileName}`;

                const response = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream'
                    },
                    body: file
                });

                if (response.ok) {
                    console.log('Fallback upload successful');
                    return {
                        success: true,
                        fileName: fileName,
                        key: fileName
                    };
                }
            } catch (fallbackError) {
                console.error('All upload methods failed:', fallbackError);
            }

            throw new Error('Failed to upload file: all methods failed');
        } catch (error) {
            console.error('Error in uploadFile:', error);
            throw error;
        }
    }

    /**
     * Upload resume file with the correct prefix
     */
    static uploadResume(file, onProgress) {
        return this.uploadFile(file, 'uploads/', onProgress);
    }

    /**
     * Upload job description with the correct prefix
     */
    static uploadJobDescription(jobData, onProgress) {
        // Convert job data to blob
        const blob = new Blob([JSON.stringify(jobData)], {
            type: 'application/json'
        });
        const file = new File([blob], `job_${Date.now()}.json`, { type: 'application/json' });

        return this.uploadFile(file, 'jobs/', onProgress);
    }

    /**
     * Enable simulation mode for development
     */
    static enableSimulationMode() {
        window.localStorage.setItem('simulateS3Upload', 'true');
        console.log('S3 upload simulation mode enabled');
    }

    /**
     * Disable simulation mode
     */
    static disableSimulationMode() {
        window.localStorage.removeItem('simulateS3Upload');
        console.log('S3 upload simulation mode disabled');
    }
}

// Enable simulation mode in development by default
if (process.env.NODE_ENV === 'development') {
    DirectUploadService.enableSimulationMode();
}

export default DirectUploadService;