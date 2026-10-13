// Authentication helper functions

// Get auth token from storage
function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Get user info from storage
function getUserInfo() {
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Set auth token and user info
function setAuthData(token, user, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('authToken', token);
  storage.setItem('user', JSON.stringify(user));
}

// Clear auth data (logout)
function clearAuthData() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Logout function
function logout() {
  clearAuthData();
  window.location.href = 'login.html';
}

// Verify token with backend
async function verifyAuthToken() {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.success;
    }

    return false;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

// Protect page - redirect to login if not authenticated
async function requireAuth() {
  // Skip auth check on login page
  if (window.location.pathname.includes('login.html')) {
    return;
  }

  const token = getAuthToken();

  if (!token) {
    // No token, redirect to login
    window.location.href = 'login.html';
    return;
  }

  // Verify token with backend (optional, but recommended)
  const isValid = await verifyAuthToken();

  if (!isValid) {
    // Token invalid or expired
    clearAuthData();
    window.location.href = 'login.html';
  }
}

// Add Authorization header to API requests
function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Enhanced apiRequest with auth headers
async function authenticatedApiRequest(url, options = {}, retries = 3) {
  const authHeaders = getAuthHeaders();

  const enhancedOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    }
  };

  try {
    return await apiRequest(url, enhancedOptions, retries);
  } catch (error) {
    // If 401 Unauthorized, logout and redirect to login
    if (error.message.includes('401') || error.message.includes('Token')) {
      clearAuthData();
      window.location.href = 'login.html';
    }
    throw error;
  }
}

// Initialize auth check on page load
if (typeof API_URL !== 'undefined') {
  // Only run auth check if not on login page
  if (!window.location.pathname.includes('login.html')) {
    requireAuth();
  }
}
