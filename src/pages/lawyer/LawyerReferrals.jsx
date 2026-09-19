import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerLayout from '../../layout/LawyerLayout';
import {
  Briefcase,
  Check,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Building,
  Scale
} from 'lucide-react';

export default function LawyerReferrals({
  lawyerUser,
  referrals = [],
  onUpdateReferralStatus,
  onLogout,
  onSwitchRole
}) {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('all');

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [rejectReason, setRejectReason] = useState('Conflict of interest with respondent financial institution');
  const [proposedFee, setProposedFee] = useState(10);

  const pendingCount = referrals.filter((r) => r.status === 'PENDING_LAWYER').length;

  const filteredReferrals = referrals.filter((ref) => {
    if (filterTab === 'pending') return ref.status === 'PENDING_LAWYER';
    if (filterTab === 'accepted') return ref.status === 'ACCEPTED_BY_LAWYER' || ref.status === 'MUTUALLY_ACCEPTED';
    if (filterTab === 'declined') return ref.status === 'REJECTED_BY_LAWYER' || ref.status === 'REJECTED_BY_CLIENT';
    return true;
  });

  const handleOpenAccept = (ref) => {
    setSelectedReferral(ref);
    setProposedFee(ref.contingencyPercent || 10);
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = () => {
    if (selectedReferral && onUpdateReferralStatus) {
      onUpdateReferralStatus(selectedReferral.id, 'ACCEPTED_BY_LAWYER', {
        contingencyPercent: proposedFee
      });
    }
    setAcceptModalOpen(false);
  };

  const handleOpenReject = (ref) => {
    setSelectedReferral(ref);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedReferral && onUpdateReferralStatus) {
      onUpdateReferralStatus(selectedReferral.id, 'REJECTED_BY_LAWYER', {
        reason: rejectReason
      });
    }
    setRejectModalOpen(false);
  };

  return (
    <LawyerLayout
      lawyerUser={lawyerUser}
      pendingReferralsCount={pendingCount}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
    >
      <div style={{ padding: '32px 36px 60px', flex: 1 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Case Referrals Inbox
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                All high-value and escalated disputes referred by Sovereign Recovery for formal legal intervention.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[
              { id: 'all', label: `All Referrals (${referrals.length})` },
              { id: 'pending', label: `Pending Review (${pendingCount})`, dot: '#ea580c' },
              { id: 'accepted', label: 'Accepted & Retained' },
              { id: 'declined', label: 'Declined' }
            ].map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '999px',
                    border: isActive ? '1px solid #071a38' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#071a38' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {tab.dot && !isActive && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: tab.dot, display: 'inline-block', marginRight: '6px' }} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredReferrals.length > 0 ? (
              filteredReferrals.map((ref) => {
                const isPending = ref.status === 'PENDING_LAWYER';
                const isAcceptedByLawyer = ref.status === 'ACCEPTED_BY_LAWYER';
                const isMutuallyAccepted = ref.status === 'MUTUALLY_ACCEPTED';
                const isRejected = ref.status === 'REJECTED_BY_LAWYER' || ref.status === 'REJECTED_BY_CLIENT';

                return (
                  <div
                    key={ref.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Ref #{ref.id} • Case #{ref.claimId} • {ref.categoryName}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: '0 0 6px 0' }}>
                          {ref.claimTitle}
                        </h3>
                        <div style={{ fontSize: '13px', color: '#475569' }}>
                          Client: <strong>{ref.clientName}</strong> • Institution: <strong>{ref.beneficiaryBank}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#071a38' }}>
                          ₦{ref.disputedAmountFormatted}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {ref.contingencyPercent}% Contingency
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div>
                        {isPending && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#ea580c', backgroundColor: '#fff7ed', padding: '3px 10px', borderRadius: '999px' }}>
                            Awaiting Your Review
                          </span>
                        )}
                        {isAcceptedByLawyer && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '999px' }}>
                            Accepted — Waiting for Client Approval
                          </span>
                        )}
                        {isMutuallyAccepted && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '999px' }}>
                            ✓ Retainer Active
                          </span>
                        )}
                        {isRejected && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fef2f2', padding: '3px 10px', borderRadius: '999px' }}>
                            Declined
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleOpenReject(ref)}
                              style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#dc2626', borderRadius: '6px', padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleOpenAccept(ref)}
                              style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Accept Brief
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => navigate(`/claims/${ref.claimId}`)}
                            style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#071a38', borderRadius: '6px', padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            View Case
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  No referrals found in this tab.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Accept & Reject Modals */}
      {acceptModalOpen && selectedReferral && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(3, 20, 46, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: '0 0 10px 0' }}>
              Accept Case Brief & Propose Contingency
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Confirm legal representation terms for <strong>₦{selectedReferral.disputedAmountFormatted}</strong> claim.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Contingency Rate (%)
              </label>
              <input
                type="number"
                value={proposedFee}
                onChange={(e) => setProposedFee(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setAcceptModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmAccept} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Confirm Terms</button>
            </div>
          </div>
        </div>
      )}

      {rejectModalOpen && selectedReferral && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(3, 20, 46, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: '0 0 10px 0' }}>
              Decline Brief
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              State reason for declining so case can be reassigned.
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '16px' }}
            >
              <option value="Conflict of interest with respondent financial institution">Conflict of interest with bank</option>
              <option value="Current litigation caseload full">Current caseload full</option>
              <option value="Insufficient documentary evidence">Insufficient documentary evidence</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setRejectModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmReject} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Decline Brief</button>
            </div>
          </div>
        </div>
      )}
    </LawyerLayout>
  );
}
