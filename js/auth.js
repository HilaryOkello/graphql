/**
 * Authentication related functionality for the Lock In application
 */

import { loadProfileData } from './main.js';

/**
 * Handles the login form submission
 * @param {Event} e - The form submission event
 */
export async function handleLogin(e) {
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
    errorMessage.textContent = `An unexpected error occurred: ${error.message}` || 'An unexpected error occurred.';
    errorMessage.classList.remove('hidden');
  }
}

/**
 * Handles user logout
 */
export function handleLogout() {
  localStorage.removeItem('jwt_token');

  // Show login page and hide profile
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('profilePage').classList.add('hidden');
}

/**
 * Gets the stored JWT token
 * @returns {string|null} - The stored JWT token or null if not found
 */
export function getToken() {
  return localStorage.getItem('jwt_token');
}
