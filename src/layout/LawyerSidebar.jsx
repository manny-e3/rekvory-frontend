import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Scale,
  Briefcase,
  ShieldCheck,
  UserCheck,
  LogOut
} from 'lucide-react';

export default function LawyerSidebar({
  pendingReferralsCount = 0,
  lawyerUser,
  onLogout
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardActive = location.pathname === '/lawyer/dashboard' || location.pathname === '/lawyer';
  const isReferralsActive = location.pathname.startsWith('/lawyer/referrals');
  const isKYCActive = location.pathname.startsWith('/lawyer/kyc');
  const isProfileActive = location.pathname.startsWith('/lawyer/profile');

  const isVerified = Boolean(lawyerUser?.nbaSealVerified);
  const kycStatus = lawyerUser?.kycStatus || (isVerified ? 'VERIFIED' : 'PENDING_SUBMISSION');

  const getKycBadge = () => {
    if (isVerified || kycStatus === 'VERIFIED') {
      return {
        label: 'Verified',
        bg: 'rgba(16, 185, 129, 0.2)',
        color: '#34d399',
        border: '1px solid rgba(16, 185, 129, 0.4)'
      };
    }
    if (kycStatus === 'UNDER_REVIEW') {
      return {
        label: 'Under Review',
        bg: 'rgba(245, 158, 11, 0.2)',
        color: '#fbbf24',
        border: '1px solid rgba(245, 158, 11, 0.4)'
      };
    }
    return {
      label: 'Pending',
      bg: 'rgba(234, 88, 12, 0.2)',
      color: '#fb923c',
      border: '1px solid rgba(234, 88, 12, 0.4)'
    };
  };

  const badge = getKycBadge();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#071A38',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflowY: 'auto',
        flexShrink: 0
      }}
    >
      {/* Brand / Logo */}
      <div
        onClick={() => navigate('/lawyer/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 8px 24px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#0B2D5B',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <Scale size={20} color="#ff8c00" />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#ffffff'
            }}
          >
            REKOVRY
          </div>
          <div
            style={{
              fontSize: '10.5px',
              letterSpacing: '0.08em',
              color: '#ff8c00',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            Accredited Counsel Desk
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* 1. Dashboard */}
        <button
          onClick={() => navigate('/lawyer/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '11px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isDashboardActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: isDashboardActive ? '#ffffff' : '#8a99b5',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13.5px',
            fontWeight: isDashboardActive ? 600 : 500,
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <Scale size={18} color={isDashboardActive ? '#ff8c00' : '#8a99b5'} />
          <span>Counsel Dashboard</span>
        </button>

        {/* 2. Case Referrals */}
        <button
          onClick={() => navigate('/lawyer/referrals')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '11px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isReferralsActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: isReferralsActive ? '#ffffff' : '#8a99b5',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13.5px',
            fontWeight: isReferralsActive ? 600 : 500,
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={18} color={isReferralsActive ? '#ff8c00' : '#8a99b5'} />
            <span>Case Referrals</span>
          </div>
          {pendingReferralsCount > 0 && (
            <span
              style={{
                backgroundColor: '#e68000',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px'
              }}
            >
              {pendingReferralsCount} New
            </span>
          )}
        </button>

        {/* 3. Accreditation & KYC */}
        <button
          onClick={() => navigate('/lawyer/kyc')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '11px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isKYCActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: isKYCActive ? '#ffffff' : '#8a99b5',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13.5px',
            fontWeight: isKYCActive ? 600 : 500,
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={18} color={isKYCActive ? '#ff8c00' : '#8a99b5'} />
            <span>Accreditation & KYC</span>
          </div>
          <span
            style={{
              backgroundColor: badge.bg,
              color: badge.color,
              border: badge.border,
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '6px'
            }}
          >
            {badge.label}
          </span>
        </button>

        {/* 4. Profile & Chambers */}
        <button
          onClick={() => navigate('/lawyer/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '11px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isProfileActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: isProfileActive ? '#ffffff' : '#8a99b5',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13.5px',
            fontWeight: isProfileActive ? 600 : 500,
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <UserCheck size={18} color={isProfileActive ? '#ff8c00' : '#8a99b5'} />
          <span>Profile & Chambers</span>
        </button>
      </nav>

      {/* Footer Utility Actions */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px', marginTop: 'auto' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#ef4444',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            fontWeight: 500,
            textAlign: 'left'
          }}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
