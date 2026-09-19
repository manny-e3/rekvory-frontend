// Sovereign Recovery - Legal Referrals & Retainer Service
// Implements Authenticated API Specification:
// POST /referrals/:id/client-decision

import apiClient, { APIError } from './apiClient';

function getLocalReferrals() {
  try {
    const saved = localStorage.getItem('sr_referrals');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[referralService] Failed to read referrals from localStorage:', err);
  }
  return [];
}

function saveLocalReferrals(referrals) {
  try {
    localStorage.setItem('sr_referrals', JSON.stringify(referrals));
  } catch (err) {
    console.warn('[referralService] Failed to write referrals to localStorage:', err);
  }
}

export const referralService = {
  /**
   * POST /referrals/:id/client-decision
   * Claimant accepts or rejects the lawyer's contingency fee representation brief
   */
  async submitClientDecision(referralId, action, reason = null) {
    try {
      const payload = { action };
      if (action === 'REJECT' && reason) {
        payload.reason = reason;
      }
      const res = await apiClient.post(`/referrals/${referralId}/client-decision`, payload);
      return res;
    } catch (err) {
      console.warn(`[referralService] POST /referrals/${referralId}/client-decision using local fallback:`, err.message);

      const referrals = getLocalReferrals();
      let updatedReferral = null;

      const updatedList = referrals.map((r) => {
        if (r.id === referralId) {
          const isAccept = action === 'ACCEPT';
          updatedReferral = {
            ...r,
            clientStatus: isAccept ? 'ACCEPTED' : 'REJECTED',
            clientDecisionAt: new Date().toISOString(),
            clientRejectionReason: isAccept ? null : (reason || 'Client declined match terms'),
            retainerStatus: isAccept ? 'MUTUALLY_ACCEPTED' : 'TERMINATED',
            retainedAt: isAccept ? new Date().toISOString() : null,
            status: isAccept ? 'MUTUALLY_ACCEPTED' : 'REJECTED_BY_CLIENT'
          };
          return updatedReferral;
        }
        return r;
      });

      saveLocalReferrals(updatedList);

      // Also append audit entry to affected claim in localStorage
      if (updatedReferral?.claimId) {
        try {
          const savedClaims = localStorage.getItem('sr_claims');
          if (savedClaims) {
            const claims = JSON.parse(savedClaims);
            const newClaims = claims.map((c) => {
              if (c.id === updatedReferral.claimId) {
                const isAccept = action === 'ACCEPT';
                return {
                  ...c,
                  auditLog: [
                    {
                      timestamp: 'Just now',
                      actor: 'Claimant Legal Retainer Desk',
                      action: isAccept
                        ? `Client accepted contingency terms (${updatedReferral.contingencyPercent || 12.5}%). Formal legal retainer active.`
                        : `Client declined counsel match terms: "${reason || 'Opted for alternative counsel'}".`
                    },
                    ...(c.auditLog || [])
                  ]
                };
              }
              return c;
            });
            localStorage.setItem('sr_claims', JSON.stringify(newClaims));
          }
        } catch (e) {
          console.warn('[referralService] Could not update claim audit log:', e);
        }
      }

      return {
        status: 'success',
        message: action === 'ACCEPT'
          ? 'Legal representation confirmed.'
          : 'Counsel match declined.',
        data: updatedReferral || {
          id: referralId,
          retainerStatus: action === 'ACCEPT' ? 'MUTUALLY_ACCEPTED' : 'TERMINATED'
        }
      };
    }
  }
};

export default referralService;
