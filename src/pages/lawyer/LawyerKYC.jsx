import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerLayout from '../../layout/LawyerLayout';
import { lawyerService, resolveMediaUrl } from '../../services/lawyerService';
import {
  ShieldCheck,
  Award,
  FileText,
  CheckCircle2,
  Building,
  Scale,
  Calendar,
  Download,
  UploadCloud,
  ExternalLink,
  Lock,
  Eye,
  AlertCircle,
  Printer,
  X,
  Check,
  Sparkles,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Info,
  FileCheck,
  AlertTriangle,
  Landmark,
  ShieldAlert,
  Send,
  HelpCircle
} from 'lucide-react';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'SunTrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' }
];

const NBA_BRANCHES = [
  'Lagos Branch (Premier Bar)',
  'Ikeja Branch (Tiger Bar)',
  'Abuja Branch (Unity Bar)',
  'Port Harcourt Branch',
  'Ibadan Branch',
  'Enugu Branch',
  'Kano Branch',
  'Benin Branch (Lion Bar)',
  'Kaduna Branch',
  'Calabar Branch',
  'Warri Branch',
  'Abeokuta Branch',
  'Uyo Branch',
  'Jos Branch',
  'Akure Branch',
  'Onitsha Branch',
  'Owerri Branch',
  'Ilorin Branch',
  'Other NBA Branch'
];

const LAW_SCHOOL_CAMPUSES = [
  'Bwari Campus, Abuja (Headquarters)',
  'Victoria Island Campus, Lagos',
  'Augustine Nnamani Campus, Agbani, Enugu',
  'Bagauda Campus, Kano',
  'Yenagoa Campus, Bayelsa',
  'Yola Campus, Adamawa'
];

export default function LawyerKYC({ lawyerUser, onLogout, onSwitchRole }) {
  const navigate = useNavigate();

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingSlot, setIsUploadingSlot] = useState(null);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Workflow step state (1 to 4 for filing)
  const [currentStep, setCurrentStep] = useState(1);
  const [forceEditMode, setForceEditMode] = useState(false);

  // Modals state
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [supplementaryCategory, setSupplementaryCategory] = useState('Annual Practicing Authorization');
  const [supplementaryTitle, setSupplementaryTitle] = useState('');

  // KYC Dossier Data loaded from backend
  const [kycData, setKycData] = useState({
    kycStatus: lawyerUser?.kycStatus || 'PENDING_SUBMISSION',
    kycSubmittedAt: null,
    kycRejectionReason: null,
    nbaSealVerified: Boolean(lawyerUser?.nbaSealVerified),
    completionScore: '0/5',
    completionPercent: 0,
    documents: [],
    milestones: []
  });

  // Statutory Application Form State
  const [formState, setFormState] = useState({
    nbaEnrollmentNumber: '',
    callToBarYear: '',
    nbaBranch: 'Lagos Branch (Premier Bar)',
    lawSchoolCampus: 'Victoria Island Campus, Lagos',
    scumlNumber: '',
    tinNumber: '',
    disciplinaryDeclaration: true,
    trustBankName: 'Zenith Bank',
    trustAccountNumber: '',
    trustAccountName: '',
    statutoryDeclarationAccepted: false
  });

  // Hidden file input refs for dedicated document upload slots
  const callToBarRef = useRef(null);
  const practicingRef = useRef(null);
  const idCardRef = useRef(null);
  const cacRef = useRef(null);
  const supplementaryRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load KYC Dossier from Backend
  const fetchKYCDossier = async () => {
    try {
      setIsLoading(true);
      const res = await lawyerService.getKYC();
      if (res && res.data) {
        const d = res.data;
        const p = d.profile || {};

        setKycData({
          kycStatus: d.kycStatus || p.kycStatus || 'PENDING_SUBMISSION',
          kycSubmittedAt: d.kycSubmittedAt || p.kycSubmittedAt || null,
          kycRejectionReason: d.kycRejectionReason || p.kycRejectionReason || null,
          nbaSealVerified: Boolean(d.nbaSealVerified || p.nbaSealVerified),
          completionScore: d.completionScore || '0/5',
          completionPercent: d.completionPercent || 0,
          documents: d.documents || [],
          milestones: d.milestones || []
        });

        // Populate Statutory Application Form fields
        const scnClean = p.nbaEnrollmentNumber && !p.nbaEnrollmentNumber.includes('PENDING')
          ? p.nbaEnrollmentNumber
          : '';

        setFormState((prev) => ({
          ...prev,
          nbaEnrollmentNumber: scnClean,
          callToBarYear: p.callToBarYear ? String(p.callToBarYear) : '',
          nbaBranch: p.nbaBranch || 'Lagos Branch (Premier Bar)',
          lawSchoolCampus: p.lawSchoolCampus || 'Victoria Island Campus, Lagos',
          scumlNumber: p.scumlNumber || '',
          tinNumber: p.tinNumber || '',
          disciplinaryDeclaration: p.disciplinaryDeclaration !== undefined ? Boolean(p.disciplinaryDeclaration) : true,
          trustBankName: p.trustBankName || p.bankName || 'Zenith Bank',
          trustAccountNumber: p.trustAccountNumber || p.accountNumber || '',
          trustAccountName: p.trustAccountName || p.accountName || (p.lawFirmName ? `${p.lawFirmName} Client Trust Account` : '')
        }));
      }
    } catch (err) {
      console.error('Failed to load KYC dossier:', err);
      showToast('Could not load accreditation dossier from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCDossier();
  }, []);

  // Helper to check if a specific document category is uploaded
  const getDocumentByCategory = (categoryKey) => {
    if (!kycData.documents || kycData.documents.length === 0) return null;
    return kycData.documents.find((doc) => {
      const cat = (doc.category || '').toLowerCase();
      const title = (doc.title || '').toLowerCase();
      if (categoryKey === 'call_to_bar') {
        return cat.includes('call to bar') || title.includes('call to bar');
      }
      if (categoryKey === 'practicing') {
        return cat.includes('practicing') || cat.includes('seal') || cat.includes('license') || title.includes('practicing');
      }
      if (categoryKey === 'id') {
        return cat.includes('id') || cat.includes('identification') || cat.includes('identity') || title.includes('id');
      }
      if (categoryKey === 'cac') {
        return cat.includes('cac') || cat.includes('firm') || cat.includes('incorporation') || title.includes('cac');
      }
      return false;
    });
  };

  // Upload Document Handler for Dedicated Slots
  const handleSlotUpload = async (e, slotKey, categoryName, defaultTitle) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must not exceed 10MB.', 'error');
      e.target.value = '';
      return;
    }

    try {
      setIsUploadingSlot(slotKey);
      const res = await lawyerService.uploadKYCDocument({
        file,
        category: categoryName,
        title: defaultTitle,
        issuingAuthority: 'Nigerian Bar Association / Supreme Court of Nigeria'
      });

      if (res && res.data) {
        showToast(`${defaultTitle} lodged successfully.`, 'success');
        await fetchKYCDossier();
      }
    } catch (err) {
      console.error('Document upload failed:', err);
      showToast(err.message || 'Failed to upload document file.', 'error');
    } finally {
      setIsUploadingSlot(null);
      e.target.value = '';
    }
  };

  // Upload Supplementary Document
  const handleSupplementaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supplementaryTitle.trim()) {
      showToast('Please enter a descriptive document title.', 'error');
      return;
    }

    try {
      setIsUploadingSlot('supplementary');
      const res = await lawyerService.uploadKYCDocument({
        file,
        category: supplementaryCategory,
        title: supplementaryTitle.trim(),
        issuingAuthority: 'Accredited Regulatory Body'
      });

      if (res && res.data) {
        showToast('Supplementary document lodged successfully.', 'success');
        setUploadModalOpen(false);
        setSupplementaryTitle('');
        await fetchKYCDossier();
      }
    } catch (err) {
      console.error('Supplementary upload failed:', err);
      showToast(err.message || 'Failed to lodge document.', 'error');
    } finally {
      setIsUploadingSlot(null);
      if (supplementaryRef.current) supplementaryRef.current.value = '';
    }
  };

  // Delete Document
  const handleDeleteDocument = async (docId, title) => {
    if (!window.confirm(`Remove document "${title}" from your legal accreditation repository?`)) {
      return;
    }

    try {
      await lawyerService.deleteKYCDocument(docId);
      showToast('Document removed successfully.', 'success');
      await fetchKYCDossier();
    } catch (err) {
      console.error('Delete document failed:', err);
      showToast(err.message || 'Failed to remove document.', 'error');
    }
  };

  // Step Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!formState.nbaEnrollmentNumber.trim()) {
        showToast('Please provide your Supreme Court Enrollment Number (SCN).', 'error');
        return false;
      }
      if (!formState.callToBarYear) {
        showToast('Please specify your Year of Call to the Nigerian Bar.', 'error');
        return false;
      }
      const year = parseInt(formState.callToBarYear, 10);
      if (isNaN(year) || year < 1960 || year > new Date().getFullYear()) {
        showToast('Please enter a valid Call to Bar Year.', 'error');
        return false;
      }
      if (!formState.nbaBranch) {
        showToast('Please select your NBA Branch affiliation.', 'error');
        return false;
      }
      if (!formState.lawSchoolCampus) {
        showToast('Please specify your Nigerian Law School campus.', 'error');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formState.disciplinaryDeclaration) {
        showToast('You must affirm the LPDC Disciplinary Standing declaration.', 'error');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const callToBarDoc = getDocumentByCategory('call_to_bar');
      if (!callToBarDoc) {
        showToast('Call to the Bar Certificate is mandatory before proceeding.', 'error');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formState.trustAccountNumber.trim()) {
        showToast('Please provide your designated Section 20 Client Trust NUBAN account number.', 'error');
        return false;
      }
      if (formState.trustAccountNumber.trim().length !== 10) {
        showToast('NUBAN account number must be 10 digits.', 'error');
        return false;
      }
      if (!formState.trustAccountName.trim()) {
        showToast('Please specify the designated Client Trust Account Name.', 'error');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Submit Application
  const handleSubmitKYCApplication = async () => {
    if (!formState.statutoryDeclarationAccepted) {
      showToast('You must accept the formal electronic declaration to submit.', 'error');
      return;
    }

    // Full validation
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    try {
      setIsSubmittingKYC(true);
      const res = await lawyerService.submitKYC({
        nbaEnrollmentNumber: formState.nbaEnrollmentNumber.trim(),
        callToBarYear: formState.callToBarYear,
        nbaBranch: formState.nbaBranch,
        lawSchoolCampus: formState.lawSchoolCampus,
        scumlNumber: formState.scumlNumber ? formState.scumlNumber.trim() : null,
        tinNumber: formState.tinNumber ? formState.tinNumber.trim() : null,
        disciplinaryDeclaration: formState.disciplinaryDeclaration,
        trustBankName: formState.trustBankName,
        trustAccountNumber: formState.trustAccountNumber.trim(),
        trustAccountName: formState.trustAccountName.trim()
      });

      if (res && res.data) {
        showToast('Accreditation dossier submitted successfully for regulatory audit.', 'success');
        setForceEditMode(false);
        await fetchKYCDossier();
      }
    } catch (err) {
      console.error('KYC submission failed:', err);
      showToast(err.message || 'Failed to submit accreditation dossier.', 'error');
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const isVerified = kycData.kycStatus === 'VERIFIED' || kycData.nbaSealVerified;
  const isUnderReview = (kycData.kycStatus === 'UNDER_REVIEW' || kycData.kycStatus === 'SUBMITTED') && !forceEditMode;
  const isFilingMode = !isVerified && !isUnderReview;

  return (
    <LawyerLayout
      lawyerUser={{ ...lawyerUser, kycStatus: kycData.kycStatus, nbaSealVerified: kycData.nbaSealVerified }}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
    >
      <div style={{ padding: '32px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* TOAST ALERT */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              backgroundColor: toastMessage.type === 'error' ? '#991B1B' : '#0B2D5B',
              color: '#ffffff',
              padding: '14px 22px',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
              maxWidth: '440px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            {toastMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <div style={{ flex: 1 }}>{toastMessage.msg}</div>
            <button
              onClick={() => setToastMessage(null)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* TOP STATUS HEADER BANNER */}
        <div
          style={{
            backgroundColor: '#071a38',
            borderRadius: '18px',
            padding: '32px',
            color: '#ffffff',
            boxShadow: '0 10px 30px -5px rgba(7, 26, 56, 0.25)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle decorative judicial watermark */}
          <div
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-30px',
              opacity: 0.05,
              pointerEvents: 'none'
            }}
          >
            <Scale size={240} />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '24px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Award size={13} />
                  <span>Statutory Legal Accreditation</span>
                </span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Cap L11 LFN 2004 Compliance</span>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Judicial Accreditation & Compliance KYC
              </h1>
              <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
                Statutory legal qualification verification portal for active litigation dispatch, platform seal authorization,
                and Section 20 client trust account clearance.
              </p>
            </div>

            {/* STATUS PILL */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              {isVerified && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(5, 150, 105, 0.2)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Official Council Accreditation Active</span>
                </div>
              )}

              {isUnderReview && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(217, 119, 6, 0.2)',
                    border: '1px solid #f59e0b',
                    color: '#fbbf24',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <Clock size={18} className="animate-spin" />
                  <span>Dossier Under Regulatory Audit</span>
                </div>
              )}

              {isFilingMode && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(100, 116, 139, 0.25)',
                    border: '1px solid #94a3b8',
                    color: '#f1f5f9',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <FileText size={18} />
                  <span>Application Incomplete (Draft)</span>
                </div>
              )}

              {/* ACTION BUTTONS ON HEADER */}
              {isVerified && (
                <button
                  type="button"
                  onClick={() => setCertificateModalOpen(true)}
                  style={{
                    backgroundColor: '#D4AF37',
                    color: '#071a38',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  <Award size={16} />
                  <span>View Council Certificate</span>
                </button>
              )}

              {isUnderReview && (
                <button
                  type="button"
                  onClick={() => setForceEditMode(true)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Edit / Update Application</span>
                </button>
              )}
            </div>
          </div>

          {/* PROGRESS METRICS BAR */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Statutory Compliance Pillars:</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#D4AF37' }}>
                {kycData.completionScore} Pillars Lodged
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', maxWidth: '380px' }}>
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${kycData.completionPercent}%`,
                    height: '100%',
                    backgroundColor: isVerified ? '#10b981' : '#D4AF37',
                    borderRadius: '10px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', minWidth: '36px' }}>
                {kycData.completionPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: UNDER REVIEW TRACKING LIFECYCLE (When Submitted) */}
        {/* ========================================================================= */}
        {isUnderReview && (
          <div>
            {/* AUDIT STATUS CARD */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                marginBottom: '28px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706'
                  }}
                >
                  <Clock size={26} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                    Accreditation Dossier Under Clearing Desk Verification
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Application successfully recorded on{' '}
                    <strong style={{ color: '#0f172a' }}>
                      {kycData.kycSubmittedAt ? new Date(kycData.kycSubmittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent Submission'}
                    </strong>
                    . Standard judicial verification turnaround is 24 to 48 business hours.
                  </p>
                </div>
              </div>

              {/* TIMELINE PROGRESS */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '16px',
                  marginTop: '24px',
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* Milestone 1 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Check size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#071a38' }}>1. Dossier Lodged</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Credentials & Documents Digitally Timestamped
                    </div>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Clock size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#b45309' }}>2. SCN Roll Audit</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Supreme Court Roll & NBA Branch Cross-Referencing
                    </div>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <span>3</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>3. SCUML & Compliance</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Anti-Money Laundering & Disciplinary Clearance
                    </div>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <span>4</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>4. Seal Certification</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Council Seal Issuance & Litigation Authorization
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LODGED CREDENTIALS SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              {/* Card 1: Supreme Court Credentials */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Scale size={20} color="#0B2D5B" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                    Supreme Court Roll Particulars
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      SCN ENROLLMENT NUMBER
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B2D5B', marginTop: '2px', fontFamily: 'monospace' }}>
                      {formState.nbaEnrollmentNumber || 'Pending SCN'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        CALL TO THE BAR YEAR
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#071a38', marginTop: '2px' }}>
                        {formState.callToBarYear || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        NBA BRANCH
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#071a38', marginTop: '2px' }}>
                        {formState.nbaBranch || '—'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      LAW SCHOOL TRAINING CAMPUS
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#071a38', marginTop: '2px' }}>
                      {formState.lawSchoolCampus || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Regulatory Standing */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <ShieldCheck size={20} color="#0B2D5B" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                    Regulatory & Disciplinary Disclosures
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        SCUML REGISTRATION
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#071a38', marginTop: '2px' }}>
                        {formState.scumlNumber || 'Exempt / Chambers Pending'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        TAX ID (TIN)
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#071a38', marginTop: '2px' }}>
                        {formState.tinNumber || '—'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      LPDC DISCIPLINARY STANDING
                    </div>
                    <div
                      style={{
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#059669',
                        fontWeight: 700
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Clean Standing Formally Affirmed</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      LPA SEC. 20 CLIENT TRUST ACCOUNT
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#071a38', marginTop: '2px' }}>
                      {formState.trustBankName} • {formState.trustAccountNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>({formState.trustAccountName})</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LODGED DOCUMENTS REPOSITORY IN REVIEW */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                    Statutory Verification Documents Repository
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Official certificates lodged for Supreme Court and Clearing Desk inspection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  style={{
                    backgroundColor: '#0B2D5B',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <UploadCloud size={16} />
                  <span>Lodge Supplementary Document</span>
                </button>
              </div>

              {kycData.documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <FileText size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>No verification documents lodged yet.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {kycData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {doc.category}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            {doc.fileSize || 'PDF/Scan'} • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#ecfdf5',
                            color: '#059669'
                          }}
                        >
                          {doc.status || 'LODGED'}
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDocPreview(doc)}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#0B2D5B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #fecaca',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                            title="Remove document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: VERIFIED COUNCIL ACCREDITATION STANDING */}
        {/* ========================================================================= */}
        {isVerified && (
          <div>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #a7f3d0',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
                marginBottom: '28px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #6ee7b7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669'
                    }}
                  >
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      JUDICIAL ACCREDITATION ACTIVE
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#071a38', margin: '4px 0 0 0' }}>
                      Accredited Legal Practitioner — Restitution Panel Roll
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                      Supreme Court Enrollment <strong style={{ color: '#0B2D5B' }}>{formState.nbaEnrollmentNumber}</strong> officially verified.
                      Authorized to issue demand notices and manage restitution briefs.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCertificateModalOpen(true)}
                  style={{
                    backgroundColor: '#0B2D5B',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(11, 45, 91, 0.2)'
                  }}
                >
                  <Award size={18} color="#D4AF37" />
                  <span>Official Council Certificate</span>
                </button>
              </div>

              {/* Verified Capabilities */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginTop: '28px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Litigation Brief Intake Clearance
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Formal Pre-Action Notice Seal
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Section 20 Client Trust Escrow Certified
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Dual-Control Settlement Routing
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Document Archive */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', marginBottom: '16px' }}>
                Accredited Credentials Repository
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {kycData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileCheck size={24} color="#059669" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38' }}>{doc.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.category}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDocPreview(doc)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0B2D5B',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: INTERACTIVE STATUTORY ACCREDITATION FILING PROCESS (Draft / Incomplete) */}
        {/* ========================================================================= */}
        {isFilingMode && (
          <div>
            {/* REJECTION / AUDIT ALERT IF PRESENT */}
            {kycData.kycRejectionReason && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '14px',
                  padding: '20px',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                    Compliance Audit Note — Rectification Required
                  </h4>
                  <p style={{ fontSize: '13px', color: '#7f1d1d', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {kycData.kycRejectionReason}
                  </p>
                </div>
              </div>
            )}

            {/* MULTI-STEP PROGRESS STEPPER */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px 32px',
                border: '1px solid #e2e8f0',
                marginBottom: '28px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {[
                  { step: 1, title: 'Bar Admission & SCN', desc: 'Roll Coordinates' },
                  { step: 2, title: 'Regulatory Standing', desc: 'SCUML & Disciplinary' },
                  { step: 3, title: 'Document Lodging', desc: 'Statutory Certificates' },
                  { step: 4, title: 'LPA Trust Escrow', desc: 'Sec. 20 Account' },
                  { step: 5, title: 'Attestation & Filing', desc: 'Electronic Submission' }
                ].map((item) => {
                  const isDone = currentStep > item.step;
                  const isCurrent = currentStep === item.step;

                  return (
                    <div
                      key={item.step}
                      onClick={() => {
                        if (item.step < currentStep || validateStep(currentStep)) {
                          setCurrentStep(item.step);
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        padding: '8px 4px'
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#10b981' : isCurrent ? '#0B2D5B' : '#f1f5f9',
                          color: isDone || isCurrent ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px auto',
                          fontWeight: 800,
                          fontSize: '14px',
                          border: isCurrent ? '2px solid #D4AF37' : 'none',
                          boxShadow: isCurrent ? '0 0 0 3px rgba(11, 45, 91, 0.15)' : 'none'
                        }}
                      >
                        {isDone ? <Check size={18} /> : item.step}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? '#0B2D5B' : isDone ? '#059669' : '#64748b'
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FORM CARD CONTAINER */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '36px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* ------------------------------------------------------------- */}
              {/* STEP 1: SUPREME COURT ENROLLMENT & CALL TO BAR CREDENTIALS */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 1 && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                      Stage 1: Supreme Court Roll & Call to Bar Credentials
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>
                      Enter your official Supreme Court Enrollment Number (SCN) and Call to the Nigerian Bar credentials.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        SUPREME COURT ENROLLMENT NUMBER (SCN) <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SCN049281"
                        value={formState.nbaEnrollmentNumber}
                        onChange={(e) => setFormState({ ...formState, nbaEnrollmentNumber: e.target.value.toUpperCase() })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#071a38',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Found on your Supreme Court enrollment receipt or NBA practicing card.
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        YEAR OF CALL TO THE NIGERIAN BAR <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2018"
                        min="1960"
                        max={new Date().getFullYear()}
                        value={formState.callToBarYear}
                        onChange={(e) => setFormState({ ...formState, callToBarYear: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        The official year appearing on your Body of Benchers certificate.
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        NBA BRANCH AFFILIATION <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select
                        value={formState.nbaBranch}
                        onChange={(e) => setFormState({ ...formState, nbaBranch: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        {NBA_BRANCHES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        NIGERIAN LAW SCHOOL TRAINING CAMPUS <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select
                        value={formState.lawSchoolCampus}
                        onChange={(e) => setFormState({ ...formState, lawSchoolCampus: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        {LAW_SCHOOL_CAMPUSES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 2: REGULATORY DISCLOSURES & DISCIPLINARY STANDING */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 2 && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                      Stage 2: Regulatory Disclosures & LPDC Disciplinary Standing
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>
                      Mandatory anti-money laundering (SCUML) disclosure and professional discipline affirmations.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        SCUML REGISTRATION NUMBER (EFCC / AML)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SC/EFCC/2021/08214"
                        value={formState.scumlNumber}
                        onChange={(e) => setFormState({ ...formState, scumlNumber: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Special Control Unit Against Money Laundering certificate registration number.
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        TAX IDENTIFICATION NUMBER (TIN)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 23819041-0001"
                        value={formState.tinNumber}
                        onChange={(e) => setFormState({ ...formState, tinNumber: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Federal Inland Revenue Service (FIRS) / Joint Tax Board TIN.
                      </div>
                    </div>
                  </div>

                  {/* STATUTORY LPDC DISCIPLINARY DECLARATION */}
                  <div
                    style={{
                      padding: '24px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <input
                        type="checkbox"
                        id="lpdcCheck"
                        checked={formState.disciplinaryDeclaration}
                        onChange={(e) => setFormState({ ...formState, disciplinaryDeclaration: e.target.checked })}
                        style={{ width: '20px', height: '20px', marginTop: '3px', cursor: 'pointer' }}
                      />
                      <label htmlFor="lpdcCheck" style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.6, cursor: 'pointer' }}>
                        <strong style={{ color: '#071a38' }}>Statutory Disciplinary Affirmation (LPDC):</strong>
                        <br />
                        I solemnly declare and affirm that I have not been struck off the Roll of Legal Practitioners, suspended,
                        nor has any adverse judgment or finding of infamous conduct in a professional respect been sustained against
                        me by the Legal Practitioners Disciplinary Committee (LPDC) or the Supreme Court of Nigeria.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 3: STATUTORY DOCUMENT LODGING SLOTS */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 3 && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                      Stage 3: Mandatory Statutory Verification Document Lodging
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>
                      Lodge official digital scans (PDF, PNG, JPG up to 10MB) for Supreme Court and judicial compliance inspection.
                    </p>
                  </div>

                  {/* 4 DEDICATED SLOTS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {/* Slot 1: Call to Bar Certificate */}
                    {(() => {
                      const doc = getDocumentByCategory('call_to_bar');
                      return (
                        <div
                          style={{
                            padding: '20px',
                            borderRadius: '14px',
                            border: doc ? '2px solid #10b981' : '2px dashed #cbd5e1',
                            backgroundColor: doc ? '#f0fdf4' : '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: doc ? '#059669' : '#b91c1c', textTransform: 'uppercase' }}>
                                {doc ? 'LODGED & VERIFIED' : 'MANDATORY REQUIREMENT'}
                              </span>
                              {doc && <CheckCircle2 size={18} color="#059669" />}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                              Call to the Bar Certificate
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                              Issued by the Body of Benchers upon admission to the Nigerian Bar.
                            </p>
                          </div>

                          <div>
                            {doc ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview(doc)}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #a7f3d0',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#059669',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>View Certificate</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => callToBarRef.current?.click()}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Replace
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isUploadingSlot === 'call_to_bar'}
                                onClick={() => callToBarRef.current?.click()}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#0B2D5B',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '10px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                {isUploadingSlot === 'call_to_bar' ? (
                                  <RefreshCw size={15} className="animate-spin" />
                                ) : (
                                  <UploadCloud size={16} />
                                )}
                                <span>Lodge Call to Bar Certificate</span>
                              </button>
                            )}
                            <input
                              ref={callToBarRef}
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleSlotUpload(e, 'call_to_bar', 'Call to Bar Certificate', 'Call to the Bar Certificate')}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Slot 2: Practicing License / NBA Seal */}
                    {(() => {
                      const doc = getDocumentByCategory('practicing');
                      return (
                        <div
                          style={{
                            padding: '20px',
                            borderRadius: '14px',
                            border: doc ? '2px solid #10b981' : '2px dashed #cbd5e1',
                            backgroundColor: doc ? '#f0fdf4' : '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: doc ? '#059669' : '#d97706', textTransform: 'uppercase' }}>
                                {doc ? 'LODGED & VERIFIED' : 'RECOMMENDED'}
                              </span>
                              {doc && <CheckCircle2 size={18} color="#059669" />}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                              Annual Practicing License / NBA Seal
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                              Current Supreme Court practicing fee receipt or issued NBA Seal.
                            </p>
                          </div>

                          <div>
                            {doc ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview(doc)}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #a7f3d0',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#059669',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>View License</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => practicingRef.current?.click()}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Replace
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isUploadingSlot === 'practicing'}
                                onClick={() => practicingRef.current?.click()}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#0B2D5B',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '10px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                {isUploadingSlot === 'practicing' ? (
                                  <RefreshCw size={15} className="animate-spin" />
                                ) : (
                                  <UploadCloud size={16} />
                                )}
                                <span>Lodge Practicing License</span>
                              </button>
                            )}
                            <input
                              ref={practicingRef}
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleSlotUpload(e, 'practicing', 'Annual Practicing Authorization', 'Annual Practicing License / NBA Seal')}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Slot 3: Practitioner Identity Card */}
                    {(() => {
                      const doc = getDocumentByCategory('id');
                      return (
                        <div
                          style={{
                            padding: '20px',
                            borderRadius: '14px',
                            border: doc ? '2px solid #10b981' : '2px dashed #cbd5e1',
                            backgroundColor: doc ? '#f0fdf4' : '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: doc ? '#059669' : '#b91c1c', textTransform: 'uppercase' }}>
                                {doc ? 'LODGED & VERIFIED' : 'MANDATORY REQUIREMENT'}
                              </span>
                              {doc && <CheckCircle2 size={18} color="#059669" />}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                              Legal Practitioner / Valid Gov ID
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                              Official NBA Identity Card, National ID (NIN Slip), or Passport.
                            </p>
                          </div>

                          <div>
                            {doc ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview(doc)}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #a7f3d0',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#059669',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>View ID Card</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => idCardRef.current?.click()}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Replace
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isUploadingSlot === 'id'}
                                onClick={() => idCardRef.current?.click()}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#0B2D5B',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '10px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                {isUploadingSlot === 'id' ? (
                                  <RefreshCw size={15} className="animate-spin" />
                                ) : (
                                  <UploadCloud size={16} />
                                )}
                                <span>Lodge Identity Document</span>
                              </button>
                            )}
                            <input
                              ref={idCardRef}
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleSlotUpload(e, 'id', 'Practitioner Identification', 'Legal Practitioner Identity Card')}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Slot 4: Chambers / Law Firm CAC */}
                    {(() => {
                      const doc = getDocumentByCategory('cac');
                      return (
                        <div
                          style={{
                            padding: '20px',
                            borderRadius: '14px',
                            border: doc ? '2px solid #10b981' : '2px dashed #cbd5e1',
                            backgroundColor: doc ? '#f0fdf4' : '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: doc ? '#059669' : '#64748b', textTransform: 'uppercase' }}>
                                {doc ? 'LODGED & VERIFIED' : 'OPTIONAL (CHAMBERS)'}
                              </span>
                              {doc && <CheckCircle2 size={18} color="#059669" />}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                              Law Firm CAC Certificate
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                              CAC Certificate of Incorporation / Business Name Registration.
                            </p>
                          </div>

                          <div>
                            {doc ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview(doc)}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #a7f3d0',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#059669',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>View Document</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cacRef.current?.click()}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Replace
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isUploadingSlot === 'cac'}
                                onClick={() => cacRef.current?.click()}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  padding: '10px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                {isUploadingSlot === 'cac' ? (
                                  <RefreshCw size={15} className="animate-spin" />
                                ) : (
                                  <UploadCloud size={16} />
                                )}
                                <span>Lodge Law Firm CAC</span>
                              </button>
                            )}
                            <input
                              ref={cacRef}
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleSlotUpload(e, 'cac', 'Law Firm CAC Registration', 'Chambers CAC Registration Certificate')}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 4: LPA 2004 SECTION 20 CLIENT TRUST ESCROW CERTIFICATION */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 4 && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                      Stage 4: Legal Practitioners Act (LPA 2004 Section 20) Client Trust Escrow Certification
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>
                      In high-value financial dispute recovery, counsel must certify maintenance of a dedicated Client Bank Account.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '12px',
                      border: '1px solid #bfdbfe',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <Landmark size={22} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                      <strong>Statutory Legal Requirement (LPA Cap L11 Section 20):</strong>
                      <br />
                      Every legal practitioner receiving restitution settlement proceeds on behalf of claimants is strictly required
                      by law and the Rules of Professional Conduct in the Legal Profession (RPC) to maintain a separate client account
                      at a licensed commercial bank. Client funds must not be co-mingled with personal or general chambers operating funds.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        DEPOSITORY COMMERCIAL BANK <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select
                        value={formState.trustBankName}
                        onChange={(e) => setFormState({ ...formState, trustBankName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        10-DIGIT NUBAN ACCOUNT NUMBER <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        maxLength="10"
                        placeholder="e.g. 1019283746"
                        value={formState.trustAccountNumber}
                        onChange={(e) => setFormState({ ...formState, trustAccountNumber: e.target.value.replace(/\D/g, '') })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#071a38',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                        DESIGNATED CLIENT TRUST ACCOUNT NAME <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Adeyemi & Partners — Client Recovery Trust Account"
                        value={formState.trustAccountName}
                        onChange={(e) => setFormState({ ...formState, trustAccountName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#071a38',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 5: REVIEW DOSSIER & ELECTRONIC SUBMISSION */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 5 && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                      Stage 5: Review Dossier & Formal Electronic Submission
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>
                      Review your statutory application particulars before executing your electronic filing to the Clearing Desk.
                    </p>
                  </div>

                  {/* SUMMARY DOSSIER BOX */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '24px',
                      backgroundColor: '#f8fafc',
                      marginBottom: '28px'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SUPREME COURT ENROLLMENT</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0B2D5B', marginTop: '2px', fontFamily: 'monospace' }}>
                          {formState.nbaEnrollmentNumber}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CALL TO THE BAR CLASS</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38', marginTop: '2px' }}>
                          Class of {formState.callToBarYear}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NBA BRANCH</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38', marginTop: '2px' }}>
                          {formState.nbaBranch}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>LAW SCHOOL CAMPUS</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38', marginTop: '2px' }}>
                          {formState.lawSchoolCampus}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SCUML REGISTRATION</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38', marginTop: '2px' }}>
                          {formState.scumlNumber || 'Chambers Pending / Exempt'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SECTION 20 TRUST ESCROW</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#071a38', marginTop: '2px' }}>
                          {formState.trustBankName} ({formState.trustAccountNumber})
                        </div>
                      </div>
                    </div>

                    {/* Lodged documents checklist */}
                    <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#071a38', marginBottom: '8px' }}>
                        Lodged Documents ({kycData.documents.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {kycData.documents.map((d) => (
                          <span
                            key={d.id}
                            style={{
                              fontSize: '12px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={12} />
                            <span>{d.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FINAL STATUTORY ATTESTATION CHECKBOX */}
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#fffbeb',
                      borderRadius: '12px',
                      border: '1px solid #fde68a',
                      marginBottom: '28px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        id="statutoryAcceptCheck"
                        checked={formState.statutoryDeclarationAccepted}
                        onChange={(e) => setFormState({ ...formState, statutoryDeclarationAccepted: e.target.checked })}
                        style={{ width: '20px', height: '20px', marginTop: '3px', cursor: 'pointer' }}
                      />
                      <label htmlFor="statutoryAcceptCheck" style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.6, cursor: 'pointer' }}>
                        <strong style={{ color: '#92400e' }}>Solemn Electronic Accreditation Attestation:</strong>
                        <br />
                        I hereby attest and certify under penalty of perjury and professional sanctions under the Legal Practitioners Act
                        Cap L11 LFN 2004 that all information supplied in this compliance filing is true, accurate, and complete. I authorize
                        the Sovereign Recovery Clearing Desk and Judicial Verification Unit to independently cross-check my Supreme Court
                        enrollment credentials with the Chief Registrar of the Supreme Court of Nigeria and the Nigerian Bar Association.
                      </label>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                    <button
                      type="button"
                      disabled={isSubmittingKYC || !formState.statutoryDeclarationAccepted}
                      onClick={handleSubmitKYCApplication}
                      style={{
                        backgroundColor: formState.statutoryDeclarationAccepted ? '#059669' : '#94a3b8',
                        color: '#ffffff',
                        border: 'none',
                        padding: '14px 32px',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: 800,
                        cursor: formState.statutoryDeclarationAccepted && !isSubmittingKYC ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: formState.statutoryDeclarationAccepted ? '0 4px 15px rgba(5, 150, 105, 0.3)' : 'none'
                      }}
                    >
                      {isSubmittingKYC ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Submitting Application to Clearing Desk...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Submit Dossier for Regulatory Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP NAVIGATION BUTTONS (For Steps 1 to 4) */}
              {currentStep < 5 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '36px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  <button
                    type="button"
                    disabled={currentStep === 1}
                    onClick={handlePrevStep}
                    style={{
                      backgroundColor: '#ffffff',
                      color: currentStep === 1 ? '#94a3b8' : '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '11px 22px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Previous Stage</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{
                      backgroundColor: '#0B2D5B',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 24px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(11, 45, 91, 0.2)'
                    }}
                  >
                    <span>Save & Proceed to Next Stage</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: DOCUMENT PREVIEW MODAL */}
        {/* ========================================================================= */}
        {selectedDocPreview && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(7, 26, 56, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#071a38',
                  color: '#ffffff'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    {selectedDocPreview.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                    {selectedDocPreview.category} • Status: {selectedDocPreview.status || 'LODGED'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={resolveMediaUrl(selectedDocPreview.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedDocPreview(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  minHeight: '380px'
                }}
              >
                {selectedDocPreview.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={resolveMediaUrl(selectedDocPreview.fileUrl)}
                    title={selectedDocPreview.title}
                    style={{ width: '100%', height: '540px', border: 'none', borderRadius: '8px' }}
                  />
                ) : (
                  <img
                    src={resolveMediaUrl(selectedDocPreview.fileUrl)}
                    alt={selectedDocPreview.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '540px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: SUPPLEMENTARY DOCUMENT UPLOAD MODAL */}
        {/* ========================================================================= */}
        {uploadModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(7, 26, 56, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '540px',
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                  Lodge Supplementary Evidence
                </h3>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  DOCUMENT CATEGORY
                </label>
                <select
                  value={supplementaryCategory}
                  onChange={(e) => setSupplementaryCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Annual Practicing Authorization">Annual Practicing Authorization / Seal</option>
                  <option value="Body of Benchers Document">Body of Benchers Document</option>
                  <option value="SCUML Anti-Money Laundering Certificate">SCUML AML Certificate</option>
                  <option value="Tax Clearance Certificate">Tax Clearance Certificate</option>
                  <option value="Law Firm CAC Registration">Law Firm CAC Registration</option>
                  <option value="Supplementary Affidavit">Supplementary Affidavit</option>
                </select>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  DOCUMENT TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Practicing Fee E-Receipt"
                  value={supplementaryTitle}
                  onChange={(e) => setSupplementaryTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => supplementaryRef.current?.click()}
                  style={{
                    backgroundColor: '#0B2D5B',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UploadCloud size={16} />
                  <span>Select & Lodge File</span>
                </button>
                <input
                  ref={supplementaryRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                  onChange={handleSupplementaryUpload}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: OFFICIAL COUNCIL ACCREDITATION CERTIFICATE MODAL */}
        {/* ========================================================================= */}
        {certificateModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(7, 26, 56, 0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '720px',
                padding: '36px',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
                border: '8px double #D4AF37',
                position: 'relative'
              }}
            >
              <button
                type="button"
                onClick={() => setCertificateModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#071a38', color: '#D4AF37', marginBottom: '12px' }}>
                  <Award size={36} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  SOVEREIGN RESTITUTION & DISPUTE RESOLUTION COUNCIL
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#071a38', margin: '6px 0 4px 0', fontFamily: 'serif' }}>
                  Certificate of Council Accreditation
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Pursuant to the Legal Practitioners Act (Cap L11 LFN 2004) & Sovereign Restitution Protocol
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '30px 0', lineHeight: 1.8 }}>
                <div style={{ fontSize: '13px', color: '#475569' }}>This is to certify that</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0B2D5B', margin: '6px 0', textDecoration: 'underline' }}>
                  {lawyerUser?.name || 'Barrister & Solicitor of the Supreme Court of Nigeria'}
                </div>
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  having satisfied the statutory regulatory requirements and verified upon the Roll of the Supreme Court of Nigeria under Enrollment Number:
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', fontFamily: 'monospace', margin: '8px 0' }}>
                  {formState.nbaEnrollmentNumber || 'SCN VERIFIED'}
                </div>
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  is formally admitted as an <strong>Accredited Legal Practitioner</strong> on the Sovereign Restitution Litigation & Financial Dispute Resolution Panel.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ACCREDITATION SEAL</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#059669', fontWeight: 800, fontSize: '13px' }}>
                    <ShieldCheck size={16} />
                    <span>NBA Seal Verified</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      backgroundColor: '#071a38',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Printer size={15} />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </LawyerLayout>
  );
}
