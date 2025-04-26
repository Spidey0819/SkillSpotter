/**
 * SkillSpotter Runtime Configuration
 * This file is loaded before the application and injects configuration settings
 * that can be changed without rebuilding the application.
 */
window.APP_CONFIG = {
    // API Gateway URL from CloudFormation output
    apiUrl: 'https://${AuthApi}.execute-api.${AWS::Region}.amazonaws.com/prod',

    // S3 bucket names
    resumeBucket: 'skillspotter-resumes-b01006794',
    jobDescBucket: 'skillspotter-jobdesc-b01006794',

    // AWS Region
    region: 'us-east-1',

    // Environment (production, staging, development)
    environment: 'production',

    // Feature flags
    features: {
        realTimeAnalytics: true,
        skillRecommendations: true,
        notificationsEnabled: true
    },

    // Version info
    version: '1.0.0',
    buildDate: '2023-08-04'
};

// Log configuration load (for debugging)
console.log('SkillSpotter configuration loaded:', window.APP_CONFIG);