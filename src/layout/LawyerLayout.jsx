import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerSidebar from './LawyerSidebar';
import NotificationBell from '../components/NotificationBell';
import { lawyerService, resolveMediaUrl } from '../services/lawyerService';
import { Scale, ShieldCheck } from 'lucide-react';

export default function LawyerLayout({
  children,
  lawyerUser,
  pendingReferralsCount: propReferralsCount,
  onLogout,
  onSwitchRole
}) {
  const navigate = useNavigate();

  // Unified persistent lawyer layout metadata state
  const [meta, setMeta] = useState(() => {
    try {
      const cached = sessionStorage.getItem('sr_lawyer_meta');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      name: lawyerUser?.name || '',
      firmName: lawyerUser?.lawFirmName || lawyerUser?.firmName || '',
      nbaEnrollmentNumber: lawyerUser?.nbaEnrollmentNumber || '',
      kycStatus: lawyerUser?.kycStatus || 'PENDING_SUBMISSION',
      nbaSealVerified: Boolean(lawyerUser?.nbaSealVerified),
      avatarUrl: lawyerUser?.avatarUrl || '',
      pendingReferralsCount: propReferralsCount || 0
    };
  });

  // Sync with prop updates
  useEffect(() => {
    if (lawyerUser) {
      setMeta((prev) => {
        const next = {
          ...prev,
          name: lawyerUser.name || prev.name,
          firmName: lawyerUser.lawFirmName || lawyerUser.firmName || prev.firmName,
          nbaEnrollmentNumber: (lawyerUser.nbaEnrollmentNumber && !lawyerUser.nbaEnrollmentNumber.includes('PENDING')) ? lawyerUser.nbaEnrollmentNumber : prev.nbaEnrollmentNumber,
          kycStatus: lawyerUser.kycStatus || prev.kycStatus,
          nbaSealVerified: lawyerUser.nbaSealVerified !== undefined ? Boolean(lawyerUser.nbaSealVerified) : prev.nbaSealVerified,
          avatarUrl: lawyerUser.avatarUrl || prev.avatarUrl,
          pendingReferralsCount: propReferralsCount !== undefined ? propReferralsCount : prev.pendingReferralsCount
        };
        try {
          sessionStorage.setItem('sr_lawyer_meta', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  }, [lawyerUser, propReferralsCount]);

  // Always fetch latest profile & referrals count if missing or once per session
  useEffect(() => {
    let isMounted = true;

    async function syncLawyerMeta() {
      try {
        const [profRes, dashRes] = await Promise.allSettled([
          lawyerService.getProfile(),
          lawyerService.getDashboardStats()
        ]);

        if (!isMounted) return;

        let updated = {};
        if (profRes.status === 'fulfilled' && profRes.value?.data) {
          const u = profRes.value.data.user || {};
          const p = profRes.value.data.profile || {};
          updated = {
            name: u.name || meta.name,
            avatarUrl: u.avatarUrl || meta.avatarUrl,
            firmName: p.lawFirmName || meta.firmName,
            nbaEnrollmentNumber: (p.nbaEnrollmentNumber && !p.nbaEnrollmentNumber.includes('PENDING')) ? p.nbaEnrollmentNumber : meta.nbaEnrollmentNumber,
            kycStatus: p.kycStatus || meta.kycStatus,
            nbaSealVerified: Boolean(p.nbaSealVerified)
          };
        }

        if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
          const stats = dashRes.value.data;
          if (stats.pendingReferrals !== undefined) {
            updated.pendingReferralsCount = stats.pendingReferrals;
          }
        }

        setMeta((prev) => {
          const combined = { ...prev, ...updated };
          try {
            sessionStorage.setItem('sr_lawyer_meta', JSON.stringify(combined));
          } catch (e) {}
          return combined;
        });
      } catch (err) {
        // Silent fallback to prop/cached values
      }
    }

    syncLawyerMeta();
    return () => { isMounted = false; };
  }, []);

  const lawyerName = meta.name || lawyerUser?.name || 'Accredited Counsel';
  const firmName = meta.firmName || lawyerUser?.lawFirmName || lawyerUser?.firmName || 'Independent Practice';
  const scnNumber = meta.nbaEnrollmentNumber || lawyerUser?.nbaEnrollmentNumber || 'SCN PENDING';
  const isVerified = Boolean(meta.nbaSealVerified);
  const kycStatus = meta.kycStatus;
  const effectiveReferralsCount = propReferralsCount !== undefined ? propReferralsCount : (meta.pendingReferralsCount || 0);

  const initials = lawyerName
    .replace(/^Barr.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'LC';

  const getStatusLabel = () => {
    if (isVerified || kycStatus === 'VERIFIED') return 'KYC Verified ✓';
    if (kycStatus === 'UNDER_REVIEW') return 'KYC Under Review ⏳';
    return 'KYC Incomplete ⚠';
  };

  const getStatusColor = () => {
    if (isVerified || kycStatus === 'VERIFIED') return '#059669';
    if (kycStatus === 'UNDER_REVIEW') return '#d97706';
    return '#ea580c';
  };

  const synchronizedLawyerUser = {
    ...lawyerUser,
    ...meta,
    name: lawyerName,
    lawFirmName: firmName,
    firmName,
    nbaEnrollmentNumber: scnNumber,
    kycStatus,
    nbaSealVerified: isVerified
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f6fc' }}>
      
      {/* Left Sidebar - 100% Identical and Sticky on all pages */}
      <LawyerSidebar
        pendingReferralsCount={effectiveReferralsCount}
        lawyerUser={synchronizedLawyerUser}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar - 100% Identical on all pages */}
        <header
          style={{
            padding: '14px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* SCN & Network Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              onClick={() => navigate('/lawyer/kyc')}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#8f4e00',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '3px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
              title="View Accreditation Status"
            >
              ⚖ ACCREDITED LEGAL COUNSEL NETWORK
            </span>
            <span
              onClick={() => navigate('/lawyer/kyc')}
              style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer' }}
              title="Inspect Supreme Court Enrolment KYC"
            >
              Supreme Court Enrolment No: <strong style={{ color: '#0f172a' }}>{scnNumber}</strong>
            </span>
          </div>

          {/* Right Header Controls: Notification Bell & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Live In-App Notification Bell */}
            <NotificationBell />

            {/* Counsel Profile Chip */}
            <div
              onClick={() => navigate('/lawyer/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '5px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Manage Counsel Profile & Chambers"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#072046',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {synchronizedLawyerUser.avatarUrl ? (
                  <img
                    src={resolveMediaUrl(synchronizedLawyerUser.avatarUrl)}
                    alt={lawyerName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {lawyerName}
                </span>
                <span style={{ fontSize: '10.5px', color: getStatusColor(), fontWeight: 600, marginTop: '2px' }}>
                  {firmName} • {getStatusLabel()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>

    </div>
  );
}
