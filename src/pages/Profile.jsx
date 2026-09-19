import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import { authService } from '../services';
import {
  User,
  Shield,
  Lock,
  Building,
  CreditCard,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  Save,
  KeyRound,
  FileCheck,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Camera,
  UploadCloud,
  FileText,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank Plc' },
  { code: '057', name: 'Zenith Bank Plc' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '011', name: 'First Bank of Nigeria Ltd' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '070', name: 'Fidelity Bank Plc' },
  { code: '032', name: 'Union Bank of Nigeria Plc' },
  { code: '232', name: 'Sterling Bank Plc' },
  { code: '035', name: 'Wema Bank Plc' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '076', name: 'Polaris Bank Ltd' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '082', name: 'Keystone Bank Ltd' },
  { code: '101', name: 'Providus Bank' },
  { code: '090110', name: 'VFD Microfinance Bank' },
  { code: '090267', name: 'Kuda Microfinance Bank' },
  { code: '100004', name: 'Opay (Paycom)' },
  { code: '100033', name: 'PalmPay Ltd' },
  { code: '999', name: 'Other Financial Institution' }
];

// Helper to construct full media URL if relative
function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const origin = base.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function Profile({
  currentUser,
  claims = [],
  onLogout,
  onUpdateUser
}) {
  const navigate = useNavigate();

  // Navigation tabs: 'general' | 'security' | 'notifications'
  const [activeTab, setActiveTab] = useState('general');

  // Loading & submission states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password submission states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Password reveal toggles
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Corporate CAC document upload state
  const [corporateDocUrl, setCorporateDocUrl] = useState(currentUser?.corporateDocUrl || '');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadSuccessMsg, setDocUploadSuccessMsg] = useState('');
  const [docUploadErrorMsg, setDocUploadErrorMsg] = useState('');
  const corporateDocInputRef = useRef(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    type: currentUser?.type || 'Consumer',
    rcNumber: currentUser?.rcNumber || '',
    primaryBankCode: currentUser?.primaryBankCode || ''
  });

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    claimStatusMilestones: true,
    demandNoticeDispatched: true,
    settlementReceived: true,
    arbitrationInquests: true,
    weeklySummaryEmail: false
  });
  const [isSyncingPrefs, setIsSyncingPrefs] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState('');

  // Fetch freshest profile & notification preferences from backend
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await authService.getProfile();
        if (isMounted && res?.data) {
          const u = res.data;
          setProfileForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            type: u.type || 'Consumer',
            rcNumber: u.rcNumber || '',
            primaryBankCode: u.primaryBankCode || ''
          });

          if (u.avatarUrl) {
            setAvatarUrl(u.avatarUrl);
          }
          if (u.corporateDocUrl) {
            setCorporateDocUrl(u.corporateDocUrl);
          }
          if (u.notificationPreferences) {
            setNotifPrefs(u.notificationPreferences);
          }

          if (onUpdateUser) {
            onUpdateUser({ ...currentUser, ...u });
          }
        }
      } catch (err) {
        console.warn('[Profile] Could not refresh profile from server:', err.message);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, []);

  // Handle Avatar Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await authService.uploadAvatar(file);
      if (res?.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
        const updatedUser = { ...currentUser, avatarUrl: res.data.avatarUrl };
        if (onUpdateUser) onUpdateUser(updatedUser);
        setProfileSuccessMsg('Profile photo successfully updated.');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to upload profile photo.');
      setTimeout(() => setProfileErrorMsg(''), 5000);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Handle Corporate CAC Document Upload
  const handleCorporateDocChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setDocUploadSuccessMsg('');
    setDocUploadErrorMsg('');

    try {
      const res = await authService.uploadCorporateDocument(file);
      if (res?.data?.corporateDocUrl) {
        setCorporateDocUrl(res.data.corporateDocUrl);
        const updatedUser = { ...currentUser, corporateDocUrl: res.data.corporateDocUrl };
        if (onUpdateUser) onUpdateUser(updatedUser);
        setDocUploadSuccessMsg(`Certificate "${res.data.fileName || file.name}" verified and lodged.`);
        setTimeout(() => setDocUploadSuccessMsg(''), 5000);
      }
    } catch (err) {
      setDocUploadErrorMsg(err.message || 'Failed to upload corporate document.');
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  };

  // Handle Profile Details Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setIsSavingProfile(true);

    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        type: profileForm.type,
        rcNumber: profileForm.type === 'Corporate' ? profileForm.rcNumber : null,
        primaryBankCode: profileForm.primaryBankCode
      };

      const res = await authService.updateProfile(payload);
      if (res?.data) {
        const updated = { ...currentUser, ...res.data, avatarUrl, corporateDocUrl };
        if (onUpdateUser) {
          onUpdateUser(updated);
        }
        setProfileSuccessMsg('Institutional profile details synchronized with server.');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordSuccessMsg('Your security password has been successfully updated.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordSuccessMsg(''), 5000);
    } catch (err) {
      setPasswordErrorMsg(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Notification Preference Toggle with Backend Persistence
  const handleTogglePref = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setIsSyncingPrefs(true);

    try {
      const res = await authService.updateNotificationPreferences(updated);
      if (res?.data) {
        setNotifPrefs(res.data);
      }
      setNotifSavedMsg('Preferences synchronized.');
      setTimeout(() => setNotifSavedMsg(''), 3000);
    } catch (err) {
      console.warn('Failed to sync notification preferences:', err.message);
      setNotifSavedMsg('Saved locally.');
      setTimeout(() => setNotifSavedMsg(''), 3000);
    } finally {
      setIsSyncingPrefs(false);
    }
  };

  // KPI Calculations
  const totalClaimsCount = claims.length;
  const activeDisputesCount = claims.filter((c) => c.status !== 'success').length;
  const totalRecoveredAmount = claims
    .filter((c) => c.status === 'success')
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  const selectedBankName = NIGERIAN_BANKS.find(
    (b) => b.code === profileForm.primaryBankCode
  )?.name || 'Not Linked';

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '32px 36px 60px', flex: 1, backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>

          {/* Breadcrumb & Title */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>
              Sovereign Recovery &bull; Account Center
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '28px',
                fontWeight: 800,
                color: '#071a38',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Institutional Profile & Security
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', marginBottom: 0 }}>
              Manage legal entity credentials, institutional banking links, security credentials, and arbitration notification settings.
            </p>
          </div>

          {/* Top Profile Summary Card with Avatar Photo Upload */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px 32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '28px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              
              {/* Avatar Photo with Upload Button */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: avatarUrl
                      ? '#f1f5f9'
                      : 'linear-gradient(135deg, #0B2D5B 0%, #071a38 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '28px',
                    boxShadow: '0 8px 16px rgba(11, 45, 91, 0.2)',
                    border: '3px solid #f1f5f9',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={resolveMediaUrl(avatarUrl)}
                      alt={profileForm.name || 'User Avatar'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={() => setAvatarUrl('')}
                    />
                  ) : (
                    (profileForm.name || currentUser?.name || 'U').charAt(0).toUpperCase()
                  )}

                  {/* Uploading Overlay */}
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
                      <RefreshCw size={20} className="spin-animation" />
                    </div>
                  )}
                </div>

                {/* Change Photo Trigger */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#E68000',
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    transition: 'transform 0.15s ease'
                  }}
                  title="Upload profile photo"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#071a38',
                      margin: 0
                    }}
                  >
                    {profileForm.name || currentUser?.name || 'Authorized Claimant'}
                  </h2>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Verified Claimant</span>
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: profileForm.type === 'Corporate' ? '#eff6ff' : '#f8fafc',
                      color: profileForm.type === 'Corporate' ? '#1d4ed8' : '#475569',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {profileForm.type === 'Corporate' ? 'Corporate / Institutional' : 'Consumer / Individual'}
                  </span>
                </div>

                <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#94a3b8" />
                    {profileForm.email || currentUser?.email || 'N/A'}
                  </span>
                  {profileForm.phone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#94a3b8" />
                      {profileForm.phone}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} color="#94a3b8" />
                    {selectedBankName}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '105px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Claims
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2D5B', marginTop: '2px' }}>
                  {totalClaimsCount}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '105px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Active Inquests
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#E68000', marginTop: '2px' }}>
                  {activeDisputesCount}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '130px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Recovered
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  ₦{totalRecoveredAmount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selection Bar */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '2px solid #e2e8f0',
              marginBottom: '28px',
              paddingBottom: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: activeTab === 'general' ? 700 : 600,
                color: activeTab === 'general' ? '#0B2D5B' : '#64748b',
                cursor: 'pointer',
                borderBottom: activeTab === 'general' ? '3px solid #0B2D5B' : '3px solid transparent',
                marginBottom: '-4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={16} color={activeTab === 'general' ? '#0B2D5B' : '#94a3b8'} />
              <span>Identity & Organization</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: activeTab === 'security' ? 700 : 600,
                color: activeTab === 'security' ? '#0B2D5B' : '#64748b',
                cursor: 'pointer',
                borderBottom: activeTab === 'security' ? '3px solid #0B2D5B' : '3px solid transparent',
                marginBottom: '-4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <KeyRound size={16} color={activeTab === 'security' ? '#0B2D5B' : '#94a3b8'} />
              <span>Security & Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: activeTab === 'notifications' ? 700 : 600,
                color: activeTab === 'notifications' ? '#0B2D5B' : '#64748b',
                cursor: 'pointer',
                borderBottom: activeTab === 'notifications' ? '3px solid #0B2D5B' : '3px solid transparent',
                marginBottom: '-4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Bell size={16} color={activeTab === 'notifications' ? '#0B2D5B' : '#94a3b8'} />
              <span>Notification Preferences</span>
            </button>
          </div>

          {/* TAB 1: General Profile, Organization & CAC Documents */}
          {activeTab === 'general' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                  Claimant Entity Information
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  This legal entity or individual name appears on statutory pre-action notices served to respondent financial institutions.
                </p>
              </div>

              {/* Feedback messages */}
              {profileSuccessMsg && (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  <AlertCircle size={18} color="#dc2626" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px'
                  }}
                >
                  {/* Full Name / Legal Entity Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Full Legal Name / Entity Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g., Apex Logistics Ltd or Emmanuel Aboajah"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'border-color 0.15s'
                      }}
                    />
                  </div>

                  {/* Registered Email (Locked / Readonly) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        Registered Sovereign Email
                      </label>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        &bull; Verified Email
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
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
                      <Lock
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', right: '12px', top: '13px' }}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Operational Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
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

                  {/* Account Classification Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Account Classification
                    </label>
                    <select
                      value={profileForm.type}
                      onChange={(e) => setProfileForm({ ...profileForm, type: e.target.value })}
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
                      <option value="Consumer">Consumer / Individual Claimant</option>
                      <option value="Corporate">Corporate / Registered SME</option>
                    </select>
                  </div>

                  {/* RC / CAC Number (Visible if Corporate) */}
                  {profileForm.type === 'Corporate' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        CAC Registration Number (RC / BN)
                      </label>
                      <input
                        type="text"
                        value={profileForm.rcNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, rcNumber: e.target.value })}
                        placeholder="RC-1928492"
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
                  )}

                  {/* Primary Clearing Bank */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Primary Restitution Depository Bank
                    </label>
                    <select
                      value={profileForm.primaryBankCode}
                      onChange={(e) => setProfileForm({ ...profileForm, primaryBankCode: e.target.value })}
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
                      <option value="">Select Primary Depository Bank</option>
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '20px',
                    marginBottom: profileForm.type === 'Corporate' ? '28px' : 0
                  }}
                >
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn btn-primary-navy"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 700,
                      backgroundColor: '#0B2D5B',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isSavingProfile ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Save size={16} />
                    <span>{isSavingProfile ? 'Synchronizing...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>

              {/* Corporate CAC Document Upload Section */}
              {profileForm.type === 'Corporate' && (
                <div
                  style={{
                    borderTop: '2px dashed #e2e8f0',
                    paddingTop: '28px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                        Corporate Entity Verification (CAC Certificate)
                      </h4>
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                        Upload your Corporate Affairs Commission (CAC) Certificate of Incorporation or Business Registration for verification.
                      </p>
                    </div>

                    {corporateDocUrl && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid #a7f3d0'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>CAC Document Lodged</span>
                      </span>
                    )}
                  </div>

                  {docUploadSuccessMsg && (
                    <div
                      style={{
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '16px'
                      }}
                    >
                      <CheckCircle2 size={18} color="#059669" />
                      <span>{docUploadSuccessMsg}</span>
                    </div>
                  )}

                  {docUploadErrorMsg && (
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '16px'
                      }}
                    >
                      <AlertCircle size={18} color="#dc2626" />
                      <span>{docUploadErrorMsg}</span>
                    </div>
                  )}

                  {corporateDocUrl ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                            Certificate of Incorporation / CAC Registration
                          </div>
                          <a
                            href={resolveMediaUrl(corporateDocUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '12px',
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '2px'
                            }}
                          >
                            <span>Inspect Lodged Document</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => corporateDocInputRef.current?.click()}
                        disabled={isUploadingDoc}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {isUploadingDoc ? 'Uploading...' : 'Replace Certificate'}
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => corporateDocInputRef.current?.click()}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '32px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0B2D5B';
                        e.currentTarget.style.backgroundColor = '#f1f5fd';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                    >
                      <UploadCloud size={38} color="#0B2D5B" style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#071a38', marginBottom: '4px' }}>
                        {isUploadingDoc ? 'Uploading Certificate...' : 'Click to Upload CAC Registration Document'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Supports PDF, PNG, JPG up to 15MB. Encrypted and timestamped for institutional audit.
                      </div>
                    </div>
                  )}

                  <input
                    ref={corporateDocInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleCorporateDocChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                  Cryptographic Security & Password
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  Update your authentication credentials. Passwords are encrypted using salted bcrypt rounds to secure restitution authorizations.
                </p>
              </div>

              {passwordSuccessMsg && (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  <AlertCircle size={18} color="#dc2626" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ maxWidth: '520px' }}>
                {/* Current Password */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Current Authorization Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                      }}
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    New Security Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="At least 8 characters"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                      }}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Confirm New Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                      }}
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12.5px',
                    color: '#64748b',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Password Guidelines:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Minimum 8 characters</li>
                    <li>Must differ from your previously used password</li>
                    <li>We recommend mixing uppercase, numbers, and symbols</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn btn-primary-navy"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    backgroundColor: '#0B2D5B',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isChangingPassword ? 'not-allowed' : 'pointer'
                  }}
                >
                  <KeyRound size={16} />
                  <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Notification Preferences (Connected to Backend Database) */}
          {activeTab === 'notifications' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                    Arbitration & In-App Notification Channels
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                    Control real-time notifications for dispute milestones, pre-action service, and settlement receipts. Settings are saved directly to your profile.
                  </p>
                </div>
                {notifSavedMsg && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#059669',
                      fontWeight: 600,
                      backgroundColor: '#ecfdf5',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    <Check size={14} />
                    {notifSavedMsg}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Pref Item 1 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                      Claim Status Milestone Alerts
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                      Immediate alerts when a dispute transitions from Lodged &rarr; Under Review &rarr; Restitution Settled.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifPrefs.claimStatusMilestones)}
                    onChange={() => handleTogglePref('claimStatusMilestones')}
                    disabled={isSyncingPrefs}
                    style={{ width: '18px', height: '18px', accentColor: '#0B2D5B', cursor: 'pointer' }}
                  />
                </div>

                {/* Pref Item 2 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                      Statutory Demand Notice Service Notices
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                      Cryptographic confirmation when Form 14 formal demand notice is served to the respondent bank.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifPrefs.demandNoticeDispatched)}
                    onChange={() => handleTogglePref('demandNoticeDispatched')}
                    disabled={isSyncingPrefs}
                    style={{ width: '18px', height: '18px', accentColor: '#0B2D5B', cursor: 'pointer' }}
                  />
                </div>

                {/* Pref Item 3 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                      Financial Restitution & Settlement Releases
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                      High-priority notifications upon disbursement of recovered funds directly to your linked depository.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifPrefs.settlementReceived)}
                    onChange={() => handleTogglePref('settlementReceived')}
                    disabled={isSyncingPrefs}
                    style={{ width: '18px', height: '18px', accentColor: '#0B2D5B', cursor: 'pointer' }}
                  />
                </div>

                {/* Pref Item 4 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                      Arbitration Inquest Inquiries
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                      Notices when clearing desk arbitration officers request further supporting transaction logs or affidavit documents.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifPrefs.arbitrationInquests)}
                    onChange={() => handleTogglePref('arbitrationInquests')}
                    disabled={isSyncingPrefs}
                    style={{ width: '18px', height: '18px', accentColor: '#0B2D5B', cursor: 'pointer' }}
                  />
                </div>

                {/* Pref Item 5 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                      Weekly Dispute Settlement Digest (Email)
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                      Summary digest of active statutory windows and dispute progress emailed to your registered inbox.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifPrefs.weeklySummaryEmail)}
                    onChange={() => handleTogglePref('weeklySummaryEmail')}
                    disabled={isSyncingPrefs}
                    style={{ width: '18px', height: '18px', accentColor: '#0B2D5B', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PortalLayout>
  );
}
