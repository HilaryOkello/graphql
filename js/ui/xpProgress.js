/**
 * XP Progress Chart rendering for the Lock In application
 */

import { getNiceScale } from '../utils.js';

/**
 * Renders the XP progress chart
 * @param {Object} userData - The processed user data
 */
export function renderXPProgressChart(userData) {
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

    const minXP = Math.min(...displayValues);
    const maxXP = Math.max(...displayValues);

    // Add 10% padding before computing scale
    const paddedMin = Math.max(0, minXP - (maxXP - minXP) * 0.1);
    const paddedMax = maxXP + (maxXP - minXP) * 0.1;

    const { niceMin: scaledMin, niceMax: scaledMax, step: yStep } = getNiceScale(paddedMin, paddedMax);
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
    const numYGridLines = Math.round(finalRange / yStep);
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

      // Create tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${monthsToDisplay[index]}: ${displayValues[index].toLocaleString()} XP`;
      circle.appendChild(title);

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
