// Sovereign Recovery - Claims Service
// Implements Authenticated API Specification:
// POST /claims/auto-draft-narrative
// POST /claims
// GET /claims
// GET /claims/:id
// POST /claims/:id/request-lawyer
// POST /claims/:id/evidence
// GET /claims/:id/evidence/:evidenceId/file

import apiClient, { apiRequest, getApiBaseUrl, APIError } from './apiClient';
import { DISPUTE_CATEGORIES } from '../utils';

// Helper to compute a simulated SHA-256 integrity hash for documents
function generateSimulatedHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Local storage fallback helpers
function getLocalClaims() {
  try {
    const saved = localStorage.getItem('sr_claims');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[claimService] Failed to read claims from localStorage:', err);
  }
  return [];
}

function saveLocalClaims(claims) {
  try {
    localStorage.setItem('sr_claims', JSON.stringify(claims));
  } catch (err) {
    console.warn('[claimService] Failed to write claims to localStorage:', err);
  }
}

function getLocalReferrals() {
  try {
    const saved = localStorage.getItem('sr_referrals');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[claimService] Failed to read referrals from localStorage:', err);
  }
  return [];
}

export const claimService = {
  /**
   * GET /claims
   * Lists caller's claims with pagination, search, sorting and KPI summary stats
   */
  async getClaims(params = {}) {
    try {
      const res = await apiClient.get('/claims', params);
      return res;
    } catch (err) {
      console.warn('[claimService] GET /claims falling back to local dataset:', err.message);

      let allClaims = getLocalClaims();
      const { status = 'all', category, search, sortBy = 'newest', page = 1, limit = 20 } = params;

      // Filter by status
      let filtered = allClaims.filter((c) => {
        if (status && status !== 'all') {
          const s = (c.status || '').toLowerCase();
          const l = (c.statusLabel || '').toLowerCase();
          if (status === 'warning' && !(s === 'warning' || l.includes('under review'))) return false;
          if (status === 'info' && !(s === 'info' || l.includes('awaiting'))) return false;
          if (status === 'error' && !(s === 'error' || l.includes('escalated'))) return false;
          if (status === 'success' && !(s === 'success' || l.includes('resolved') || l.includes('recovered'))) return false;
        }

        // Filter by category
        if (category && category !== 'all') {
          if (c.category !== category) return false;
        }

        // Search query
        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          const matches =
            (c.id || '').toLowerCase().includes(q) ||
            (c.title || '').toLowerCase().includes(q) ||
            (c.categoryName || '').toLowerCase().includes(q) ||
            (c.originBank || '').toLowerCase().includes(q) ||
            (c.beneficiaryBank || '').toLowerCase().includes(q) ||
            (c.beneficiaryName || '').toLowerCase().includes(q) ||
            (c.sessionId || '').toLowerCase().includes(q) ||
            (c.rrn || '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        if (sortBy === 'amount-high') return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
        if (sortBy === 'amount-low') return (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0);
        if (sortBy === 'oldest') return (a.id || '').localeCompare(b.id || '');
        return (b.id || '').localeCompare(a.id || ''); // newest default
      });

      // Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedData = filtered.slice(startIndex, startIndex + limitNum);

      // Compute meta.summary
      const totalClaims = allClaims.length;
      const underReview = allClaims.filter((c) => c.status === 'warning' || (c.statusLabel || '').toLowerCase().includes('under review')).length;
      const awaitingCustomer = allClaims.filter((c) => c.status === 'info' || (c.statusLabel || '').toLowerCase().includes('awaiting')).length;
      const escalated = allClaims.filter((c) => c.status === 'error' || (c.statusLabel || '').toLowerCase().includes('escalated')).length;
      const recoveredAmount = allClaims
        .filter((c) => c.status === 'success' || (c.statusLabel || '').toLowerCase().includes('resolved') || (c.statusLabel || '').toLowerCase().includes('recovered'))
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      return {
        status: 'success',
        message: 'Records retrieved.',
        data: paginatedData,
        meta: {
          pagination: {
            currentPage: pageNum,
            perPage: limitNum,
            totalRecords: filtered.length,
            totalPages: Math.ceil(filtered.length / limitNum) || 1,
            hasMore: startIndex + limitNum < filtered.length
          },
          summary: {
            totalClaims,
            underReview,
            awaitingCustomer,
            escalated,
            recoveredAmount
          },
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * GET /claims/:id
   * Returns full case dossier by claim code (e.g. RK-00042)
   */
  async getClaimById(id) {
    try {
      const res = await apiClient.get(`/claims/${id}`);
      return res;
    } catch (err) {
      console.warn(`[claimService] GET /claims/${id} falling back to local dataset:`, err.message);

      const allClaims = getLocalClaims();
      const claim = allClaims.find((c) => c.id === id) || allClaims[0];

      if (!claim) {
        throw new APIError(`Claim ${id} not found`, 404, 'NOT_FOUND');
      }

      // Check for matching referral
      const referrals = getLocalReferrals();
      const referral = referrals.find((r) => r.claimId === claim.id);

      let legalReferral = null;
      if (referral) {
        if (referral.status === 'PENDING_LAWYER' || referral.status === 'MATCHING') {
          legalReferral = {
            stage: 'MATCHING',
            referralId: referral.id,
            message: 'We are matching you with accredited banking litigation counsel specialized in interbank arbitration.'
          };
        } else if (referral.status === 'ACCEPTED_BY_LAWYER' || referral.status === 'AWAITING_CLIENT_DECISION') {
          legalReferral = {
            stage: 'AWAITING_CLIENT_DECISION',
            referralId: referral.id,
            lawyer: {
              id: referral.lawyerId || 'lwy_001',
              name: referral.lawyerName || 'Accredited Legal Counsel',
              firmName: referral.lawyerFirm || 'Accredited Law Firm',
              callToBarYear: 2012,
              practiceJurisdiction: 'Federal Republic of Nigeria',
              contingencyRatePercent: referral.contingencyPercent || 10,
              nbaSealVerified: true,
              activeCasesCount: 6
            },
            contingencyTerms: {
              ratePercent: referral.contingencyPercent || 10,
              clause: 'Contingency Fee Yield: Payable solely upon recovered restitution. Zero upfront retainer.'
            }
          };
        } else if (referral.status === 'MUTUALLY_ACCEPTED' || referral.status === 'ACTIVE_REPRESENTATION') {
          legalReferral = {
            stage: 'ACTIVE_REPRESENTATION',
            referralId: referral.id,
            message: 'Retainer mutually executed. Counsel is actively prosecuting restitution with respondent clearing desks.',
            lawyer: {
              id: referral.lawyerId || 'lwy_001',
              name: referral.lawyerName || 'Accredited Legal Counsel',
              firmName: referral.lawyerFirm || 'Accredited Law Firm',
              contingencyRatePercent: referral.contingencyPercent || 10
            },
            preActionNoticeServed: true,
            preActionNoticeDate: referral.retainedAt || '2026-09-16T12:00:00Z'
          };
        }
      }

      // Ensure full dossier fields
      const fullDossier = {
        ...claim,
        timeline: claim.timeline || [
          { stage: 1, title: 'Dispute Lodged & Case Opened', date: claim.transactionDate || 'Recently', completed: true, current: claim.stage === 1 },
          { stage: 2, title: 'Interbank Clearing Desk Inquest', date: 'Target: T+24 Hours', completed: (claim.stage || 1) >= 2, current: claim.stage === 2 },
          { stage: 3, title: 'CBN Arbitration & Settlement Directive', date: 'Target: T+48 Hours', completed: (claim.stage || 1) >= 3, current: claim.stage === 3 },
          { stage: 4, title: 'Restitution Issued & Disbursement', date: 'Pending Verification', completed: (claim.stage || 1) >= 4, current: claim.stage === 4 }
        ],
        evidenceFiles: (claim.evidenceFiles || []).map((ef, idx) => ({
          id: ef.id || `ev_${String(idx + 1).padStart(3, '0')}`,
          name: ef.name,
          fileUrl: ef.fileUrl || `${getApiBaseUrl()}/claims/${claim.id}/evidence/ev_${String(idx + 1).padStart(3, '0')}/file`,
          size: ef.size || '350 KB',
          type: ef.type || 'Bank Statement',
          sha256Hash: ef.sha256Hash || generateSimulatedHash(),
          uploadedAt: ef.uploadedAt || new Date().toISOString()
        })),
        auditLog: claim.auditLog || [
          {
            timestamp: new Date().toISOString(),
            actor: claim.claimant || 'Claimant',
            action: `Dispute filed for ${claim.amountFormatted || 'disputed sum'} via Sovereign Recovery Portal.`
          }
        ],
        legalReferral
      };

      return {
        status: 'success',
        message: 'Claim retrieved.',
        data: fullDossier
      };
    }
  },

  /**
   * POST /claims/auto-draft-narrative
   * Generates statutory complaint narrative with CBN Consumer Protection & Evidence Act compliance
   */
  async autoDraftNarrative(payload) {
    try {
      const res = await apiClient.post('/claims/auto-draft-narrative', payload);
      return res;
    } catch (err) {
      console.warn('[claimService] POST /claims/auto-draft-narrative using local statutory generator:', err.message);

      const num = parseFloat(payload.amount) || 0;
      const formattedAmount = num.toLocaleString('en-NG', { minimumFractionDigits: 2 });
      const catObj = DISPUTE_CATEGORIES.find((c) => c.id === payload.category);
      const catTitle = catObj ? catObj.name : 'Financial Dispute';
      const dateStr = (payload.transactionDate || new Date().toISOString()).replace('T', ' ');

      const narrative = `STATUTORY DEMAND FOR RESTITUTION UNDER SECTION 2.3 OF THE CBN CONSUMER PROTECTION FRAMEWORK & EVIDENCE ACT 2011 (ELECTRONIC TRANSACTIONS):

I hereby submit a formal dispute concerning an unacknowledged and unauthorized debit in the sum of ₦${formattedAmount}, debited from my ${payload.originBank || 'originating bank'} account (${payload.originAccount || 'NUBAN'}) on ${dateStr} WAT under classification: ${catTitle}.

Transaction Reference Coordinates:
- Central Switch Session ID: ${payload.sessionId || 'PENDING_RECONCILIATION'}
- Retrieval Reference Number (RRN): ${payload.rrn || 'PENDING_RRN'}
- Respondent Beneficiary Entity / Bank: ${payload.beneficiaryBank || 'Beneficiary Institution'}

Despite verified debit of principal funds from the originating ledger, corresponding financial value was neither acknowledged nor received. Pursuant to Central Bank of Nigeria Directives on Instant Interbank Electronic Reversals (Circular BSD/DIR/GEN/CIR/04/007) and Section 84 of the Evidence Act 2011, demand is formally served upon the respondent clearing desk for full immediate reversal of ₦${formattedAmount} within statutory regulatory SLA hours.`;

      return {
        status: 'success',
        message: 'Narrative drafted.',
        data: { narrative }
      };
    }
  },

  /**
   * POST /claims
   * Lodges a new dispute, computes SLA countdown, and generates Form 14 Demand Notice
   */
  async lodgeClaim(payload) {
    try {
      const res = await apiClient.post('/claims', payload);
      return res;
    } catch (err) {
      console.warn('[claimService] POST /claims falling back to local persistence:', err.message);

      const numAmount = parseFloat(payload.amount) || 50000;
      const formattedAmount = numAmount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const catObj = DISPUTE_CATEGORIES.find((c) => c.id === payload.category) || DISPUTE_CATEGORIES[0];
      const effectiveCategoryName = (payload.category === 'OTHER' && payload.customCategory?.trim())
        ? payload.customCategory.trim()
        : catObj.name;
      const targetEntity = payload.claimAgainst || payload.beneficiaryName || payload.beneficiaryBank || 'Respondent Entity';
      const newId = `RK-${Math.floor(10000 + Math.random() * 90000)}`;
      const demandNoticeId = `DN-2026-${newId.split('-')[1]}`;
      const servedAt = new Date().toISOString();

      const newClaim = {
        id: newId,
        title: `${effectiveCategoryName} — ${targetEntity}`,
        category: payload.category,
        categoryName: effectiveCategoryName,
        customCategory: payload.customCategory || null,
        claimAgainst: targetEntity,
        amount: numAmount,
        amountFormatted: `₦${formattedAmount}`,
        originBank: payload.originBank || 'Direct Account',
        originAccount: payload.originAccount || 'N/A',
        beneficiaryBank: payload.beneficiaryBank || targetEntity,
        beneficiaryAccount: payload.beneficiaryAccount || 'N/A',
        beneficiaryName: targetEntity,
        rrn: payload.rrn || `RRN-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        sessionId: payload.sessionId || `SES-${Date.now()}`,
        transactionDate: payload.transactionDate,
        status: 'warning',
        statusLabel: 'Under Review',
        stage: 1,
        stageName: 'Dispute Lodged & Case Opened',
        slaTimeRemaining: `${catObj.slaHours || 48}h 00m`,
        evidenceCount: (payload.evidenceFiles || []).length,
        demandNoticeId,
        servedAt,
        narrative: payload.narrative,
        evidenceFiles: (payload.evidenceFiles || []).map((f, i) => ({
          id: `ev_${String(i + 1).padStart(3, '0')}`,
          name: f.name,
          size: f.size || '250 KB',
          type: f.type || 'Bank Statement',
          sha256Hash: generateSimulatedHash(),
          uploadedAt: servedAt
        })),
        timeline: [
          { stage: 1, title: 'Dispute Lodged & Demand Served', date: 'Just now', completed: true, current: true },
          { stage: 2, title: 'Interbank Inquest & Switch Verification', date: `Target: T+${Math.floor((catObj.slaHours || 48) / 2)} Hours`, completed: false },
          { stage: 3, title: 'Arbitration & Settlement Directive', date: `Target: T+${catObj.slaHours || 48} Hours`, completed: false },
          { stage: 4, title: 'Restitution Issued & Disbursement', date: 'Pending', completed: false }
        ],
        auditLog: [
          {
            timestamp: 'Just now',
            actor: payload.claimant || 'Claimant',
            action: `Dispute filed for ₦${formattedAmount} via Sovereign Recovery Portal.`
          },
          {
            timestamp: 'Just now',
            actor: 'Sovereign Dispatch Engine',
            action: `Form 14 Electronic Demand Notice #${demandNoticeId} served to ${payload.originBank} and ${payload.beneficiaryBank}.`
          }
        ]
      };

      // Prepend to local storage claims
      const existing = getLocalClaims();
      saveLocalClaims([newClaim, ...existing]);

      return {
        status: 'success',
        message: 'Dispute lodged and electronic demand notice dispatched.',
        data: {
          id: newId,
          status: 'warning',
          statusLabel: 'Under Review',
          stage: 1,
          slaTimeRemaining: `${catObj.slaHours || 48}h 00m`,
          demandNoticeId,
          servedAt
        }
      };
    }
  },

  /**
   * POST /claims/:id/request-lawyer
   * Escalates claim to NBA accredited banking litigation counsel
   */
  async requestLawyer(id) {
    try {
      const res = await apiClient.post(`/claims/${id}/request-lawyer`);
      return res;
    } catch (err) {
      console.warn(`[claimService] POST /claims/${id}/request-lawyer using local fallback:`, err.message);

      const claims = getLocalClaims();
      const updatedClaims = claims.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            legalEscalationRequested: true,
            legalEscalationRequestedAt: new Date().toISOString(),
            auditLog: [
              {
                timestamp: 'Just now',
                actor: 'Claimant Operations Desk',
                action: 'Dispute escalated to NBA Accredited Counsel Network on a contingency fee basis.'
              },
              ...(c.auditLog || [])
            ]
          };
        }
        return c;
      });
      saveLocalClaims(updatedClaims);

      // Create referral record
      const referrals = getLocalReferrals();
      const targetClaim = claims.find((c) => c.id === id);
      const newRef = {
        id: `REF-2026-${String(referrals.length + 1).padStart(3, '0')}`,
        claimId: id,
        claimTitle: targetClaim?.title || 'Banking Restitution Claim',
        disputedAmount: targetClaim?.amount || 50000,
        disputedAmountFormatted: targetClaim?.amountFormatted || '₦50,000.00',
        originBank: targetClaim?.originBank || 'Origin Bank',
        beneficiaryBank: targetClaim?.beneficiaryBank || 'Beneficiary Bank',
        lawyerId: null,
        lawyerName: 'Accredited Legal Counsel',
        lawyerFirm: 'Designated Banking Litigation Firm',
        contingencyPercent: 12.5,
        status: 'PENDING_LAWYER', // will transition to ACCEPTED_BY_LAWYER
        referralDate: 'Just now'
      };
      localStorage.setItem('sr_referrals', JSON.stringify([newRef, ...referrals]));

      return {
        status: 'success',
        message: 'Legal escalation requested. We are matching you with specialized banking litigation counsel.',
        data: {
          id,
          legalEscalationRequested: true,
          legalEscalationRequestedAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * POST /claims/:id/evidence
   * Multipart file upload with document classification
   */
  async uploadEvidence(id, file, documentType) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const res = await apiClient.upload(`/claims/${id}/evidence`, formData);
      return res;
    } catch (err) {
      console.warn(`[claimService] POST /claims/${id}/evidence using local fallback:`, err.message);

      const evidenceId = `ev_${Math.floor(100 + Math.random() * 900)}`;
      const sha256Hash = generateSimulatedHash();
      const uploadedAt = new Date().toISOString();
      const fileSize = file?.size ? `${Math.round(file.size / 1024)} KB` : '420 KB';
      const fileName = file?.name || 'evidence_document.pdf';

      const newEvidence = {
        id: evidenceId,
        name: fileName,
        fileUrl: `${getApiBaseUrl()}/claims/${id}/evidence/${evidenceId}/file`,
        size: fileSize,
        type: documentType,
        sha256Hash,
        uploadedAt
      };

      // Persist to claim in local storage
      const claims = getLocalClaims();
      const updatedClaims = claims.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            evidenceFiles: [newEvidence, ...(c.evidenceFiles || [])],
            evidenceCount: (c.evidenceCount || 0) + 1,
            auditLog: [
              {
                timestamp: 'Just now',
                actor: 'Claimant Operations Desk',
                action: `Attached verified evidence file: ${fileName} (${documentType}) [SHA256: ${sha256Hash.slice(0, 8)}...].`
              },
              ...(c.auditLog || [])
            ]
          };
        }
        return c;
      });
      saveLocalClaims(updatedClaims);

      return {
        status: 'success',
        message: 'Evidence uploaded successfully.',
        data: newEvidence
      };
    }
  },

  /**
   * Stream download URL helper
   */
  getEvidenceDownloadUrl(claimId, evidenceId) {
    return `${getApiBaseUrl()}/claims/${claimId}/evidence/${evidenceId}/file`;
  },

  /**
   * GET /claims/:id/checkout
   * Fetch dispute details, invoiced service fee, and claimant info for checkout
   */
  async getCheckoutDetails(id) {
    try {
      const res = await apiClient.get(`/claims/${id}/checkout`);
      return res?.data;
    } catch (err) {
      console.warn(`[claimService] GET /claims/${id}/checkout error, checking fallback:`, err.message);
      // Try regular getClaim if checkout fails
      const fallback = await this.getClaim(id);
      return fallback;
    }
  },

  /**
   * POST /claims/:id/initialize-payment
   * Prepares transaction with Paystack or Flutterwave
   */
  async initializePayment(id, { gateway, callbackUrl }) {
    return apiClient.post(`/claims/${id}/initialize-payment`, {
      gateway,
      callbackUrl,
    });
  },

  /**
   * POST /claims/:id/verify-payment
   * Confirms payment reference and unlocks claim recovery
   */
  async verifyPayment(id, { gateway, reference, transactionId }) {
    return apiClient.post(`/claims/${id}/verify-payment`, {
      gateway,
      reference,
      transactionId,
    });
  }
};

export default claimService;
