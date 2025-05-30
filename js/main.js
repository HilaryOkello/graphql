/**
 * Main application entry point for the Lock In application
 */

import { isValidToken } from './utils.js';
import { handleLogin, handleLogout, getToken } from './auth.js';
import { getUserProfileData } from './api.js';
import * as UI from './ui/index.js';

/**
 * Main function to load and render all profile data
 * @param {string} token - The JWT token for authentication
 */
export async function loadProfileData(token) {
  // Hide any previous errors
  document.getElementById('profileErrorContainer')?.classList.add('hidden');

  try {
    const userData = await getUserProfileData(token);
    console.log('User data loaded:', userData);

    // Render each section
    UI.renderUserInfo(userData);
    UI.renderXPData(userData);
    UI.renderAuditRatio(userData);
    UI.renderProjectSuccess(userData);
    UI.renderXPProgressChart(userData);
    UI.renderXPByProject(userData);
    UI.renderSkillsOverview(userData);
  } catch (error) {
    console.error('Failed to load profile data:', error);
    UI.showProfileError(error.message);
    UI.renderXPProgressChart(null);
    UI.renderProjectSuccess(null);
  }
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', async function () {
  const token = getToken();

  if (isValidToken(token)) {
    document.getElementById('profilePage').classList.remove('hidden');

    await loadProfileData(token);
  } else {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('profilePage').classList.add('hidden');

    localStorage.removeItem('jwt_token');
  }

  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
});
