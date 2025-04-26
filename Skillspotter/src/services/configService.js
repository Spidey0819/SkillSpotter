// src/services/configService.js
// Service to retrieve configuration values

// Function to get the API URL from the global config or environment
export const getApiUrl = () => {
    // Check if we have a global config injected by the deployment
    if (window.APP_CONFIG && window.APP_CONFIG.apiUrl) {
        return window.APP_CONFIG.apiUrl;
    }

    // Fallback to environment variables (for local development)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Last resort fallback
    console.warn('No API URL configured, falling back to default');
    return 'http://localhost:5000/api';
};

// Function to get environment name
export const getEnvironment = () => {
    if (window.APP_CONFIG && window.APP_CONFIG.environment) {
        return window.APP_CONFIG.environment;
    }
    return import.meta.env.MODE || 'development';
};

// Function to get AWS region
export const getRegion = () => {
    if (window.APP_CONFIG && window.APP_CONFIG.region) {
        return window.APP_CONFIG.region;
    }
    return import.meta.env.VITE_AWS_REGION || 'us-east-1';
};

// Helper to check if we're in a production environment
export const isProduction = () => {
    return getEnvironment() === 'production';
};

// Export a default config object with all settings
const config = {
    apiUrl: getApiUrl(),
    environment: getEnvironment(),
    region: getRegion(),
    isProduction: isProduction()
};

export default config;