/**
 * Projects rendering for the Lock In application
 */

import { showProfileError } from './index.js';

/**
 * Renders the project success ratio section
 * @param {Object} userData - The processed user data
 */
export function renderProjectSuccess(userData) {
  console.log("Rendering project success with userData: ", userData);
  try {
    if (!userData || !userData.projects) {
      throw new Error('Project data not available');
    }

    const passedElement = document.getElementById('projectsPassed');
    const failedElement = document.getElementById('projectsFailed');
    const successRateElement = document.getElementById('projectSuccessRate');

    if (passedElement) {
      passedElement.textContent = userData.projects.passed;
    }

    if (failedElement) {
      failedElement.textContent = userData.projects.failed;
    }

    if (successRateElement) {
      successRateElement.textContent = `${Math.round(userData.projects.successRate)}%`;
    }

    // Calculate angles for pie chart
    const totalProjects = userData.projects.passed + userData.projects.failed;
    let passedPercentage = 0;
    let failedPercentage = 0;

    if (totalProjects > 0) {
      passedPercentage = (userData.projects.passed / totalProjects) * 100;
      failedPercentage = (userData.projects.failed / totalProjects) * 100;
    }

    // Update pie chart
    const successSlice = document.getElementById('successSlice');
    const failSlice = document.getElementById('failSlice');

    if (successSlice && failSlice) {
      if (totalProjects === 0) {
        // No projects data - show 50/50 split with gray colors
        successSlice.setAttribute('d', 'M 100 100 L 100 50 A 50 50 0 0 1 150 100 Z');
        failSlice.setAttribute('d', 'M 100 100 L 150 100 A 50 50 0 0 1 100 50 Z');
        successSlice.setAttribute('fill', '#94a3b8'); // slate-400
        failSlice.setAttribute('fill', '#cbd5e1'); // slate-300
      } else {
        // Calculate angles for the pie slices
        const passedAngle = 3.6 * passedPercentage;

        if (passedPercentage === 100) {
          // All passed
          successSlice.setAttribute('d', 'M 100 100 L 100 50 A 50 50 0 1 1 99.99 50 Z');
          failSlice.setAttribute('d', '');
        } else if (passedPercentage === 0) {
          // All failed
          successSlice.setAttribute('d', '');
          failSlice.setAttribute('d', 'M 100 100 L 100 50 A 50 50 0 1 1 99.99 50 Z');
        } else {
          // Mixed results
          const endX = 100 + 50 * Math.sin(Math.PI * 2 * (passedAngle / 360));
          const endY = 100 - 50 * Math.cos(Math.PI * 2 * (passedAngle / 360));

          successSlice.setAttribute('d', `M 100 100 L 100 50 A 50 50 0 ${passedAngle > 180 ? 1 : 0} 1 ${endX} ${endY} Z`);
          failSlice.setAttribute('d', `M 100 100 L ${endX} ${endY} A 50 50 0 ${passedAngle > 180 ? 0 : 1} 1 100 50 Z`);
        }

        // Reset colors
        successSlice.setAttribute('fill', '#22C55E'); // green-500
        failSlice.setAttribute('fill', '#ef4444'); // red-500
      }
    }
  } catch (error) {
    console.error('Error rendering project success:', error);
  }
}

/**
 * Renders the XP by project section
 * @param {Object} userData - The processed user data
 */
export function renderXPByProject(userData) {
  try {
    if (!userData || !userData.xp || !userData.xp.byProject || !userData.xp.byProject.length) {
      throw new Error('XP by project data not available');
    }

    const container = document.getElementById('xpByProjectContainer');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Find max value for scaling
    const maxXP = Math.max(...userData.xp.byProject.map(([, xp]) => xp));

    // Define colors for variety
    const colors = ['blue-600', 'green-500', 'purple-500', 'yellow-500', 'red-500'];

    // Create project bars
    userData.xp.byProject.forEach(([project, xp], index) => {
      const color = colors[index % colors.length];

      const percentage = Math.round((xp / maxXP) * 100);

      const projectDiv = document.createElement('div');
      projectDiv.className = 'flex items-center gap-4';
      projectDiv.innerHTML = `
        <div class="w-24 font-mono text-sm text-slate-500">${project}</div>
        <div class="flex-1 bg-slate-200 h-5 border-2 border-blue-200">
          <div class="bg-${color} h-full" style="width: ${percentage}%"></div>
        </div>
        <div class="w-16 font-mono text-sm font-bold text-${color}">${xp.toLocaleString()}</div>
      `;

      container.appendChild(projectDiv);
    });
  } catch (error) {
    console.error('Error rendering XP by project:', error);
    const container = document.getElementById('xpByProjectContainer');
    if (container) {
      container.innerHTML = '<div class="text-center text-slate-500 py-8">XP by project data unavailable</div>';
    }
  }
}
