// Sovereign Recovery - Accredited Legal Counsel API Service
import { apiRequest, getApiBaseUrl } from './apiClient';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = getApiBaseUrl();
  const rootOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${rootOrigin}${cleanPath}`;
}

export const lawyerService = {
  // 1. Profile Management
  getProfile: async () => {
    return apiRequest('/lawyer/profile', { method: 'GET' });
  },

  updateProfile: async (payload) => {
    return apiRequest('/lawyer/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiRequest('/lawyer/avatar', {
      method: 'POST',
      body: formData
    });
  },

  // 2. KYC Dossier & Document Management
  getKYC: async () => {
    return apiRequest('/lawyer/kyc', { method: 'GET' });
  },

  uploadKYCDocument: async ({ file, category, title, issuingAuthority }) => {
    const formData = new FormData();
    formData.append('document', file);
    if (category) formData.append('category', category);
    if (title) formData.append('title', title);
    if (issuingAuthority) formData.append('issuingAuthority', issuingAuthority);

    return apiRequest('/lawyer/kyc/documents', {
      method: 'POST',
      body: formData
    });
  },

  deleteKYCDocument: async (docId) => {
    return apiRequest(`/lawyer/kyc/documents/${docId}`, {
      method: 'DELETE'
    });
  },

  submitKYC: async (payload = {}) => {
    return apiRequest('/lawyer/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 3. Dashboard Stats & Referrals
  getDashboardStats: async () => {
    return apiRequest('/lawyer/dashboard/stats', { method: 'GET' });
  },

  getReferrals: async () => {
    return apiRequest('/lawyer/referrals', { method: 'GET' });
  },

  getCases: async () => {
    return apiRequest('/lawyer/cases', { method: 'GET' });
  },

  getCaseDetail: async (claimCode) => {
    return apiRequest(`/lawyer/cases/${claimCode}`, { method: 'GET' });
  },

  draftPreActionNotice: async (claimCode, { recipientBankEmails, additionalNotes }) => {
    return apiRequest(`/lawyer/cases/${claimCode}/pre-action-notice`, {
      method: 'POST',
      body: JSON.stringify({ recipientBankEmails, additionalNotes })
    });
  },

  getEarnings: async () => {
    return apiRequest('/lawyer/earnings', { method: 'GET' });
  }
};

export default lawyerService;
