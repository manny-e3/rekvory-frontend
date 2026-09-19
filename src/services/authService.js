// Sovereign Recovery - Authentication Service
// Implements the official Auth API specification:
// Base Path: /api/v1/auth
// Envelope: { status, message, data, meta, code?, errors? }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class AuthAPIError extends Error {
  constructor(message, status, code, errors = null) {
    super(message);
    this.name = 'AuthAPIError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Standard HTTP Request handler with API envelope handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || `Request failed with status ${response.status}`;
      const code = data?.code || (response.status === 401 ? 'UNAUTHORIZED' : response.status === 403 ? 'FORBIDDEN' : 'API_ERROR');
      const errors = data?.errors || null;
      throw new AuthAPIError(message, response.status, code, errors);
    }

    return data;
  } catch (err) {
    if (err instanceof AuthAPIError) {
      throw err;
    }

    throw new AuthAPIError(err.message || 'Network error: unable to reach authentication server.', 503, 'NETWORK_ERROR');
  }
}

// Token storage helpers
export function getAuthToken() {
  try {
    return localStorage.getItem('sr_auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('sr_auth_token', token);
    } else {
      localStorage.removeItem('sr_auth_token');
    }
  } catch (err) {
    console.warn('Failed to store auth token:', err);
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem('sr_auth_token');
  } catch (err) {
    console.warn('Failed to clear auth token:', err);
  }
}

// Service exports
export const authService = {
  /**
   * PUT /auth/notification-preferences
   * Saves notification channel preferences to backend database
   */
  async updateNotificationPreferences(payload) {
    return request('/auth/notification-preferences', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * POST /auth/avatar
   * Uploads custom profile avatar photo (multipart/form-data)
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/auth/avatar`;
    const headers = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to upload profile avatar.');
    }
    return data;
  },

  /**
   * POST /auth/corporate-documents
   * Uploads CAC Certificate of Incorporation (multipart/form-data)
   */
  async uploadCorporateDocument(file) {
    const formData = new FormData();
    formData.append('document', file);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/auth/corporate-documents`;
    const headers = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to upload corporate registration document.');
    }
    return data;
  },

  /**
   * GET /auth/profile
   * Retrieves currently authenticated user profile
   */
  async getProfile() {
    return request('/auth/profile', {
      method: 'GET'
    });
  },

  /**
   * PUT /auth/profile
   * Updates claimant profile details (name, phone, type, rcNumber, primaryBankCode)
   */
  async updateProfile(payload) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * PUT /auth/change-password
   * Changes current user password
   */
  async changePassword({ currentPassword, newPassword }) {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  /**
   * POST /auth/register
   * Creates a Claimant or Lawyer account. Does NOT return a token.
   */
  async register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * POST /auth/login
   * Authenticates user with email and password. Returns JWT token and user profile.
   */
  async login({ email, password }) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res?.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  /**
   * POST /auth/verify-email
   * Confirms email token sent during registration or resend.
   */
  async verifyEmail({ token, email }) {
    return request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, email })
    });
  },

  /**
   * POST /auth/resend-verification
   * Re-sends a fresh verification link.
   */
  async resendVerification(email) {
    return request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * POST /auth/forgot-password
   * Dispatches password reset instructions.
   */
  async forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * POST /auth/reset-password
   * Resets password using token and email.
   */
  async resetPassword({ token, email, password, passwordConfirmation }) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, password, passwordConfirmation })
    });
  },

  /**
   * Logout helper
   */
  logout() {
    clearAuthToken();
  }
};

export default authService;
