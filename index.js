import { GET_COMPLETE_USER_DATA } from "./graphqlQuery.js";
import { processUserData } from "./graphqlQuery.js";
let currentUserId = null;
let isDarkMode = false;
const GRAPHQL_ENDPOINT = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';

// JWT token validation
function isValidToken(token) {
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


// Global error handler for the profile page
function showProfileError(message) {
  const errorContainer = document.getElementById('profileErrorContainer');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }
}

async function fetchGraphQL(query, token) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: query
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }

    return data.data;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    throw error;
  }
}

async function getUserProfileData(token) {
  try {
    const data = await fetchGraphQL(GET_COMPLETE_USER_DATA, token);
    return processUserData(data);
  } catch (error) {
    console.error('Error fetching user profile data:', error);
    throw error;
  }
}

// Render user info section
function renderUserInfo(userData) {
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
    showProfileError(`Problem loading profile data: ${error.message}`);
  }
}

// Render XP section
function renderXPData(userData) {
  try {
    if (!userData || !userData.xp) {
      throw new Error('XP data not available');
    }

    const xpElement = document.getElementById('totalXP');
    const levelElement = document.getElementById('level');
    const averageGradeElement = document.getElementById('averageGrade');
    const currProjectElement = document.getElementById('currentProjects');

    if (xpElement) {
      xpElement.textContent = `${userData.xp.total.toLocaleString()} XP`;
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
    showProfileError(`Failed to load profile data: ${error.message}`);

    // Set progress bar to 0% on error
    const xpProgressElement = document.getElementById('xpProgress');
    if (xpProgressElement) {
      xpProgressElement.style.width = '0%';
    }
  }
}

// Render Audit Ratio section
function renderAuditRatio(userData) {
  try {
    if (!userData || !userData.auditRatio) {
      throw new Error('Audit ratio data not available');
    }

    const ratioElement = document.getElementById('auditRatioValue');
    const givenElement = document.getElementById('auditsGiven');
    const receivedElement = document.getElementById('auditsReceived');

    if (ratioElement) {
      ratioElement.textContent = userData.auditRatio.ratio.toFixed(2);
    }

    if (givenElement) {
      givenElement.textContent = userData.auditRatio.giventoLocaleString();
    }

    if (receivedElement) {
      receivedElement.textContent = userData.auditRatio.receivedtoLocaleString();
    }
  } catch (error) {
    console.error('Error rendering audit ratio:', error);
    showProfileError(`Failed to load profile data: ${error.message}`);
  }
}

// Render Project Success Ratio
function renderProjectSuccess(userData) {
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

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}
function renderXPProgressChart(userData) {
  const chartContainer = document.getElementById('xpProgressChart');
  if (!chartContainer) return;

  chartContainer.innerHTML = '';

  // Set up chart dimensions
  const width = 400;
  const height = 200;
  const padding = { left: 50, right: 20, top: 20, bottom: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Create SVG with proper namespace
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  chartContainer.appendChild(svg);

  if (!userData || !userData.xp || !userData.xp.overTime || Object.keys(userData.xp.overTime).length === 0) {
    return;
  }

  try {
    const overTime = userData.xp.overTime;

    // Generate last 12 months including current month
    const monthsToDisplay = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i);
      const label = date.toLocaleString('default', { month: 'short' }) + ' ' + String(date.getFullYear()).slice(-2);
      monthsToDisplay.push(label);
    }

    // Map values for those months (plateau if missing)
    const displayValues = [];
    let lastKnownValue = 0;
    monthsToDisplay.forEach(month => {
      if (overTime[month] !== undefined) {
        lastKnownValue = overTime[month];
      }
      displayValues.push(lastKnownValue);
    });

    // Calculate dynamic scale
    const minXP = Math.min(...displayValues);
    const maxXP = Math.max(...displayValues);
    const xpRange = maxXP - minXP;

    // Add some padding to the range (10% on each side)
    const padding_percent = 0.1;
    const scaledMin = Math.max(0, minXP - (xpRange * padding_percent));
    const scaledMax = maxXP + (xpRange * padding_percent);
    const finalRange = scaledMax - scaledMin;

    // Calculate positions
    const xStep = chartWidth / (monthsToDisplay.length - 1);

    // Create defs for grid pattern
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // Draw background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', padding.left);
    background.setAttribute('y', padding.top);
    background.setAttribute('width', chartWidth);
    background.setAttribute('height', chartHeight);
    background.setAttribute('fill', '#f8fafc');
    background.setAttribute('stroke', '#e2e8f0');
    svg.appendChild(background);

    // Draw horizontal grid lines and Y-axis labels
    const numYGridLines = 5;
    for (let i = 0; i <= numYGridLines; i++) {
      const y = padding.top + (i * chartHeight / numYGridLines);
      const value = scaledMax - (i * finalRange / numYGridLines);

      // Grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', padding.left + chartWidth);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#e2e8f0');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // Y-axis label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'text-xs font-mono fill-slate-600');

      // Format the value nicely
      let formattedValue;
      if (value >= 1000) {
        formattedValue = (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'k';
      } else {
        formattedValue = Math.round(value).toString();
      }
      text.textContent = formattedValue;
      svg.appendChild(text);
    }

    // Draw vertical grid lines for each month
    monthsToDisplay.forEach((month, index) => {
      const x = padding.left + (index * xStep);

      // Vertical grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', padding.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', padding.top + chartHeight);
      line.setAttribute('stroke', '#e2e8f0');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // X-axis label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', height - padding.bottom + 15);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'text-xs font-mono fill-slate-600');
      text.textContent = month.split(' ')[0]; // Just the month abbreviation
      svg.appendChild(text);
    });

    // Plot the data line and points
    let points = '';
    const circles = [];

    monthsToDisplay.forEach((month, index) => {
      const x = padding.left + (index * xStep);
      const normalizedValue = (displayValues[index] - scaledMin) / finalRange;
      const y = padding.top + chartHeight - (normalizedValue * chartHeight);

      points += `${x},${y} `;

      // Create circle for data point
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#2563eb');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circles.push(circle);
    });

    // Draw the connecting line
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#2563eb');
    polyline.setAttribute('stroke-width', '3');
    polyline.setAttribute('points', points.trim());
    svg.appendChild(polyline);

    // Add the circles on top
    circles.forEach(circle => svg.appendChild(circle));

  } catch (error) {
    console.error('Error rendering XP progress chart:', error);
  }
}

// Render XP by Project
function renderXPByProject(userData) {
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
        <div class="flex-1 bg-slate-200 h-6 border-2 border-blue-200">
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
      container.innerHTML = '<div class="text-red-500 p-4">Project XP data unavailable</div>';
    }
  }
}

// Render Skills Overview
function renderSkillsOverview(userData) {
  try {
    if (!userData || !userData.skills || !userData.skills.length) {
      throw new Error('Skills data not available');
    }

    const container = document.getElementById('skillsOverview');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Find max value for scaling
    const maxSkill = Math.max(...userData.skills.map(skill => skill.amount));

    // Define colors for variety
    const colors = ['blue-600', 'green-500', 'purple-500', 'yellow-500', 'red-500'];

    // Sort skills by amount (highest first)
    const sortedSkills = [...userData.skills].sort((a, b) => b.amount - a.amount);
    console.log("sorted skills: ", sortedSkills)

    // Create skill bars
    sortedSkills.forEach((skill, index) => {
      const color = colors[index % colors.length];
      const skillName = skill.type.replace('skill_', '');
      const percentage = Math.round((skill.amount / maxSkill) * 100);

      const skillDiv = document.createElement('div');
      skillDiv.className = 'space-y-3';
      skillDiv.innerHTML = `
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-slate-500">${skillName}</span>
            <span class="text-${color} font-bold">${percentage}%</span>
          </div>
          <div class="bg-slate-200 h-2 border border-blue-200">
            <div class="bg-${color} h-full" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;

      container.appendChild(skillDiv);
    });
  } catch (error) {
    console.error('Error rendering skills overview:', error);
    const container = document.querySelector('.bg-slate-50.border-2.border-blue-200.p-6 .grid.grid-cols-2.gap-4.font-mono.text-sm');
    if (container) {
      container.innerHTML = '<div class="text-red-500 p-4 col-span-2">Skills data unavailable</div>';
    }
  }
}

// Main function to load and render all profile data
async function loadProfileData(token) {
  // Hide any previous errors
  document.getElementById('profileErrorContainer')?.classList.add('hidden');

  try {
    const userData = await getUserProfileData(token);
    console.log('User data loaded:', userData);

    // Render each section
    renderUserInfo(userData);
    renderXPData(userData);
    renderAuditRatio(userData);
    renderProjectSuccess(userData);
    renderXPProgressChart(userData);
    renderXPByProject(userData);
    renderSkillsOverview(userData);
  } catch (error) {
    console.error('Failed to load profile data:', error);
    showProfileError(`Failed to load profile data: ${error.message}`);
    renderXPProgressChart(null);
    renderProjectSuccess(null);
  }
}

// Login form handling
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  if (!username || !password) {
    errorMessage.textContent = 'Please enter both username and password.';
    errorMessage.classList.remove('hidden');
    return;
  }

  try {
    const credentials = btoa(`${username}:${password}`);

    const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid username or password.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Unexpected error (${response.status}).`);
      }
    }

    const token = await response.json();

    if (!token) {
      throw new Error('No token received from server.');
    }

    localStorage.setItem('jwt_token', token);

    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('profilePage').classList.remove('hidden');

    await loadProfileData(token);

  } catch (error) {
    console.error('Login error:', error);
    errorMessage.textContent = error.message || 'An unexpected error occurred.';
    errorMessage.classList.remove('hidden');
  }
});

// Logout button handling
document.getElementById('logoutBtn')?.addEventListener('click', function () {
  // Clear token and user data
  localStorage.removeItem('jwt_token');

  // Show login page and hide profile
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('profilePage').classList.add('hidden');
});

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.body.className = 'bg-slate-900 text-slate-300 min-h-screen transition-colors duration-300';
    // Update all cards
    document.querySelectorAll('.bg-slate-50').forEach(el => {
      el.className = el.className.replace('bg-slate-50', 'bg-slate-800');
    });
    document.querySelectorAll('.border-blue-200').forEach(el => {
      el.className = el.className.replace('border-blue-200', 'border-slate-600');
    });
    document.querySelectorAll('.text-slate-900').forEach(el => {
      el.className = el.className.replace('text-slate-900', 'text-slate-100');
    });
    document.querySelectorAll('.bg-slate-200').forEach(el => {
      if (!el.querySelector('.bg-green-500, .bg-blue-600, .bg-purple-500, .bg-yellow-500, .bg-red-500, .bg-cyan-500, .bg-pink-500')) {
        el.className = el.className.replace('bg-slate-200', 'bg-blue-200');
      }
    });
  } else {
    document.body.className = 'bg-slate-200 text-blue-200 min-h-screen transition-colors duration-300';
    // Revert all cards
    document.querySelectorAll('.bg-slate-800').forEach(el => {
      el.className = el.className.replace('bg-slate-800', 'bg-slate-50');
    });
    document.querySelectorAll('.border-slate-600').forEach(el => {
      el.className = el.className.replace('border-slate-600', 'border-blue-200');
    });
    document.querySelectorAll('.text-slate-100').forEach(el => {
      el.className = el.className.replace('text-slate-100', 'text-slate-900');
    });
    document.querySelectorAll('.bg-blue-200').forEach(el => {
      if (!el.querySelector('.bg-green-500, .bg-blue-600, .bg-purple-500, .bg-yellow-500, .bg-red-500, .bg-cyan-500, .bg-pink-500')) {
        el.className = el.className.replace('bg-blue-200', 'bg-slate-200');
      }
    });
  }
}

// Event listeners
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
document.getElementById('darkModeToggleProfile').addEventListener('click', toggleDarkMode);

// Initialize page on load
document.addEventListener('DOMContentLoaded', async function () {

  // Check for existing token
  const token = localStorage.getItem('jwt_token');

  // Check token validity and show appropriate page
  if (isValidToken(token)) {
    // Valid token - show profile page
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('profilePage').classList.remove('hidden');

    // Load profile data
    await loadProfileData(token);
  } else {
    // Invalid or no token - show login page
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('profilePage').classList.add('hidden');

    // Clear any existing token
    localStorage.removeItem('jwt_token');
  }
});
