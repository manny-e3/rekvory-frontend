// Sovereign Recovery - Notification Service
// Handles fetching user notifications and read receipt mutations

import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const notificationService = {
  /**
   * GET /notifications
   * Fetches paginated user notifications + unreadCount
   */
  async getNotifications({ page = 1, limit = 20 } = {}) {
    return request(`/notifications?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  },

  /**
   * PATCH /notifications/:id/read
   * Marks a specific notification as read
   */
  async markAsRead(id) {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  /**
   * PATCH /notifications/read-all
   * Marks all user notifications as read
   */
  async markAllAsRead() {
    return request('/notifications/read-all', {
      method: 'PATCH'
    });
  }
};

export default notificationService;
