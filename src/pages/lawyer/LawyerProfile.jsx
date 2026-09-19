import React, { useState, useEffect, useRef } from 'react';
import LawyerLayout from '../../layout/LawyerLayout';
import { lawyerService, resolveMediaUrl } from '../../services/lawyerService';
import {
  User,
  Building,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  Landmark,
  ExternalLink
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
  'Enugu Branch',
  'Ibadan Branch',
  'Benin Branch (Lion Bar)',
  'Kaduna Branch',
  'Kano Branch',
  'Calabar Branch',
  'Warri Branch',
  'Owerri Branch',
  'Akure Branch',
  'Abeokuta Branch',
  'Jos Branch',
  'Other Statutory NBA Branch'
];

export default function LawyerProfile({
  lawyerUser,
  onUpdateUser,
  onLogout,
  onSwitchRole
}) {
  const avatarInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: lawyerUser?.name || '',
    email: lawyerUser?.email || '',
    phone: lawyerUser?.phone || '',
    avatarUrl: lawyerUser?.avatarUrl || '',
    nbaEnrollmentNumber: lawyerUser?.nbaEnrollmentNumber || lawyerUser?.nbaEnrollment || '',
    callToBarYear: lawyerUser?.callToBarYear || '',
    nbaBranch: lawyerUser?.nbaBranch || 'Lagos Branch (Premier Bar)',
    practiceJurisdiction: lawyerUser?.practiceJurisdiction || 'Nigeria (Federal High Court & Appellate)',
    lawFirmName: lawyerUser?.lawFirmName || lawyerUser?.firmName || '',
    officeAddress: lawyerUser?.officeAddress || '',
    bankName: lawyerUser?.bankName || '',
    accountNumber: lawyerUser?.accountNumber || '',
    accountName: lawyerUser?.accountName || '',
    contingencyRatePercent: lawyerUser?.contingencyRatePercent || lawyerUser?.contingencyRate || 10
  });

  const [kycMeta, setKycMeta] = useState({
    kycStatus: lawyerUser?.kycStatus || 'PENDING_SUBMISSION',
    nbaSealVerified: Boolean(lawyerUser?.nbaSealVerified)
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await lawyerService.getProfile();
        if (res?.data && isMounted) {
          const u = res.data.user || {};
          const p = res.data.profile || {};

          setFormData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            avatarUrl: u.avatarUrl || '',
            nbaEnrollmentNumber: p.nbaEnrollmentNumber || '',
            callToBarYear: p.callToBarYear || '',
            nbaBranch: p.nbaBranch || 'Lagos Branch (Premier Bar)',
            practiceJurisdiction: p.practiceJurisdiction || 'Nigeria',
            lawFirmName: p.lawFirmName || '',
            officeAddress: p.officeAddress || '',
            bankName: p.bankName || '',
            accountNumber: p.accountNumber || '',
            accountName: p.accountName || '',
            contingencyRatePercent: p.contingencyRatePercent || 10
          });

          setKycMeta({
            kycStatus: p.kycStatus || 'PENDING_SUBMISSION',
            nbaSealVerified: Boolean(p.nbaSealVerified)
          });

          if (onUpdateUser) {
            onUpdateUser({
              ...lawyerUser,
              ...u,
              ...p,
              lawFirmName: p.lawFirmName,
              nbaEnrollmentNumber: p.nbaEnrollmentNumber
            });
          }
        }
      } catch (err) {
        console.warn('Could not load lawyer profile from server:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setErrorMsg('');
    try {
      const res = await lawyerService.uploadAvatar(file);
      if (res?.data?.avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
        if (onUpdateUser) {
          onUpdateUser({ ...lawyerUser, avatarUrl: res.data.avatarUrl });
        }
        setSuccessMsg('Counsel profile photo successfully updated.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        lawFirmName: formData.lawFirmName,
        nbaEnrollmentNumber: formData.nbaEnrollmentNumber,
        callToBarYear: formData.callToBarYear,
        nbaBranch: formData.nbaBranch,
        practiceJurisdiction: formData.practiceJurisdiction,
        officeAddress: formData.officeAddress,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        contingencyRatePercent: formData.contingencyRatePercent
      };

      const res = await lawyerService.updateProfile(payload);
      if (res?.data) {
        const u = res.data.user || {};
        const p = res.data.profile || {};
        if (onUpdateUser) {
          onUpdateUser({
            ...lawyerUser,
            ...u,
            ...p,
            firmName: p.lawFirmName,
            nbaEnrollment: p.nbaEnrollmentNumber
          });
        }
        setSuccessMsg('Counsel practice credentials and escrow remittance details saved.');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update lawyer profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (formData.name || 'Counsel')
    .replace(/^Barr\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <LawyerLayout
      lawyerUser={{ ...lawyerUser, ...formData, ...kycMeta }}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
    >
      <div style={{ padding: '32px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                LEGAL COUNSEL REGISTRY
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '999px' }}>
                SUPREME COURT OF NIGERIA ENROLMENT
              </span>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Legal Counsel Practice Profile & Chambers
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              Manage your legal practitioner credentials, NBA branch affiliation, chambers contact details, and client trust escrow account.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px 32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    backgroundColor: '#071A38',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 800,
                    overflow: 'hidden',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(7, 26, 56, 0.15)'
                  }}
                >
                  {formData.avatarUrl ? (
                    <img
                      src={resolveMediaUrl(formData.avatarUrl)}
                      alt={formData.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                    />
                  ) : (
                    initials
                  )}

                  {isUploadingAvatar && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(7, 26, 56, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <RefreshCw size={22} className="spin-animation" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#e68000',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                  }}
                  title="Upload profile photo"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {formData.name || 'Counsel'}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: kycMeta.nbaSealVerified ? '#ecfdf5' : '#fff7ed',
                      color: kycMeta.nbaSealVerified ? '#059669' : '#c2410c',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      border: kycMeta.nbaSealVerified ? '1px solid #a7f3d0' : '1px solid #fed7aa',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldCheck size={12} />
                    <span>{kycMeta.nbaSealVerified ? 'NBA Seal Verified' : 'Accreditation Pending Review'}</span>
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} color="#94a3b8" />
                    {formData.lawFirmName || 'Independent Practice'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#94a3b8" />
                    {formData.email}
                  </span>
                  {formData.phone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#94a3b8" />
                      {formData.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  CALL TO BAR
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', marginTop: '2px' }}>
                  {formData.callToBarYear || 'Pending'}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  CONTINGENCY YIELD
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                  {formData.contingencyRatePercent}%
                </div>
              </div>
            </div>
          </div>

          {successMsg && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '14px 18px',
                borderRadius: '10px',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '24px'
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '14px 18px',
                borderRadius: '10px',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '24px'
              }}
            >
              <AlertCircle size={18} color="#dc2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '28px 32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                marginBottom: '24px'
              }}
            >
              {/* NOTICE LINKING TO SEPARATE STATUTORY KYC PROCESS */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  borderRadius: '12px',
                  border: '1px solid #bfdbfe',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Scale size={22} color="#1d4ed8" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>
                      Statutory Supreme Court Accreditation & KYC Verification
                    </div>
                    <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                      SCN: <strong style={{ fontFamily: 'monospace' }}>{formData.nbaEnrollmentNumber || 'Pending SCN Filing'}</strong> • Call Year: <strong>{formData.callToBarYear || 'Pending'}</strong> • Branch: <strong>{formData.nbaBranch || 'Pending'}</strong>
                    </div>
                  </div>
                </div>

                <a
                  href="/lawyer/kyc"
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Go to Accreditation KYC Portal</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  1. Legal Counsel Identity & Practice Contacts
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  Personal practitioner profile, display name, registered counsel contact coordinates, and bio.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Legal Name (With Title) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Barr. Tolani Afolabi, Esq."
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    NBA Branch Affiliation
                  </label>
                  <select
                    value={formData.nbaBranch}
                    onChange={(e) => setFormData({ ...formData, nbaBranch: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    {NBA_BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Registered Counsel Email
                    </label>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                      &bull; Verified Email
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '13px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Operational Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 08062165573"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '28px 32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                marginBottom: '24px'
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  2. Law Firm & Chambers Entity Details
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  Practice identity registered under the Companies and Allied Matters Act (CAMA) or registered legal partnership.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Chambers / Law Firm Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lawFirmName}
                    onChange={(e) => setFormData({ ...formData, lawFirmName: e.target.value })}
                    placeholder="e.g. Afolabi & Co. Legal Practitioners"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Practice Jurisdiction / Territorial Admission
                  </label>
                  <input
                    type="text"
                    value={formData.practiceJurisdiction}
                    onChange={(e) => setFormData({ ...formData, practiceJurisdiction: e.target.value })}
                    placeholder="e.g. Nigeria (Federal High Court & Appellate)"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Chambers Physical Address & Service Office
                  </label>
                  <textarea
                    rows={2}
                    value={formData.officeAddress}
                    onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                    placeholder="e.g. Suite 4B, Legal Towers, 14 Admiralty Way, Lekki Phase 1, Lagos"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '28px 32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                marginBottom: '28px'
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  3. Dedicated Client Trust Account & Fee Remittance (LPA 2004 Section 20)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  In compliance with Legal Practitioners Act 2004 Section 20, all client recovery disbursements and legal contingency yields are settled directly to this depository.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Depository Bank <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Primary Bank</option>
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    NUBAN Account Number (10 Digits) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 0123456789"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Account Name (Must match Chambers or Counsel) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="e.g. Afolabi & Co. Client Trust Account"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Standard Recovery Contingency Rate (%): <strong>{formData.contingencyRatePercent}%</strong>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.5"
                    value={formData.contingencyRatePercent}
                    onChange={(e) => setFormData({ ...formData, contingencyRatePercent: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: '#0B2D5B', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                    <span>5% (Statutory Minimum)</span>
                    <span>10% (Standard)</span>
                    <span>25% (Complex Class Litigation)</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  backgroundColor: '#0B2D5B',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(11, 45, 91, 0.25)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Save size={17} />
                <span>{isSaving ? 'Synchronizing with Council Registry...' : 'Save Practice Profile Changes'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </LawyerLayout>
  );
}