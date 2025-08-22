import Constants from 'expo-constants';

export interface AppConfig {
  anonymousMode: boolean;
  apiBaseUrl: string;
  appName: string;
  version: string;
}

// Get configuration from environment variables or use defaults
const getConfig = (): AppConfig => {
  const extra = Constants.expoConfig?.extra || {};
  
  return {
    // Anonymous mode can be enabled via environment variable
    anonymousMode: extra.anonymousMode === true || process.env.EXPO_PUBLIC_ANONYMOUS_MODE === 'true',
    
    // API configuration - for Lambda deployment, base URL should be the API Gateway URL without path
    apiBaseUrl: extra.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    
    // App metadata
    appName: Constants.expoConfig?.name || 'MyRecipeBox',
    version: Constants.expoConfig?.version || '1.0.0',
  };
};

export const appConfig = getConfig();

// Helper functions for feature checks
export const isAnonymousModeEnabled = (): boolean => appConfig.anonymousMode;
export const shouldUseRealAPI = (): boolean => !appConfig.anonymousMode;

// Development helpers
export const getConfigInfo = () => ({
  mode: appConfig.anonymousMode ? 'Anonymous Demo' : 'Authenticated',
  apiUrl: appConfig.apiBaseUrl,
  version: appConfig.version,
});