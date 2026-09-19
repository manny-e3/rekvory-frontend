import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import { claimService, referralService } from '../services';
import ClaimTimeline from '../components/ClaimTimeline';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle,
  Download,
  UploadCloud,
  AlertTriangle,
  Building,
  Hash,
  Calendar,
  Layers,
  History,
  Clock,
  Printer,
  Scale,
  Briefcase,
  CheckCircle2,
  XCircle,
  Receipt,
  ChevronRight,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

export default function ClaimDetailView({
  claims = [],
  claim: directClaim,
  referrals = [],
  currentUser,
  onUpdateReferralStatus,
  onRequestCounsel,
  onLogout,
  onBack,
  onOpenSettlement,
  onOpenDemandNotice,
  onOpenEvidenceModal
}) {
  const { claimId } = useParams();
  const navigate = useNavigate();

  const [clientActionFeedback, setClientActionFeedback] = useState(null);
  const [liveClaim, setLiveClaim] = useState(directClaim || claims.find((c) => c.id === claimId) || claims[0]);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isDeciding, setIsDeciding] = useState(false);

  // Load full dossier by code (e.g. RK-00042) via GET /claims/:id
  useEffect(() => {
    let isMounted = true;
    const fetchDossier = async () => {
      const code = claimId || directClaim?.id;
      if (!code) return;
      setIsLoadingDossier(true);
      try {
        const res = await claimService.getClaimById(code);
        if (isMounted && res?.data) {
          setLiveClaim(res.data);
        }
      } catch (err) {
        console.warn('[ClaimDetail] Error fetching live dossier:', err);
      } finally {
        if (isMounted) setIsLoadingDossier(false);
      }
    };
    fetchDossier();
    return () => { isMounted = false; };
  }, [claimId, directClaim]);

  const claim = liveClaim || directClaim || claims.find((c) => c.id === claimId) || claims[0];

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!claim) {
    return (
      <div className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>No dispute dossier found for ID: {claimId}.</p>
        <button className="btn btn-secondary-navy" onClick={handleBack} style={{ marginTop: '16px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '28px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Navigation Breadcrumb / Back button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-ghost"
              onClick={handleBack}
              style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} />
              <span>Return to Case Dossier Registry</span>
            </button>
          </div>

        {/* Case Dossier Master Header Bar */}
        <div
          className="surface-card"
          style={{
            padding: '24px',
            marginBottom: '24px',
            borderLeft: '4px solid var(--primary-navy)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span
                  className="tabular-nums"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--primary-navy)'
                  }}
                >
                  CASE {claim.id}
                </span>
                <StatusBadge status={claim.status} label={claim.statusLabel} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: claim.priority === 'Urgent' ? '#b91c1c' : '#b45309',
                    backgroundColor: claim.priority === 'Urgent' ? '#fee2e2' : '#fef3c7',
                    padding: '2px 8px',
                    borderRadius: 'var(--rounded-full)'
                  }}
                >
                  {claim.priority} Priority
                </span>
              </div>

              <h2 className="title-lg" style={{ color: 'var(--neutral-charcoal)' }}>
                {claim.categoryName}
              </h2>

              <p className="body-sm" style={{ color: 'var(--outline)', marginTop: '4px' }}>
                Claimant: <strong>{claim.claimant}</strong> ({claim.claimantType}) • Initiated on {claim.transactionDate}
              </p>
            </div>

            {/* Financial Restitution Value Box */}
            <div style={{ textAlign: 'right' }}>
              <span className="label-sm" style={{ color: 'var(--outline)' }}>
                CLAIMED RESTITUTION SUM
              </span>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '34px',
                  fontWeight: 700,
                  color: 'var(--primary-navy)',
                  marginTop: '2px',
                  letterSpacing: '-0.02em'
                }}
              >
                ₦{claim.amountFormatted}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: claim.status === 'success' ? '#047857' : '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  marginTop: '4px'
                }}
              >
                <Clock size={13} />
                <span>SLA Status: {claim.slaTimeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--neutral-border)'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary-blue btn-sm"
                onClick={() => onOpenDemandNotice(claim)}
              >
                <FileText size={15} />
                <span>View Restitution Demand Notice</span>
              </button>
              <button
                className="btn btn-secondary-navy btn-sm"
                onClick={() => onOpenEvidenceModal(claim)}
              >
                <UploadCloud size={15} />
                <span>Attach Evidence</span>
              </button>
            </div>

            {claim.status !== 'success' && (
              <button
                className="btn btn-primary-gold"
                onClick={() => onOpenSettlement(claim)}
              >
                <CheckCircle size={16} strokeWidth={2.5} />
                <span>Approve Settlement & Restitution</span>
              </button>
            )}

            {claim.status === 'success' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  padding: '6px 14px',
                  borderRadius: 'var(--rounded-md)',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                <ShieldCheck size={18} />
                <span>Restitution Disbursed & Dossier Archived</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Fee Assessment & Payment Banner */}
        {claim.paymentStatus === 'PENDING_PAYMENT' && (
          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Receipt size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1e40af' }}>
                    Case Scope Approved & Invoiced
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1e40af' }}>
                    Action Required
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                  Adjudication officers have approved your dispute! A forensic inquest fee of{' '}
                  <strong style={{ fontWeight: 800, color: '#1d4ed8' }}>
                    â‚¦{Number(claim.serviceFee || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </strong>{' '}
                  is required to dispatch statutory e-demand notices.
                </p>
                {claim.serviceFeeNote && (
                  <p style={{ fontSize: '12px', color: '#3b82f6', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                    "{claim.serviceFeeNote}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/claims/${claim.id}/checkout`)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 22px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
              }}
            >
              <span>Proceed to Checkout</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {claim.paymentStatus === 'PAID' && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                Service fee of â‚¦{Number(claim.serviceFee || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })} paid via {claim.paymentGateway || 'Gateway'} (Ref: {claim.paymentReference}). Forensic clearing inquest is active.
              </span>
            </div>
            <button
              onClick={() => navigate(`/claims/${claim.id}/checkout`)}
              style={{
                background: 'transparent',
                border: '1px solid #86efac',
                color: '#15803d',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View Payment Receipt
            </button>
          </div>
        )}

        {/* Legal Counsel Match & Representation Consent Card */}
        {(() => {
          const matchedRef = referrals.find((r) => r.claimId === claim.id);
          const legalRef = claim.legalReferral;

          // Determine stage and details
          const isMatching = legalRef?.stage === 'MATCHING' || matchedRef?.status === 'PENDING_LAWYER' || claim.legalEscalationRequested;
          const isAwaitingDecision = legalRef?.stage === 'AWAITING_CLIENT_DECISION' || matchedRef?.status === 'ACCEPTED_BY_LAWYER';
          const isMutuallyAccepted = legalRef?.stage === 'ACTIVE_REPRESENTATION' || matchedRef?.status === 'MUTUALLY_ACCEPTED';
          const isRejectedByLawyer = matchedRef?.status === 'REJECTED_BY_LAWYER';
          const isRejectedByClient = matchedRef?.status === 'REJECTED_BY_CLIENT';

          const hasReferral = isMatching || isAwaitingDecision || isMutuallyAccepted || isRejectedByLawyer || isRejectedByClient;

          const lawyerName = legalRef?.lawyer?.name || matchedRef?.lawyerName || 'Accredited Legal Counsel';
          const lawyerFirm = legalRef?.lawyer?.firmName || matchedRef?.lawyerFirm || 'Banking Litigation Practice';
          const contingencyPercent = legalRef?.contingencyTerms?.ratePercent || legalRef?.lawyer?.contingencyRatePercent || matchedRef?.contingencyPercent || 12.5;
          const referralId = legalRef?.referralId || matchedRef?.id || `REF-${claim.id}`;

          // Handler for lawyer request via POST /claims/:id/request-lawyer
          const handleRequestCounselAction = async () => {
            setIsEscalating(true);
            try {
              const res = await claimService.requestLawyer(claim.id);
              setClientActionFeedback('Dispute escalated to Accredited Legal Counsel! Matching verified banking litigation counsel.');
              if (onRequestCounsel) {
                onRequestCounsel(claim.id);
              }
              const updated = await claimService.getClaimById(claim.id);
              if (updated?.data) {
                setLiveClaim(updated.data);
              }
            } catch (err) {
              console.error('Failed to request legal counsel:', err);
              alert(err.message || 'Failed to request legal counsel matching.');
            } finally {
              setIsEscalating(false);
            }
          };

          // Handler for client decision via POST /referrals/:id/client-decision
          const handleClientDecisionAction = async (action) => {
            let reason = null;
            if (action === 'REJECT') {
              reason = prompt('Please specify a reason for declining counsel match:', 'Client opted for alternative counsel');
              if (reason === null) return; // User cancelled
            }

            setIsDeciding(true);
            try {
              const res = await referralService.submitClientDecision(referralId, action, reason);
              if (action === 'ACCEPT') {
                setClientActionFeedback('Representation Retainer executed! Senior banking litigation counsel is now actively representing you.');
                if (onUpdateReferralStatus) {
                  onUpdateReferralStatus(referralId, 'MUTUALLY_ACCEPTED');
                }
              } else {
                setClientActionFeedback('Counsel match declined. Dispute re-routed to clearing desk.');
                if (onUpdateReferralStatus) {
                  onUpdateReferralStatus(referralId, 'REJECTED_BY_CLIENT', { reason });
                }
              }
              const updated = await claimService.getClaimById(claim.id);
              if (updated?.data) {
                setLiveClaim(updated.data);
              }
            } catch (err) {
              console.error('Failed to submit client decision:', err);
              alert(err.message || 'Failed to submit decision.');
            } finally {
              setIsDeciding(false);
            }
          };

          if (hasReferral) {
            return (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: isMutuallyAccepted
                    ? '2px solid #10b981'
                    : isAwaitingDecision
                    ? '2px solid #f59e0b'
                    : '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                  position: 'relative'
                }}
              >
                {/* Header with Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: isMutuallyAccepted ? '#ecfdf5' : '#fff7ed',
                        color: isMutuallyAccepted ? '#047857' : '#c2410c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isMutuallyAccepted ? '1px solid #a7f3d0' : '1px solid #fed7aa'
                      }}
                    >
                      <Scale size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                        STATUTORY LEGAL COUNSEL REPRESENTATION
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: '2px 0 0 0', fontFamily: 'var(--font-heading)' }}>
                        {isAwaitingDecision && 'Legal Counsel Accepted Brief — Awaiting Your Consent'}
                        {isMutuallyAccepted && 'Mutual Legal Retainer Active & Binding'}
                        {isMatching && 'Matching Accredited Banking Litigation Counsel'}
                        {isRejectedByLawyer && 'Counsel Declined Brief (Conflict of Interest)'}
                        {isRejectedByClient && 'Representation Match Terminated by You'}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isAwaitingDecision && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                        <Clock size={13} />
                        <span>ACTION REQUIRED: REVIEW COUNSEL TERMS</span>
                      </span>
                    )}
                    {isMutuallyAccepted && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                        <ShieldCheck size={14} />
                        <span>RETAINER AGREEMENT EXECUTED</span>
                      </span>
                    )}
                    {isMatching && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                        <Clock size={13} />
                        <span>MATCHING ACCREDITED COUNSEL</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Counsel Details Box */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '18px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      ASSIGNED COUNSEL
                    </span>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {lawyerName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {lawyerFirm} • Bar Enrolment: <strong>NBA/ENR/2012/0481</strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      CONTINGENCY FEE RATE
                    </span>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#c2410c', marginTop: '2px' }}>
                      {contingencyPercent}% Contingency Yield
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>
                      ✓ No win, no fee (Zero upfront retainer)
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      STATUTORY JURISDICTION
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      Federal High Court & CBN Arbitration
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Formal Section 84 Pre-Action Demand Notice
                    </div>
                  </div>
                </div>

                {/* Feedback Toast Message if action taken */}
                {clientActionFeedback && (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      color: '#1e40af',
                      fontSize: '13px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={16} color="#2563eb" />
                    <span>{clientActionFeedback}</span>
                  </div>
                )}

                {/* Interactive Action Controls */}
                {isAwaitingDecision && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#475569', maxWidth: '600px', lineHeight: 1.5 }}>
                      <strong>{lawyerName}</strong> has reviewed your banking dispute evidence and accepted the brief at a <strong>{contingencyPercent}% contingency recovery fee</strong>. If you accept, counsel will serve Form 14 and lead statutory arbitration.
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleClientDecisionAction('REJECT')}
                        disabled={isDeciding}
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#64748b',
                          border: '1px solid #cbd5e1',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isDeciding ? 'wait' : 'pointer'
                        }}
                      >
                        <X size={15} />
                        <span>Decline Match</span>
                      </button>

                      <button
                        onClick={() => handleClientDecisionAction('ACCEPT')}
                        disabled={isDeciding}
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 20px',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: isDeciding ? 'wait' : 'pointer',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Check size={16} strokeWidth={3} />
                        <span>{isDeciding ? 'Executing Retainer...' : 'Accept Legal Representation'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {isMutuallyAccepted && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13px', fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      <span>Counsel is actively pursuing recovery of ₦{claim.amountFormatted} with respondent clearing desk.</span>
                    </div>

                    <button
                      onClick={() => onOpenDemandNotice(claim)}
                      style={{
                        backgroundColor: '#072046',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={14} />
                      <span>View Counsel Statutory Demand Brief</span>
                    </button>
                  </div>
                )}

                {isMatching && (
                  <div style={{ fontSize: '13px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    {legalRef?.message || 'Platform is executing conflict checks and matching accredited banking litigation counsel. You will receive an immediate notice once counsel reviews the brief.'}
                  </div>
                )}

                {(isRejectedByLawyer || isRejectedByClient) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '14px',
                      borderTop: '1px solid #e2e8f0'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {isRejectedByLawyer
                        ? 'Counsel declined brief due to institution conflict. Would you like to match with alternative accredited counsel?'
                        : 'You declined this match. You can request reassignment to another counsel firm.'}
                    </span>
                    <button
                      onClick={handleRequestCounselAction}
                      disabled={isEscalating}
                      style={{
                        backgroundColor: '#072046',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: isEscalating ? 'wait' : 'pointer'
                      }}
                    >
                      {isEscalating ? 'Requesting...' : 'Request Alternative Counsel Match'}
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Case where no referral exists yet
          return (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px 24px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #fed7aa',
                    flexShrink: 0
                  }}
                >
                  <Scale size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                    Escalate to Accredited Legal Counsel (NBA Banking Litigation Network)
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Need statutory legal representation? Refer your dispute to senior litigation counsel on a contingency fee basis (zero upfront fees).
                  </p>
                </div>
              </div>

              <button
                onClick={handleRequestCounselAction}
                disabled={isEscalating}
                style={{
                  backgroundColor: '#072046',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isEscalating ? 'wait' : 'pointer',
                  boxShadow: '0 2px 6px rgba(7, 32, 70, 0.2)'
                }}
              >
                <Briefcase size={15} color="#ff8c00" />
                <span>{isEscalating ? 'Escalating Dispute...' : 'Refer to Accredited Legal Counsel'}</span>
              </button>
            </div>
          );
        })()}

        {/* 2-Column Main Dossier Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
            gap: '24px'
          }}
          className="dossier-grid"
        >
          {/* Left Column: Transaction Coordinates, Narrative, Audit Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Banking Coordinates Card */}
            <div className="surface-card">
              <h3 className="title-lg" style={{ color: 'var(--primary-navy)', marginBottom: '16px' }}>
                Electronic Banking & Clearing Coordinates
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  fontSize: '13px'
                }}
              >
                <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--rounded-md)' }}>
                  <span className="label-sm" style={{ color: 'var(--outline)', display: 'block', marginBottom: '4px' }}>
                    ORIGINATING BANK (DEBITED)
                  </span>
                  <strong style={{ fontSize: '14px', color: 'var(--neutral-charcoal)' }}>{claim.originBank}</strong>
                  <div className="tabular-nums" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                    Account: {claim.originAccount}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--rounded-md)' }}>
                  <span className="label-sm" style={{ color: 'var(--outline)', display: 'block', marginBottom: '4px' }}>
                    BENEFICIARY BANK (UNCREDITED)
                  </span>
                  <strong style={{ fontSize: '14px', color: 'var(--neutral-charcoal)' }}>{claim.beneficiaryBank}</strong>
                  <div className="tabular-nums" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                    Account: {claim.beneficiaryAccount} ({claim.beneficiaryName})
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--rounded-md)' }}>
                  <span className="label-sm" style={{ color: 'var(--outline)', display: 'block', marginBottom: '4px' }}>
                    NIBSS SESSION IDENTIFIER
                  </span>
                  <div
                    className="tabular-nums"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: 'var(--trust-blue)',
                      wordBreak: 'break-all'
                    }}
                  >
                    {claim.sessionId || 'N/A'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--rounded-md)' }}>
                  <span className="label-sm" style={{ color: 'var(--outline)', display: 'block', marginBottom: '4px' }}>
                    RETRIEVAL REFERENCE NO (RRN)
                  </span>
                  <div className="tabular-nums" style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>
                    {claim.rrn || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Case Statement */}
            <div className="surface-card">
              <h3 className="title-lg" style={{ color: 'var(--primary-navy)', marginBottom: '12px' }}>
                Claimant Affidavit & Case Narrative
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--neutral-charcoal)',
                  backgroundColor: 'var(--surface-container-low)',
                  padding: '16px',
                  borderRadius: 'var(--rounded-md)',
                  borderLeft: '3px solid var(--trust-blue)'
                }}
              >
                "{claim.narrative}"
              </p>
            </div>

            {/* Official Audit Trail */}
            <div className="surface-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <History size={18} color="var(--primary-navy)" />
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                  Regulatory Clearing & Audit Trail
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {claim.auditLog && claim.auditLog.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--surface-container-low)',
                      borderRadius: 'var(--rounded-md)',
                      borderLeft: '3px solid var(--primary-navy)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--primary-navy)' }}>
                        {log.actor}
                      </strong>
                      <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--outline)' }}>
                        {log.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-charcoal)' }}>
                      {log.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Timeline & Evidence Files */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Timeline Visualizer Card */}
            <div className="surface-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Layers size={18} color="var(--primary-navy)" />
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                  Statutory Resolution Progress
                </h3>
              </div>
              <ClaimTimeline timeline={claim.timeline} />
            </div>

            {/* Evidence Repository Card */}
            <div className="surface-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                  Evidence Repository
                </h3>
                <button
                  className="btn btn-secondary-blue btn-sm"
                  onClick={() => onOpenEvidenceModal(claim)}
                >
                  <UploadCloud size={14} />
                  <span>Upload</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {claim.evidenceFiles && claim.evidenceFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: 'var(--surface-container-low)',
                      border: '1px solid var(--neutral-border)',
                      borderRadius: 'var(--rounded-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FileText size={20} color="var(--trust-blue)" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-charcoal)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                          {file.type} • {file.size}
                        </span>
                        {file.sha256Hash && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                            SHA-256: {file.sha256Hash.slice(0, 16)}...
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost"
                      style={{ padding: '6px' }}
                      title="Download Evidence File"
                      onClick={() => {
                        const url = claimService.getEvidenceDownloadUrl(claim.id, file.id);
                        window.open(url, '_blank');
                      }}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Seal Card */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--neutral-border)',
                borderRadius: 'var(--rounded-lg)',
                textAlign: 'center'
              }}
            >
              <ShieldCheck size={28} color="#047857" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-navy)', letterSpacing: '0.04em' }}>
                JUDICIALLY BINDING RESTITUTION PROTOCOL
              </div>
              <p style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '4px' }}>
                All records timestamped on the sovereign financial reconciliation register. Admissible pursuant to Evidence Act 2011 (Section 84).
              </p>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .dossier-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </div>
    </PortalLayout>
  );
}
