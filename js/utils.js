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

/**
 * Generates a "nice" scale for a given range
 * @param {number} min - The minimum value of the range
 * @param {number} max - The maximum value of the range
 * @param {number} numSteps - Desired number of steps in the scale
 * @returns {Object} - An object containing niceMin, niceMax, and step
 */
export function getNiceScale(min, max, numSteps = 5) {
  const range = max - min;
  const rawStep = range / numSteps;

  // Determine step size in powers of 10
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  let step = magnitude;

  // Round step to a nice value (1, 2, 5, or 10 * magnitude)
  if (rawStep / magnitude > 5) {
    step = 10 * magnitude;
  } else if (rawStep / magnitude > 2) {
    step = 5 * magnitude;
  } else if (rawStep / magnitude > 1) {
    step = 2 * magnitude;
  }

  // Adjust min and max to align with step
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  return { niceMin, niceMax, step };
}
