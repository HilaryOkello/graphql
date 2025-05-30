/**
 * Audit ratio rendering for the Lock In application
 */

import { showProfileError } from './index.js';

/**
 * Renders the audit ratio section
 * @param {Object} userData - The processed user data
 */
export function renderAuditRatio(userData) {
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
      givenElement.textContent = userData.auditRatio.given.toLocaleString();
    }

    if (receivedElement) {
      receivedElement.textContent = userData.auditRatio.received.toLocaleString();
    }
  } catch (error) {
    console.error('Error rendering audit ratio:', error);
    showProfileError(error.message);
  }
}
