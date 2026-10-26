import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import { claimService } from '../services';
import ClaimTimeline from '../components/ClaimTimeline';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  FileText,
  Download,
  UploadCloud,
  Layers,
  ChevronRight,
  CheckCircle2,
  Receipt
} from 'lucide-react';

export default function ClaimDetailView({
  claims = [],
  claim: directClaim,
  currentUser,
  onLogout,
  onBack,
  onOpenEvidenceModal
}) {
  const { claimId } = useParams();
  const navigate = useNavigate();

  const [liveClaim, setLiveClaim] = useState(directClaim || claims.find((c) => c.id === claimId) || claims[0]);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);

  // Load full dossier by code (e.g. RK-91755) via GET /claims/:id
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

  // Guaranteed single-currency string formatter (prevents ₦₦ double symbol)
  const formattedAmount = (() => {
    if (claim.amountFormatted) {
      const trimmed = String(claim.amountFormatted).trim();
      if (trimmed.startsWith('₦')) return trimmed;
      if (trimmed.startsWith('NGN')) return `₦${trimmed.replace(/^NGN\s*/, '')}`;
      return `₦${trimmed}`;
    }
    if (claim.amount != null) {
      const num = parseFloat(claim.amount) || 0;
      return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return '₦0.00';
  })();

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '28px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>

          {/* Navigation Breadcrumb / Back button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-ghost"
              onClick={handleBack}
              style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-navy)', fontWeight: 600 }}
            >
              <ArrowLeft size={16} />
              <span>Return to Case Dossier Registry</span>
            </button>
          </div>

          {/* Case Dossier Master Header Bar */}
          <div
            className="surface-card"
            style={{
              padding: '24px 28px',
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
                </div>

                <h2 className="title-lg" style={{ color: 'var(--neutral-charcoal)', margin: '0 0 6px 0', fontSize: '18px' }}>
                  {claim.categoryName || 'Financial Dispute'}
                </h2>

                <p className="body-sm" style={{ color: 'var(--outline)', margin: 0 }}>
                  Claimant: <strong style={{ color: 'var(--neutral-charcoal)' }}>{claim.claimant}</strong> ({claim.claimantType}) • Initiated on {claim.transactionDate}
                </p>
              </div>

              {/* Financial Restitution Value Box */}
              <div style={{ textAlign: 'right' }}>
                <span className="label-sm" style={{ color: 'var(--outline)', letterSpacing: '0.06em' }}>
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
                  {formattedAmount}
                </div>
              </div>
            </div>
          </div>

          {/* Service Fee Assessment & Payment Banner (if applicable) */}
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
                      ₦{Number(claim.serviceFee || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
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
                type="button"
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
                  Service fee of ₦{Number(claim.serviceFee || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })} paid via {claim.paymentGateway || 'Gateway'} (Ref: {claim.paymentReference}). Forensic clearing inquest is active.
                </span>
              </div>
              <button
                type="button"
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

          {/* Restructured 2-Column Grid: Left (Narrative & Evidence) | Right (Timeline) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
              gap: '24px',
              alignItems: 'start'
            }}
            className="dossier-grid"
          >
            {/* Left Column: Case Narrative & Evidence Repository */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Case Narrative */}
              <div className="surface-card">
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontSize: '16px', fontWeight: 700 }}>
                  Case Narrative
                </h3>
                <div
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--neutral-charcoal)',
                    backgroundColor: 'var(--surface-container-low)',
                    padding: '16px',
                    borderRadius: 'var(--rounded-md)',
                    borderLeft: '3px solid var(--trust-blue)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  "{claim.narrative || 'No statement provided.'}"
                </div>
              </div>

              {/* Evidence Repository */}
              <div className="surface-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 className="title-lg" style={{ color: 'var(--primary-navy)', margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    Evidence Repository
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary-blue btn-sm"
                    onClick={() => onOpenEvidenceModal && onOpenEvidenceModal(claim)}
                    style={{ fontWeight: 600 }}
                  >
                    <UploadCloud size={14} />
                    <span>Upload</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {claim.evidenceFiles && claim.evidenceFiles.length > 0 ? (
                    claim.evidenceFiles.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          backgroundColor: 'var(--surface-container-low)',
                          border: '1px solid var(--neutral-border)',
                          borderRadius: 'var(--rounded-md)',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                          <FileText size={20} color="var(--trust-blue)" style={{ flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden', minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--neutral-charcoal)',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                              title={file.name}
                            >
                              {file.name}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                              {file.type} • {file.size}
                            </span>
                            {file.sha256Hash && (
                              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                SHA-256: {file.sha256Hash.slice(0, 16)}...
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '6px', color: 'var(--primary-navy)', flexShrink: 0 }}
                          title="Download Evidence File"
                          onClick={() => {
                            const url = claimService.getEvidenceDownloadUrl(claim.id, file.id);
                            window.open(url, '_blank');
                          }}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: '24px 16px',
                        textAlign: 'center',
                        backgroundColor: 'var(--surface-container-low)',
                        border: '1px dashed var(--neutral-border)',
                        borderRadius: 'var(--rounded-md)'
                      }}
                    >
                      <p style={{ fontSize: '13px', color: 'var(--outline)', margin: '0 0 10px 0' }}>
                        No evidence files attached to this claim.
                      </p>
                      <button
                        type="button"
                        className="btn btn-secondary-blue btn-sm"
                        onClick={() => onOpenEvidenceModal && onOpenEvidenceModal(claim)}
                      >
                        <UploadCloud size={14} />
                        <span>Upload File</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Statutory Resolution Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="surface-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Layers size={18} color="var(--primary-navy)" />
                  <h3 className="title-lg" style={{ color: 'var(--primary-navy)', margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    Statutory Resolution Progress
                  </h3>
                </div>
                <ClaimTimeline timeline={claim.timeline || []} />
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
