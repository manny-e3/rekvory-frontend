import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerLayout from '../../layout/LawyerLayout';
import { lawyerService } from '../../services/lawyerService';
import {
  Scale,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  X,
  Send,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export default function LawyerDashboard({
  lawyerUser,
  referrals = [],
  onUpdateReferralStatus,
  onLogout,
  onSwitchRole
}) {
  const navigate = useNavigate();

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [rejectReason, setRejectReason] = useState('Conflict of interest with respondent financial institution');
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [proposedFee, setProposedFee] = useState(10);

  // Live Backend Stats
  const [stats, setStats] = useState({
    pendingReferrals: 0,
    activeRetainers: 0,
    totalValueInLitigation: 0,
    totalValueInLitigationFormatted: '₦0.00',
    earnedLegalFees: 0,
    earnedLegalFeesFormatted: '₦0.00',
    urgentActionTray: [],
    isPendingVerification: !lawyerUser?.nbaSealVerified
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setIsLoadingStats(true);
      try {
        const res = await lawyerService.getDashboardStats();
        if (res?.data && isMounted) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch lawyer dashboard stats:', err.message);
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const pendingReferrals = referrals.filter((r) => r.status === 'PENDING_LAWYER');
  const activeRetainers = referrals.filter((r) => r.status === 'MUTUALLY_ACCEPTED' || r.status === 'ACCEPTED_BY_LAWYER');

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

  const isVerified = Boolean(lawyerUser?.nbaSealVerified) && !stats.isPendingVerification;

  return (
    <LawyerLayout
      lawyerUser={lawyerUser}
      pendingReferralsCount={pendingReferrals.length}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
    >
      <div style={{ padding: '32px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Top Title Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isVerified ? '#10b981' : '#f97316' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#475569', textTransform: 'uppercase' }}>
                NIGERIAN BANKING LITIGATION & STATUTORY ARBITRATION
              </span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Good day, {lawyerUser?.name || 'Counsel'}.
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              Review client dispute referrals, serve statutory pre-action notices, and track recovery fee disbursements.
            </p>
          </div>

          {/* KYC Onboarding Notice Banner (If not yet verified) */}
          {!isVerified && (
            <div
              style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '18px 24px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#ffedd5',
                    color: '#c2410c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#9a3412' }}>
                    Accreditation Verification in Progress
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#7c2d12', marginTop: '2px' }}>
                    Your Supreme Court enrolment credentials and practicing certificate are required to activate dispute brief referrals.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/lawyer/kyc')}
                style={{
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                }}
              >
                <span>Complete KYC Dossier</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* 4 KPI Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}
          >
            {/* Card 1: Pending Referrals */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  NEW CASE REFERRALS
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: pendingReferrals.length > 0 ? '#ea580c' : '#071a38', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                  {pendingReferrals.length}
                </div>
                <div style={{ fontSize: '11.5px', color: pendingReferrals.length > 0 ? '#ea580c' : '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {pendingReferrals.length > 0 ? 'Action required (Accept/Decline)' : 'No pending briefs'}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Briefcase size={20} />
              </div>
            </div>

            {/* Card 2: Active Retainers */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ACTIVE RETAINERS
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#071a38', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                  {activeRetainers.length}
                </div>
                <div style={{ fontSize: '11.5px', color: activeRetainers.length > 0 ? '#10b981' : '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {activeRetainers.length > 0 ? '● Legal representation active' : 'None active'}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Scale size={20} />
              </div>
            </div>

            {/* Card 3: Disputed Value in Litigation */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  DISPUTED VALUE IN SUIT
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#071a38', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                  {stats.totalValueInLitigationFormatted || '₦0.00'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Against respondent clearing banks
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building size={20} />
              </div>
            </div>

            {/* Card 4: Contingency Recoveries */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  CONTINGENCY RECOVERIES
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#8f4e00', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                  {stats.earnedLegalFeesFormatted || '₦0.00'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '2px' }}>
                  {lawyerUser?.contingencyRatePercent || 10}% Contingency fee yield
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          {/* Section: Incoming Client Referrals */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Incoming Client Referrals ({referrals.length})
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Disputes referred by Sovereign Recovery. You may review the merits and <strong>Accept</strong> or <strong>Decline</strong> representation.
                </p>
              </div>
            </div>

            {referrals.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                }}
              >
                <Briefcase size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  No Pending Dispute Referrals
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '440px', margin: '6px auto 16px' }}>
                  When financial restitution disputes match your legal jurisdiction and practice focus, they will appear here for review and statutory demand notice dispatch.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/lawyer/kyc')}
                  style={{
                    backgroundColor: '#0B2D5B',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Verify Practice Credentials
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{ref.claimId || ref.id}</span>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#071a38', margin: '4px 0' }}>{ref.claimTitle || 'Financial Dispute Representation'}</h4>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Client: {ref.clientName} • Amount in Suit: ₦{Number(ref.amount || 0).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenAccept(ref)}
                          style={{
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Accept Brief
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(ref)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reject Brief Modal */}
          {rejectModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(7, 26, 56, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '20px'
              }}
            >
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#071a38', margin: '0 0 12px' }}>Decline Case Brief</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Select reason for declining this referral.</p>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                >
                  <option value="Conflict of interest with respondent financial institution">Conflict of interest with respondent bank</option>
                  <option value="Jurisdictional conflict">Jurisdictional conflict</option>
                  <option value="Capacity constraint">Capacity constraint</option>
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setRejectModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
                  <button type="button" onClick={handleConfirmReject} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff' }}>Confirm Decline</button>
                </div>
              </div>
            </div>
          )}

          {/* Accept Brief Modal */}
          {acceptModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(7, 26, 56, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '20px'
              }}
            >
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#071a38', margin: '0 0 12px' }}>Accept Dispute Representation</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Confirm contingency fee terms for this dispute recovery.</p>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Proposed Contingency Yield: {proposedFee}%</label>
                  <input type="range" min="5" max="25" value={proposedFee} onChange={(e) => setProposedFee(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setAcceptModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
                  <button type="button" onClick={handleConfirmAccept} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff' }}>Confirm Acceptance</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </LawyerLayout>
  );
}
