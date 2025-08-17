import * as Linking from 'expo-linking';

export interface DeepLinkData {
  type: 'reset-password' | 'unknown';
  token?: string;
}

export class DeepLinkingService {
  /**
   * Parse deep link URL and extract relevant data
   */
  static parseDeepLink(url: string): DeepLinkData {
    try {
      const parsed = Linking.parse(url);
      
      // Handle password reset links
      // Expected format: myrecipebox://reset-password?token=<jwt_token>
      if (parsed.path === 'reset-password' && parsed.queryParams) {
        const token = parsed.queryParams.token;
        
        if (typeof token === 'string' && token.length > 0) {
          return {
            type: 'reset-password',
            token,
          };
        }
      }
      
      return { type: 'unknown' };
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return { type: 'unknown' };
    }
  }

  /**
   * Validate reset token format (basic validation)
   */
  static isValidResetToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic JWT-like format validation
    // JWT typically has 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Get the initial deep link URL when app is opened
   */
  static async getInitialURL(): Promise<string | null> {
    try {
      return await Linking.getInitialURL();
    } catch (error) {
      console.error('Error getting initial URL:', error);
      return null;
    }
  }

  /**
   * Listen for deep link events while app is running
   */
  static addEventListener(callback: (data: DeepLinkData) => void): () => void {
    const subscription = Linking.addEventListener('url', (event) => {
      const data = this.parseDeepLink(event.url);
      callback(data);
    });

    return () => subscription?.remove();
  }

  /**
   * Create URL scheme configuration for Expo
   */
  static getURLScheme(): string {
    return 'myrecipebox';
  }

  /**
   * Generate a reset password deep link URL
   */
  static generateResetURL(token: string): string {
    return `myrecipebox://reset-password?token=${encodeURIComponent(token)}`;
  }
}

export const deepLinkingService = DeepLinkingService;