// Sovereign Recovery - Authenticated API Client
// Standard Envelope: { status, message, data, meta }
// Authentication: Authorization: Bearer <token>

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export class APIError extends Error {
  constructor(message, status, code, errors = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem('sr_auth_token') || localStorage.getItem('sr_token');
  } catch {
    return null;
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Standard fetch wrapper handling Bearer token injection and envelope unwrapping
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isMultipart = options.body instanceof FormData;

  const headers = {
    ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Streaming download or non-json responses
  if (options.responseType === 'blob') {
    if (!response.ok) {
      throw new APIError(`Download failed with status ${response.status}`, response.status, 'DOWNLOAD_FAILED');
    }
    return response.blob();
  }

  const resJson = await response.json().catch(() => null);

  if (!response.ok) {
    const message = resJson?.message || `Request failed with status ${response.status}`;
    const code = resJson?.code || (response.status === 401 ? 'UNAUTHORIZED' : response.status === 404 ? 'NOT_FOUND' : 'API_ERROR');
    const errors = resJson?.errors || null;
    throw new APIError(message, response.status, code, errors);
  }

  return resJson;
}

export const apiClient = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return apiRequest(qs ? `${endpoint}?${qs}` : endpoint, { method: 'GET' });
  },

  post: (endpoint, body) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  upload: (endpoint, formData) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: formData
    });
  },

  download: (endpoint) => {
    return apiRequest(endpoint, {
      method: 'GET',
      responseType: 'blob'
    });
  }
};

export default apiClient;
