/**
 * UI module exports for the Lock In application
 */

/**
 * Shows an error message in the profile page error container
 * @param {string} message - The error message to display
 */
export function showProfileError(message) {
  const errorContainer = document.getElementById('profileErrorContainer');
  if (errorContainer) {
    errorContainer.textContent = `Problem loading profile data: ${message}`;
    errorContainer.classList.remove('hidden');
  }
}

// Export all UI rendering functions
export * from './userInfo.js';
export * from './xpData.js';
export * from './auditRatio.js';
export * from './projects.js';
export * from './skills.js';
export * from './xpProgress.js';
