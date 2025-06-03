/**
 * XP data rendering for the Lock In application
 */

import { showProfileError } from './index.js';
import { formatBytes } from '../utils.js';

/**
 * Renders the XP section
 * @param {Object} userData - The processed user data
 */
export function renderXPData(userData) {
  try {
    if (!userData || !userData.xp) {
      throw new Error('XP data not available');
    }

    const xpElement = document.getElementById('totalXP');
    const levelElement = document.getElementById('level');
    const averageGradeElement = document.getElementById('averageGrade');
    const currProjectElement = document.getElementById('currentProjects');

    if (xpElement) {
      xpElement.textContent = formatBytes(userData.xp.total);
    }

    if (levelElement) {
      levelElement.textContent = userData.userInfo.level || 'N/A';
    }

    if (averageGradeElement) {
      averageGradeElement.textContent = userData.averageGrade ? userData.averageGrade.toFixed(2) : 'N/A';
    }

    if (currProjectElement) {
      if (userData.currentProjects && userData.currentProjects.length > 0) {
        currProjectElement.innerHTML = '';
        userData.currentProjects.slice(0, 3).forEach((project, index) => {
          const projectDiv = document.createElement('div');
          projectDiv.className = 'text-sm text-slate-500';
          projectDiv.textContent = `${index + 1}. ${project.name} (since ${project.daysSinceCreated} days ago)`;
          currProjectElement.appendChild(projectDiv);
        });
      } else {
        currProjectElement.textContent = 'No current projects';
      }
    }

  } catch (error) {
    console.error('Error rendering XP data:', error);
    showProfileError(error.message);

    // Set progress bar to 0% on error
    const xpProgressElement = document.getElementById('xpProgress');
    if (xpProgressElement) {
      xpProgressElement.style.width = '0%';
    }
  }
}
