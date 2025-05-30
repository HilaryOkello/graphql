/**
 * User information rendering for the Lock In application
 */

import { showProfileError } from './index.js';

/**
 * Renders the user information section
 * @param {Object} userData - The processed user data
 */
export function renderUserInfo(userData) {
  try {
    if (!userData || !userData.userInfo) {
      throw new Error('User information not available');
    }

    document.getElementById('Login').textContent = userData.userInfo.login || 'N/A';
    document.getElementById('FullName').textContent = userData.userInfo.fullName || 'N/A';
    document.getElementById('Email').textContent = userData.userInfo.email || 'N/A';
    document.getElementById('Campus').textContent = userData.userInfo.campus || 'N/A';
  } catch (error) {
    console.error('Error rendering user info:', error);
    showProfileError(error.message);
  }
}
