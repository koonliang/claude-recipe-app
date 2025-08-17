/**
 * Validate if a string looks like a valid JWT token
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Basic JWT format validation
  // JWT typically has 3 parts separated by dots: header.payload.signature
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return false;
  }

  // Check that each part is base64url encoded (contains valid characters)
  const base64UrlPattern = /^[A-Za-z0-9_-]*$/;
  
  return parts.every(part => part.length > 0 && base64UrlPattern.test(part));
}

/**
 * Extract basic claims from JWT without verification (for display purposes only)
 * WARNING: This should NOT be used for security validation
 */
export function extractJWTClaims(token: string): { exp?: number; iat?: number; [key: string]: any } | null {
  try {
    if (!isValidJWTFormat(token)) {
      return null;
    }

    const parts = token.split('.');
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64url
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error extracting JWT claims:', error);
    return null;
  }
}

/**
 * Check if JWT token appears to be expired (client-side check only)
 * WARNING: This should NOT be used for security validation, only for UX
 */
export function isJWTExpired(token: string): boolean {
  const claims = extractJWTClaims(token);
  
  if (!claims || typeof claims.exp !== 'number') {
    return true; // Assume expired if we can't read expiration
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return claims.exp < currentTime;
}