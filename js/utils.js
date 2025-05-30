/**
 * Utility functions for the Lock In application
 */

/**
 * Validates a JWT token
 * @param {string} token - The JWT token to validate
 * @returns {boolean} - Whether the token is valid
 */
export function isValidToken(token) {
  if (!token) return false;

  try {
    // JWT tokens consist of three parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) return false;

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}
