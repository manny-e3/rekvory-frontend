// Sovereign Recovery - Reference Service
// Implements:
// POST /reference/nuban-enquiry

import apiClient from './apiClient';

export const referenceService = {
  /**
   * POST /reference/nuban-enquiry
   * Resolves an account name for a bank code + account number via backend Paystack proxy
   */
  async nubanEnquiry(bankCode, accountNumber) {
    return apiClient.post('/reference/nuban-enquiry', {
      bankCode,
      accountNumber
    });
  }
};

export default referenceService;
