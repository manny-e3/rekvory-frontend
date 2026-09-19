import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import CurrencyInput from '../components/CurrencyInput';
import RichTextEditor from '../components/RichTextEditor';
import { DISPUTE_CATEGORIES } from '../utils';
import { claimService, referenceService } from '../services';
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  FileText,
  AlertCircle,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trash2,
  Clock,
  Landmark,
  Scale,
  Zap,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';

export default function NewClaimWizard({
  initialCategory,
  onCancel,
  onCreateClaim,
  currentUser,
  onLogout
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [step, setStep] = useState(1); // 1 to 5 (5 is success)

  // Genuine Authenticated Form State
  const [category, setCategory] = useState(initialCategory || categoryParam || DISPUTE_CATEGORIES[0].id);
  const [customCategory, setCustomCategory] = useState('');
  const [claimantName, setClaimantName] = useState(currentUser?.name || '');
  const [claimantType, setClaimantType] = useState(currentUser?.type || 'Consumer');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  const [claimantPhone, setClaimantPhone] = useState(currentUser?.phone || '');

  const [originBank, setOriginBank] = useState('');
  const [originAccount, setOriginAccount] = useState('');
  const [beneficiaryBank, setBeneficiaryBank] = useState('');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [claimAgainst, setClaimAgainst] = useState('');

  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [rrn, setRrn] = useState('');

  const [narrative, setNarrative] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState(null);
  const [createdDemandNoticeId, setCreatedDemandNoticeId] = useState(null);
  const [statutorySlaRemaining, setStatutorySlaRemaining] = useState(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const selectedCategoryObj = DISPUTE_CATEGORIES.find((c) => c.id === category) || DISPUTE_CATEGORIES[0];

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    if (createdCaseId) {
      navigate(`/claims/${createdCaseId}`);
    } else {
      navigate('/dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (step === 1) {
      if (category === 'OTHER' && !customCategory.trim()) {
        alert('Please specify the nature of your dispute in the text box before proceeding.');
        return;
      }
    }
    if (step === 2) {
      if (!claimAgainst.trim()) {
        alert('Please specify who the claim is against.');
        return;
      }
      const plainNarrative = narrative ? narrative.replace(/<[^>]*>/g, '').trim() : '';
      if (!plainNarrative) {
        alert('Please describe what happened in the text area before proceeding.');
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid restitution amount in ₦');
        return;
      }
    }
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const newItems = Array.from(files).map((file) => {
      const sizeStr = file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      let docType = 'Supporting Document';
      const nameLower = file.name.toLowerCase();
      if (nameLower.endsWith('.pdf')) docType = 'PDF Document';
      else if (/\.(jpg|jpeg|png|webp|gif)$/.test(nameLower)) docType = 'Receipt / Image Proof';
      else if (/\.(doc|docx)$/.test(nameLower)) docType = 'Contract / Statement';
      else if (/\.(xls|xlsx|csv)$/.test(nameLower)) docType = 'Financial Ledger / Spreadsheet';

      return {
        name: file.name,
        size: sizeStr,
        type: docType,
        rawFile: file,
        uploadedAt: new Date().toISOString()
      };
    });

    setEvidenceList((prev) => [...prev, ...newItems]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleRemoveFile = (idx) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitClaim = async () => {
    if (!declarationAgreed) {
      alert('You must confirm the statutory legal declaration before lodgement.');
      return;
    }

    setIsSubmittingClaim(true);
    try {
      const numAmount = parseFloat(amount) || 85000;
      const finalCategoryName = category === 'OTHER' && customCategory.trim()
        ? customCategory.trim()
        : (selectedCategoryObj?.name || 'Dispute Claim');

      const targetEntity = claimAgainst.trim() || beneficiaryName || 'Respondent Entity';
      const res = await claimService.lodgeClaim({
        category,
        customCategory: category === 'OTHER' ? customCategory.trim() : null,
        claimAgainst: targetEntity,
        amount: numAmount,
        originBank: originBank || 'Direct Debited Account',
        originAccount: originAccount || 'N/A',
        beneficiaryBank: beneficiaryBank || targetEntity,
        beneficiaryAccount: beneficiaryAccount || 'N/A',
        beneficiaryName: targetEntity,
        transactionDate: transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString(),
        sessionId,
        rrn,
        narrative: narrative.trim() || `Statutory restitution claim against ${targetEntity} for unfulfilled obligation of ₦${numAmount}.`,
        evidenceFiles: evidenceList,
        statutoryDeclarationAgreed: true
      });

      const created = res?.data;
      const newId = created?.id || `RK-${Math.floor(10000 + Math.random() * 90000)}`;
      const newDemandNotice = created?.demandNoticeId || `DN-2026-${newId.split('-')[1] || '00042'}`;
      const slaRemaining = created?.slaTimeRemaining || `${selectedCategoryObj.slaHours || 48} Hours`;

      setCreatedCaseId(newId);
      setCreatedDemandNoticeId(newDemandNotice);
      setStatutorySlaRemaining(slaRemaining);
      setStep(5); // Confirmation screen

      // Upload any physical raw files in the background
      if (Array.isArray(evidenceList) && evidenceList.length > 0) {
        for (const f of evidenceList) {
          if (f.rawFile) {
            try {
              await claimService.uploadEvidence(newId, f.rawFile, f.type || 'Customer Document');
            } catch (upErr) {
              console.warn('[NewClaim] Background evidence upload notice:', upErr.message);
            }
          }
        }
      }

      if (onCreateClaim) {
        const newClaimObj = {
          id: newId,
          demandNoticeId: newDemandNotice,
          title: `${finalCategoryName} — ${targetEntity}`,
          categoryName: finalCategoryName,
          customCategory: category === 'OTHER' ? customCategory.trim() : null,
          claimAgainst: targetEntity,
          category,
          categoryName: selectedCategoryObj.name,
          claimant: claimantName,
          claimantType,
          amount: numAmount,
          amountFormatted: `₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
          originBank,
          originAccount,
          beneficiaryBank,
          beneficiaryAccount: beneficiaryAccount || 'N/A',
          beneficiaryName: beneficiaryName || 'Pending Verification',
          rrn: rrn || `RRN-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          sessionId: sessionId || `999057240916${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
          transactionDate: transactionDate ? transactionDate.replace('T', ' ') + ' WAT' : 'Just now',
          status: 'warning',
          statusLabel: 'Under Review',
          stage: 1,
          stageName: 'Dispute Lodged & Case Opened',
          priority: numAmount > 500000 ? 'Urgent' : 'High',
          slaTimeRemaining: slaRemaining,
          narrative: narrative.trim() || `Statutory restitution claim against ${targetEntity} for ₦${numAmount}.`,
          evidenceFiles: evidenceList,
          timeline: [
            {
              stage: 1,
              title: 'Dispute Lodged & Demand Served',
              date: 'Just now',
              description: 'Case registered into Sovereign Recovery. Originating and beneficiary coordinates validated.',
              completed: true,
              current: true
            },
            {
              stage: 2,
              title: 'Interbank Inquest & Switch Verification',
              date: `Target: T+${Math.floor((selectedCategoryObj.slaHours || 48) / 2)} Hours`,
              description: 'Electronic inquest dispatched to respondent institution clearing desks.',
              completed: false
            },
            {
              stage: 3,
              title: 'Arbitration & Settlement Directive',
              date: `Target: T+${selectedCategoryObj.slaHours || 48} Hours`,
              description: 'CBN Restitution Protocols & Institutional arbitration window.',
              completed: false
            },
            {
              stage: 4,
              title: 'Restitution Issued & Disbursement',
              date: 'Pending',
              description: 'Disbursement of full restitution to claimant originating account.',
              completed: false
            }
          ],
          auditLog: [
            {
              timestamp: 'Just now',
              actor: claimantName,
              action: `Dispute filed for ₦${numAmount.toLocaleString('en-NG')} via Sovereign Recovery Portal.`
            },
            {
              timestamp: 'Just now',
              actor: 'Sovereign Dispatch Engine',
              action: `Automated demand notice #${newDemandNotice} served to ${targetEntity}.`
            }
          ]
        };
        onCreateClaim(newClaimObj);
      }
    } catch (err) {
      console.error('Failed to lodge claim:', err);
      alert(err.message || 'Failed to lodge dispute. Please check your network connection.');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Steps metadata
  const stepsMeta = [
    { num: 1, title: 'Classification', desc: 'Dispute type & legal basis' },
    { num: 2, title: 'Tell us about it', desc: 'Claim respondent & details' },
    { num: 3, title: 'Evidence & Proof', desc: 'Statements & attachments' },
    { num: 4, title: 'Review & Serve', desc: 'Statutory demand notice' }
  ];

  const categoryIcons = {
    FAILED_NIP_TRANSFER: Landmark,
    CONTESTED_POS_DEBIT: CreditCard,
    UNFULFILLED_MERCHANT: ShoppingBag,
    GATEWAY_CHARGEBACK: RotateCcw,
    ATM_DISPENSE_ERROR: Building2
  };

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '32px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Top Breadcrumb Back Navigation */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handleCancel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontFamily: 'var(--font-heading)',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <ArrowLeft size={16} />
              <span>Return to Dashboard</span>
            </button>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#475569'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>CBN Directive SLA 48h Active</span>
            </div>
          </div>

          {/* Page Master Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#475569', textTransform: 'uppercase' }}>
                OFFICIAL FINANCIAL OMBUDSMAN PROTOCOL
              </span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#071a38', letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Create Financial Restitution Claim
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              Follow the guided statutory stages to initiate automated interbank arbitration and legal fund recovery.
            </p>
          </div>

          {/* Stepper Header Bar */}
          {step <= 4 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px 24px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {stepsMeta.map((s) => {
                  const isCurrent = step === s.num;
                  const isDone = step > s.num;

                  return (
                    <div
                      key={s.num}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        backgroundColor: isCurrent ? '#f1f5fd' : 'transparent',
                        borderLeft: isCurrent ? '3px solid #2563eb' : '3px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#10b981' : isCurrent ? '#072046' : '#e2e8f0',
                          color: isDone || isCurrent ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '12px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {isDone ? <Check size={14} /> : s.num}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: isCurrent ? 700 : 600,
                            color: isCurrent ? '#071a38' : isDone ? '#0f172a' : '#94a3b8',
                            lineHeight: 1.2
                          }}
                        >
                          {s.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Classification */}
          {step === 1 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                  Select Dispute Classification
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Choose the category that best matches your failed transaction to invoke the relevant CBN directive.
                </p>
              </div>

              {/* 3x2 Grid of Category Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: category === 'OTHER' ? '20px' : '32px'
                }}
              >
                {DISPUTE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '28px 16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#fffdf5' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected
                          ? '0 4px 14px rgba(245, 158, 11, 0.12)'
                          : '0 1px 3px rgba(0, 0, 0, 0.02)',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                      }}
                    >
                      <div
                        style={{
                          fontSize: '38px',
                          lineHeight: 1,
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {cat.icon}
                      </div>
                      <div
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: '#071a38',
                          fontFamily: 'var(--font-heading)'
                        }}
                      >
                        {cat.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic text box if "Other" is selected */}
              {category === 'OTHER' && (
                <div
                  style={{
                    marginBottom: '32px',
                    padding: '20px 22px',
                    backgroundColor: '#fffdf5',
                    borderRadius: '12px',
                    border: '1.5px solid #fde68a',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.06)'
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#071a38',
                      marginBottom: '8px'
                    }}
                  >
                    Specify Dispute Category / Nature <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type the specific nature of your dispute here..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #f59e0b',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                    Please provide details regarding this dispute so our clearing desk and legal panel can apply the appropriate statutory directive.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleNext}
                  style={{
                    backgroundColor: '#072046',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Continue to Claim Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Banking Coordinates */}
          {step === 2 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Section Header: Tell us about it */}
              <div style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#071a38',
                    margin: '0 0 6px 0',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Tell us about it
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                  Specify who this dispute is against and describe what transpired.
                </p>
              </div>

              {/* Verified Claimant Banner */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      Claimant: {claimantName} ({claimantType})
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {claimantEmail} • {claimantPhone}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '3px 10px',
                    borderRadius: '999px'
                  }}
                >
                  ✓ Verified Claimant
                </span>
              </div>

              {/* Form Fields: Who is the claim against? & What happened? */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '28px' }}>
                {/* Who is the claim against? */}
                <div className="form-group">
                  <label
                    htmlFor="claim-against"
                    style={{
                      display: 'block',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      color: '#071a38',
                      marginBottom: '8px'
                    }}
                  >
                    Who is the claim against?
                  </label>
                  <input
                    id="claim-against"
                    type="text"
                    className="form-control"
                    value={claimAgainst}
                    onChange={(e) => {
                      setClaimAgainst(e.target.value);
                      setBeneficiaryName(e.target.value);
                    }}
                    placeholder="XYZ Ltd"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      color: '#071a38',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* What happened? (Rich HTML Editor - No Media Upload) */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label
                      htmlFor="what-happened"
                      style={{
                        display: 'block',
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: '#071a38',
                        margin: 0
                      }}
                    >
                      What happened?
                    </label>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Rich text supported • Media uploads disabled
                    </span>
                  </div>
                  <RichTextEditor
                    value={narrative}
                    onChange={(val) => setNarrative(val)}
                    placeholder="I paid ₦185,000 for a service that was never delivered. I have followed up three times with no response."
                    minHeight="140px"
                  />
                </div>
              </div>

              {/* Amount & Audit Trackers */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#fbfbfe',
                  marginBottom: '28px'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>

                  {/* Amount Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="restitution-amount">
                      <span>Restitution Amount Claimed (₦)</span>
                      <span className="form-hint">100% Principal Sum</span>
                    </label>
                    <CurrencyInput
                      id="restitution-amount"
                      value={amount}
                      onChange={setAmount}
                      placeholder="85,000.00"
                    />
                  </div>

                  {/* Transaction Date */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="trans-date">
                      Transaction Date
                    </label>
                    <input
                      id="trans-date"
                      type="date"
                      className="form-control"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                    />
                  </div>



                </div>
              </div>

              {/* Wizard Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handlePrev}
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Classification</span>
                </button>

                <button
                  onClick={handleNext}
                  style={{
                    backgroundColor: '#072046',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Continue to Evidence & Proof</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Evidence & Narrative */}
          {step === 3 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                  Lodged Evidence & Supporting Documents
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Attach receipts, invoices, communication logs, or relevant documents for the dispute resolution panel.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileDrop}
                style={{
                  border: isDraggingFile ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  backgroundColor: isDraggingFile ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isDraggingFile) {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#f1f5fd';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDraggingFile) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <UploadCloud size={42} color="#2563eb" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#071a38', marginBottom: '4px' }}>
                  {isDraggingFile ? 'Drop your files here to attach' : 'Click to select or drag & drop files here'}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                  Attach payment receipts, debit alerts, invoices, contract agreements, or correspondence
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                  Supports PDF, PNG, JPG, DOCX, XLSX up to 25MB (Encrypted & timestamped under Evidence Act 2011)
                </div>
              </div>

              {/* Attached Files List */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>
                    ATTACHED PROOF FILES ({evidenceList.length})
                  </div>
                  {evidenceList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      + Add More Files
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {evidenceList.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={16} color="#2563eb" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{file.name}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>({file.size})</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 600, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px' }}>
                          {file.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>



              {/* Wizard Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handlePrev}
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Claim Details</span>
                </button>

                <button
                  onClick={handleNext}
                  style={{
                    backgroundColor: '#072046',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Review & Serve Demand Notice</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Serve Demand Notice */}
          {step === 4 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                  Statutory Review & Electronic Demand Notice
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Review your claim dossier. Upon submission, an enforceable electronic demand will be immediately dispatched to both institutions' clearing desks.
                </p>
              </div>

              {/* Summary Dossier Card */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: '#fbfbfe',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#2563eb', textTransform: 'uppercase' }}>
                      {category === 'OTHER' && customCategory.trim() ? customCategory.trim() : selectedCategoryObj.name}
                    </span>
                    <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#071a38', margin: '4px 0 0 0' }}>
                      ₦{parseFloat(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Full Principal Restitution</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#fff7ed',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
                      <span>Ready for Service</span>
                    </span>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                      SLA: {selectedCategoryObj.defaultResolutionTime}
                    </div>
                  </div>
                </div>

                {/* Grid details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11.5px' }}>Claim Against / Respondent:</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{claimAgainst || beneficiaryName || 'Respondent Entity'}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Target Respondent</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11.5px' }}>Disputed Category:</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{category === 'OTHER' && customCategory.trim() ? customCategory.trim() : selectedCategoryObj.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Statutory Basis Verified</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11.5px' }}>Transaction Date:</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{transactionDate || 'Immediate / As Stated'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11.5px' }}>Attached Proof:</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{evidenceList.length} Files Lodged</div>
                  </div>
                </div>
              </div>

              {/* Service Desks */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  RECIPIENT CLEARING DESKS TO BE SERVED INSTANTLY:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span><strong>{claimAgainst || beneficiaryName || 'Respondent Entity'}</strong> — Designated Respondent & Settlement Officer</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span><strong>Sovereign Recovery Clearing Inquest Desk</strong> — Case File Dispatch & Arbitration Protocol</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span><strong>Consumer Protection & Arbitration Registry</strong> — Statutory Enforcement Archive</span>
                  </div>
                </div>
              </div>

              {/* Legal Declaration Checkbox */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  marginBottom: '28px'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={declarationAgreed}
                    onChange={(e) => setDeclarationAgreed(e.target.checked)}
                    style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                    I hereby declare pursuant to the Federal Competition & Consumer Protection Act and Evidence Act 2011 that the financial debits and facts stated above are accurate. I authorize Sovereign Recovery to serve electronic restitution demands and enforce statutory interbank reconciliation on my behalf.
                  </span>
                </label>
              </div>

              {/* Wizard Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handlePrev}
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Evidence</span>
                </button>

                <button
                  onClick={handleSubmitClaim}
                  disabled={!declarationAgreed || isSubmittingClaim}
                  style={{
                    backgroundColor: declarationAgreed && !isSubmittingClaim ? '#e68000' : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 32px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: declarationAgreed && !isSubmittingClaim ? 'pointer' : 'not-allowed',
                    boxShadow: declarationAgreed && !isSubmittingClaim ? '0 4px 16px rgba(230, 128, 0, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ShieldAlert size={18} />
                  <span>{isSubmittingClaim ? 'Lodging Dispute & Serving Notice...' : 'Lodge Claim & Serve Demand Notice'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation Success */}
          {step === 5 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '48px 36px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '14px'
                }}
              >
                <span>DEMAND NOTICE: {createdDemandNoticeId || `DN-2026-${(createdCaseId || '').split('-')[1] || '00042'}`}</span>
                <span>•</span>
                <span>DISPATCHED</span>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#071a38', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                Case Dossier #{createdCaseId} Established
              </h2>

              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.55 }}>
                Electronic Form 14 restitution demand notice automatically dispatched to <strong>{claimAgainst || beneficiaryName || 'Respondent Entity'}</strong> and Sovereign Recovery Clearing Inquest Desk. Statutory SLA clock has commenced.
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  maxWidth: '460px',
                  margin: '0 auto 32px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '13px'
                }}
              >
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Restitution Value</div>
                  <div style={{ fontWeight: 800, color: '#071a38', fontSize: '16px' }}>
                    ₦{parseFloat(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Statutory SLA Window</div>
                  <div style={{ fontWeight: 800, color: '#e68000', fontSize: '16px' }}>
                    {statutorySlaRemaining || `${selectedCategoryObj.slaHours || 48} Hours`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/claims/${createdCaseId}`)}
                  style={{
                    backgroundColor: '#072046',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Track Dispute Dossier Now</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </PortalLayout>
  );
}
