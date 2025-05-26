import { GET_COMPLETE_USER_DATA } from "./graphqlQuery.js";
import { processUserData } from "./graphqlQuery.js";
let currentUserId = null;
let isDarkMode = false;
const GRAPHQL_ENDPOINT = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';

// Loading state management
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<span class="animate-pulse">Loading...</span>';
    element.classList.add('loading');
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('loading');
  }
}

// Error handling for UI elements
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<span class="text-red-500">${message || 'Error loading data'}</span>`;
    element.classList.add('error');
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
    document.getElementById('Level').textContent = userData.userInfo.level || 'N/A';
  } catch (error) {
    console.error('Error rendering user info:', error);
    showError('Login', 'Error');
    showError('FullName', 'Error');
    showError('Email', 'Error');
    showError('Campus', 'Error');
    showError('Level', 'Error');
  }
}

// Render XP section
function renderXPData(userData) {
  try {
    if (!userData || !userData.xp) {
      throw new Error('XP data not available');
    }
    
    const xpElement = document.getElementById('totalXP');
    const xpProgressElement = document.getElementById('xpProgress');
    const xpNextLevelElement = document.getElementById('xpNextLevel');
    
    if (xpElement) {
      xpElement.textContent = `${userData.xp.total.toLocaleString()} XP`;
    }
    
    // Calculate progress to next level (simplified example)
    const currentLevel = parseInt(userData.userInfo.level) || 0;
    const nextLevelXP = (currentLevel + 1) * 10000; // Simplified calculation
    const currentLevelXP = currentLevel * 10000;
    const xpToNextLevel = nextLevelXP - currentLevelXP;
    const currentProgress = userData.xp.total - currentLevelXP;
    const progressPercentage = Math.min(Math.round((currentProgress / xpToNextLevel) * 100), 100);
    
    if (xpProgressElement) {
      xpProgressElement.style.width = `${progressPercentage}%`;
    }
    
    if (xpNextLevelElement) {
      xpNextLevelElement.textContent = `${progressPercentage}% to next level`;
    }
  } catch (error) {
    console.error('Error rendering XP data:', error);
    showError('totalXP', 'XP data unavailable');
    showError('xpNextLevel', 'Progress data unavailable');
    
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
    const summaryElement = document.getElementById('auditSummary');
    
    if (ratioElement) {
      ratioElement.textContent = userData.auditRatio.ratio.toFixed(2);
    }
    
    if (givenElement) {
      givenElement.textContent = userData.auditRatio.given;
    }
    
    if (receivedElement) {
      receivedElement.textContent = userData.auditRatio.received;
    }
    
    if (summaryElement) {
      summaryElement.textContent = `Done: ${userData.auditRatio.given} | Received: ${userData.auditRatio.received}`;
    }
  } catch (error) {
    console.error('Error rendering audit ratio:', error);
    showError('auditRatioValue', 'N/A');
    showError('auditsGiven', 'N/A');
    showError('auditsReceived', 'N/A');
    showError('auditSummary', 'Audit data unavailable');
  }
}

// Render Project Success Ratio
function renderProjectSuccess(userData) {
  try {
    if (!userData || !userData.projects) {
      throw new Error('Project data not available');
    }
    
    const passedElement = document.getElementById('projectsPassed');
    const failedElement = document.getElementById('projectsFailed');
    const successRateElement = document.getElementById('projectSuccessRate');
    
    // Update the pie chart
    const successSlice = document.getElementById('successSlice');
    const failSlice = document.getElementById('failSlice');
    
    if (passedElement) {
      passedElement.textContent = userData.projects.passed;
    }
    
    if (failedElement) {
      failedElement.textContent = userData.projects.failed;
    }
    
    if (successRateElement) {
      successRateElement.textContent = `${Math.round(userData.projects.successRate)}%`;
    }
    
    // Update pie chart (this is a simplified approach - in a real app you might use a charting library)
    if (successSlice && failSlice) {
      const successAngle = 3.6 * userData.projects.successRate;
      const successPath = describeArc(100, 100, 50, 0, successAngle);
      const failPath = describeArc(100, 100, 50, successAngle, 360);
      
      successSlice.setAttribute('d', `M 100 100 L 100 50 ${successPath} Z`);
      failSlice.setAttribute('d', `M 100 100 ${failPath} L 100 50 Z`);
    }
  } catch (error) {
    console.error('Error rendering project success:', error);
    showError('projectsPassed', 'N/A');
    showError('projectsFailed', 'N/A');
    showError('projectSuccessRate', 'N/A');
  }
}

// Helper function for pie chart path calculation
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${start.x} ${start.y}`;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

// Render XP Progress Chart
function renderXPProgressChart(userData) {
  try {
    if (!userData || !userData.xp || !userData.xp.overTime) {
      throw new Error('XP over time data not available');
    }
    
    const chartContainer = document.getElementById('xpProgressChart');
    if (!chartContainer) return;
    
    const months = Object.keys(userData.xp.overTime);
    const values = Object.values(userData.xp.overTime);
    
    if (months.length === 0) {
      throw new Error('No XP time data available');
    }
    
    // Find max value for scaling
    const maxXP = Math.max(...values);
    
    // Generate points for the polyline
    let points = '';
    const width = 400;
    const height = 200;
    const padding = 20;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    months.forEach((month, index) => {
      const x = padding + (index * (availableWidth / (months.length - 1)));
      const y = height - padding - ((values[index] / maxXP) * availableHeight);
      points += `${x},${y} `;
    });
    
    // Update the polyline
    const polyline = chartContainer.querySelector('polyline');
    if (polyline) {
      polyline.setAttribute('points', points.trim());
    }
    
    // Update data points (circles)
    const circles = chartContainer.querySelectorAll('circle');
    months.forEach((month, index) => {
      if (circles[index]) {
        const x = padding + (index * (availableWidth / (months.length - 1)));
        const y = height - padding - ((values[index] / maxXP) * availableHeight);
        circles[index].setAttribute('cx', x);
        circles[index].setAttribute('cy', y);
      }
    });
    
    // Update month labels
    const texts = chartContainer.querySelectorAll('text[data-type="month"]');
    months.forEach((month, index) => {
      if (index % Math.ceil(months.length / 5) === 0 && texts[index / Math.ceil(months.length / 5)]) {
        const x = padding + (index * (availableWidth / (months.length - 1)));
        texts[index / Math.ceil(months.length / 5)].setAttribute('x', x);
        texts[index / Math.ceil(months.length / 5)].textContent = month;
      }
    });
    
    // Update y-axis labels
    const yLabels = chartContainer.querySelectorAll('text[data-type="y-value"]');
    if (yLabels.length >= 3) {
      yLabels[0].textContent = '0';
      yLabels[1].textContent = `${Math.round(maxXP / 2 / 1000)}k`;
      yLabels[2].textContent = `${Math.round(maxXP / 1000)}k`;
    }
  } catch (error) {
    console.error('Error rendering XP progress chart:', error);
    const chartContainer = document.getElementById('xpProgressChart');
    if (chartContainer) {
      chartContainer.innerHTML = '<text x="200" y="100" text-anchor="middle" class="text-red-500">Chart data unavailable</text>';
    }
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

// Main function to load and render all profile data
async function loadProfileData(token) {
  // Show loading state for all sections
  const sections = ['Login', 'FullName', 'Email', 'Campus', 'Level', 'totalXP', 'auditRatioValue'];
  sections.forEach(section => showLoading(section));
  
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
    
  } catch (error) {
    console.error('Failed to load profile data:', error);
    showProfileError(`Failed to load profile data: ${error.message}`);
    
    // Show error state for all sections
    sections.forEach(section => showError(section, 'Data unavailable'));
  } finally {
    // Hide loading indicators
    sections.forEach(section => hideLoading(section));
  }
}

window.addEventListener('DOMContentLoaded', function () {
    const storedToken = localStorage.getItem('jwt');
    const storedLoginTime = localStorage.getItem('loginTime');

    if (storedToken && storedLoginTime) {
        const jwt = storedToken;

        // Decode to get user info
        try {
            const payloadBase64 = jwt.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            
            if (decodedPayload.exp * 1000 < Date.now()) {
                console.log('Session expired.');
                Logout();
                return;
            }
            
            currentUserId = decodedPayload.id;

            // Show profile page first (better UX than showing a blank page)
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('profilePage').classList.remove('hidden');
            
            // Load profile data
            loadProfileData(jwt);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            showError('errorMessage', 'Invalid session token. Please log in again.');
            Logout();
        }
    }
});

// Dark mode toggle
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

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const identifier = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!identifier || !password) {
        document.getElementById('errorMessage').textContent = 'Please enter both username/email and password.';
        document.getElementById('errorMessage').classList.remove('hidden');
        return;
    }

    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';
    submitButton.disabled = true;

    try {
        const credentials = btoa(`${identifier}:${password}`);
        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }

        const jwt = await response.json();
        // Store JWT and time in local storage for session management
        localStorage.setItem('jwt', jwt);
        localStorage.setItem('loginTime', Date.now());

        // Decode JWT to get user info (just payload part)
        const payloadBase64 = jwt.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        currentUserId = decodedPayload.sub;

        // Hide error and switch to profile page
        document.getElementById('errorMessage').classList.add('hidden');
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('profilePage').classList.remove('hidden');
        
        // Load profile data
        loadProfileData(jwt);

    } catch (err) {
        console.error('Login error:', err);
        document.getElementById('errorMessage').textContent = err.message || 'Login failed. Please check your credentials and try again.';
        document.getElementById('errorMessage').classList.remove('hidden');
    } finally {
        // Restore button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});

function Logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('loginTime');
    currentUserId = null;

    document.getElementById('profilePage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');

    // Clear form
    document.getElementById('loginForm').reset();
    document.getElementById('errorMessage').classList.add('hidden');
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', Logout);

// Add some interactive hover effects for SVG elements
document.querySelectorAll('circle, path, polyline').forEach(element => {
    element.addEventListener('mouseenter', function () {
        this.style.opacity = '0.5';
        this.style.transform = 'scale(1.01)';
        this.style.transformOrigin = 'center';
        this.style.transition = 'all 0.15s ease';
    });

    element.addEventListener('mouseleave', function () {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    });
});
