import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalSidebar from '../layout/PortalSidebar';
import NotificationBell from '../components/NotificationBell';
import { claimService } from '../services';
import {
  Zap,
  PlusCircle,
  ShieldCheck,
  FileText,
  CreditCard,
  Building,
  ShoppingBag,
  Cpu,
  ArrowRight,
  Info,
  ChevronDown,
  Menu,
  X,
  FileCheck2,
  Headphones,
  ExternalLink,
  Receipt,
  Download,
  CheckCircle2,
  Lock,
  User,
  Bell
} from 'lucide-react';

export default function DashboardView({
  claims = [],
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAllClaims, setShowAllClaims] = useState(false);

  // Modals for portal sidebar actions
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);

  const [apiClaims, setApiClaims] = useState(null);
  const [kpiSummary, setKpiSummary] = useState(null);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  // Live caller-scoped claims querying and KPI summary stats
  useEffect(() => {
    let isMounted = true;
    const loadDashboardClaims = async () => {
      setIsLoadingClaims(true);
      try {
        const res = await claimService.getClaims({ page: 1, limit: 10, sortBy: 'newest' });
        if (isMounted && res?.data) {
          setApiClaims(res.data);
          if (res?.meta?.summary) {
            setKpiSummary(res.meta.summary);
          }
        }
      } catch (err) {
        console.warn('Dashboard claims fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingClaims(false);
      }
    };
    loadDashboardClaims();
    return () => { isMounted = false; };
  }, [claims]);

  const userName = currentUser?.name || 'User';
  const firstName = userName.split(' ')[0] || 'User';

  // Dynamic real-time KPI summaries populated directly from meta.summary
  const activeDisputesCount = kpiSummary
    ? (kpiSummary.underReview + kpiSummary.awaitingCustomer + kpiSummary.escalated)
    : claims.filter((c) => c.status !== 'success').length;

  const recoveredTotal = kpiSummary && kpiSummary.recoveredAmount !== undefined
    ? `₦${kpiSummary.recoveredAmount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `₦${claims.filter((c) => c.status === 'success').reduce((acc, c) => acc + parseFloat(c.amount || 0), 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Row selection handler -> routes to dispute dossier
  const handleSelectClaim = (id) => {
    navigate(`/claims/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Status Badge Helper matching screenshot
  const renderStatusBadge = (status, label) => {
    const s = (status || '').toLowerCase();
    const l = (label || '').toLowerCase();

    if (s === 'warning' || l.includes('under review')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fff7ed',
            color: '#c2410c',
            border: '1px solid #ffedd5',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
          <span>UNDER REVIEW</span>
        </span>
      );
    }

    if (s === 'success' || l.includes('resolved') || l.includes('recovered')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f3e8ff',
            color: '#7e22ce',
            border: '1px solid #f3e8ff',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9333ea' }} />
          <span>RESOLVED</span>
        </span>
      );
    }

    if (s === 'info' || l.includes('awaiting')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #dbeafe',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
          <span>AWAITING CUSTOMER</span>
        </span>
      );
    }

    if (s === 'error' || l.includes('escalated')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fee2e2',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
          <span>ESCALATED</span>
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#f1f5f9',
          color: '#475569',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        <span>{label}</span>
      </span>
    );
  };

  // Row Icon Helper
  const renderRowIcon = (claim) => {
    let IconComp = FileText;
    if (claim.iconType === 'receipt') IconComp = Receipt;
    else if (claim.iconType === 'bank') IconComp = Building;
    else if (claim.iconType === 'bag') IconComp = ShoppingBag;
    else if (claim.iconType === 'hardware') IconComp = Cpu;

    return (
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: '#eeecff',
          color: '#4338ca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <IconComp size={18} />
      </div>
    );
  };

  const effectiveClaims = apiClaims !== null ? apiClaims : claims;
  const displayedClaims = showAllClaims ? effectiveClaims : effectiveClaims.slice(0, 4);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f6fc' }}>
      
      {/* 1. Desktop Left Sidebar */}
      <div className="desktop-sidebar-container" style={{ display: 'flex' }}>
        <PortalSidebar
          onLogout={onLogout}
          onOpenMessages={() => setMessagesModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenSupport={() => setSupportModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex'
          }}
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1101
            }}
          />
          <div style={{ position: 'relative', zIndex: 1102 }}>
            <PortalSidebar
              onLogout={onLogout}
              onOpenMessages={() => { setMobileMenuOpen(false); setMessagesModalOpen(true); }}
              onOpenProfile={() => { setMobileMenuOpen(false); setProfileModalOpen(true); }}
              onOpenSupport={() => { setMobileMenuOpen(false); setSupportModalOpen(true); }}
            />
          </div>
        </div>
      )}

      {/* 2. Main Dashboard Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar with Profile */}
        <header
          style={{
            padding: '16px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Mobile hamburger button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#071a38',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <Menu size={24} />
            </button>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Sovereign Recovery • Claimant Portal
            </span>
          </div>

          {/* Top Right Controls: Notification Icon & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* In-App Notification Bell System */}
            <NotificationBell />

            {/* User Profile Pill in Top Right */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#0B2D5B',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#0f172a'
                  }}
                >
                  {userName}
                </span>
                <ChevronDown size={15} color="#64748b" />
              </button>

            {/* Profile Dropdown Menu */}
            {userDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '210px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  padding: '8px 0',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{userName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Verified Claimant</div>
                </div>
                <button
                  onClick={() => { setUserDropdownOpen(false); navigate('/profile'); }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  My Profile
                </button>
                <button
                  onClick={() => { setUserDropdownOpen(false); navigate('/settlements'); }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Settlement Terms
                </button>
                <button
                  onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    borderTop: '1px solid #f1f5f9'
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

        {/* Scrollable Dashboard Body */}
        <div style={{ padding: '32px 36px 60px', flex: 1 }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            
            {/* 3. Account Overview Header & Stats Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '28px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f97316',
                      display: 'inline-block'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#475569',
                      textTransform: 'uppercase'
                    }}
                  >
                    ACCOUNT OVERVIEW • NIGERIA TIER-1 RESTITUTION
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: '36px',
                    fontWeight: 800,
                    color: '#071a38',
                    letterSpacing: '-0.02em',
                    margin: '0 0 6px 0',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  Good morning, {firstName}.
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Here's what's happening with your disputed transactions and ongoing claims.
                </p>
              </div>

              {/* Top Right Stats Card matching screenshot */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px'
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#64748b',
                      display: 'block',
                      textTransform: 'uppercase',
                      marginBottom: '4px'
                    }}
                  >
                    ACTIVE DISPUTES
                  </span>
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#071a38',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    {activeDisputesCount}
                  </span>
                </div>

                <div style={{ width: '1px', height: '36px', backgroundColor: '#e2e8f0' }} />

                <div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#64748b',
                      display: 'block',
                      textTransform: 'uppercase',
                      marginBottom: '4px'
                    }}
                  >
                    RECOVERED
                  </span>
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#8f4e00',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    {recoveredTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Hero Fast-Track Protocol Banner matching screenshot */}
            <div
              style={{
                background: 'linear-gradient(135deg, #072046 0%, #0d2c5e 55%, #051937 100%)',
                borderRadius: '16px',
                padding: '32px 36px',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 30px -5px rgba(7, 32, 70, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                marginBottom: '28px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.85fr)',
                alignItems: 'center',
                gap: '28px'
              }}
              className="fast-track-hero"
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    marginBottom: '14px'
                  }}
                >
                  <Zap size={13} color="#ff9e2c" />
                  <span>FAST-TRACK PROTOCOL</span>
                </div>

                <h2
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.01em',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  Need to lodge a new claim?
                </h2>

                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'rgba(255, 255, 255, 0.82)',
                    lineHeight: 1.55,
                    margin: '0 0 24px 0',
                    maxWidth: '480px'
                  }}
                >
                  Tell us what happened with your bank transfer or disputed transaction, and our institutional recovery engine will take it from here.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('/new-claim')}
                    style={{
                      backgroundColor: '#ff8c00',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 22px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 140, 0, 0.35)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <PlusCircle size={16} />
                    <span>Lodge a New Claim</span>
                  </button>

                  <button
                    onClick={() => navigate('/settlements')}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '11px 20px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Review Settlement Terms</span>
                  </button>
                </div>
              </div>

              {/* 3D Safe Vault Graphic matching screenshot */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <img
                  src="/fast-track-safe.jpg"
                  alt="Sovereign Safe Recovery"
                  style={{
                    width: '100%',
                    maxWidth: '310px',
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>

            {/* 5. "Your Claims" Table Card matching screenshot */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                overflow: 'hidden',
                marginBottom: '28px'
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#eeecff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: '#071a38',
                        margin: 0,
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      Your Claims
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Real-time status updates across merchant and interbank disputes
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate('/claims');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span>View all claims</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fafbfe', borderBottom: '1px solid #eef2f6' }}>
                      <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>
                        CLAIM DETAILS
                      </th>
                      <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>
                        RESOLUTION AMOUNT
                      </th>
                      <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>
                        STATUS
                      </th>
                      <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>
                        LAST UPDATE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedClaims.map((claim) => (
                      <tr
                        key={claim.id}
                        onClick={() => handleSelectClaim(claim.id)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* 1. Details with Icon */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {renderRowIcon(claim)}
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  fontSize: '14px',
                                  marginBottom: '3px'
                                }}
                              >
                                {claim.title || claim.categoryName || 'Dispute Dossier'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                #{claim.id} • {claim.categoryName || 'General Dispute'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Amount & Bank */}
                        <td style={{ padding: '16px 24px' }}>
                          <div>
                            <div
                              style={{
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 700,
                                fontSize: '14.5px',
                                color: '#0f172a',
                                marginBottom: '3px'
                              }}
                            >
                              ₦{claim.amountFormatted || Number(claim.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {claim.originBank || 'Nigerian Commercial Bank'}
                            </div>
                          </div>
                        </td>

                        {/* 3. Status Badge matching screenshot */}
                        <td style={{ padding: '16px 24px' }}>
                          {renderStatusBadge(claim.status, claim.statusLabel)}
                        </td>

                        {/* 4. Last Update timestamp */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
                            <div>{claim.transactionDate ? claim.transactionDate.split(' ')[0] + ' ' + (claim.transactionDate.split(' ')[1] || '') + ' ' + (claim.transactionDate.split(' ')[2] || '') : '10 Sept 2026'}</div>
                            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                              {claim.transactionDate?.includes('WAT') ? claim.transactionDate.split(' ').slice(3).join(' ') : '14:22 WAT'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Notification Bar */}
              <div
                style={{
                  backgroundColor: '#f1f5fd',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} color="#2563eb" />
                  <span style={{ fontSize: '12.5px', color: '#334155' }}>
                    CBN Circular Compliant: All claims processed within 72 business hours under interbank arbitration.
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Exporting Sovereign Certified Dispute Statement (PDF)...');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>Download Statement (PDF)</span>
                </button>
              </div>
            </div>

            {/* 6. Bottom 3 Cards Grid matching screenshot */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}
            >
              {/* Card 1: Tier-1 Legal Shield */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <ShieldCheck size={22} />
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#071a38',
                      margin: '0 0 8px 0',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    Tier-1 Legal Shield
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Your claims are protected by statutory payment dispute recovery clauses under the Consumer Protection Council.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/compliance')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span>Learn about rights</span>
                  <span>›</span>
                </button>
              </div>

              {/* Card 2: E-Statement Synced */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#ffedd5',
                      color: '#c2410c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <FileCheck2 size={22} />
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#071a38',
                      margin: '0 0 8px 0',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    E-Statement Synced
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Direct ledger confirmation linked with ABC Bank, Access Bank, and Zenith Bank APIs for automatic proof extraction.
                  </p>
                </div>
                <button
                  onClick={() => setIntegrationModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span>Manage integrations</span>
                  <span>›</span>
                </button>
              </div>

              {/* Card 3: Need Legal Escalation? */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <Headphones size={22} />
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#071a38',
                      margin: '0 0 8px 0',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    Need Legal Escalation?
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Disputed amounts over ₦250,000 can be assigned a direct arbitration officer within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setSupportModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span>Connect to Legal Team</span>
                  <span>›</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Messages Modal */}
      {messagesModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                Notifications & Arbitration Inquests
              </h3>
              <button
                onClick={() => setMessagesModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              No notifications or arbitration inquests recorded.
            </div>
            <button
              className="btn btn-secondary-navy"
              onClick={() => setMessagesModalOpen(false)}
              style={{ width: '100%' }}
            >
              Close Messages
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                Claimant Profile & Security
              </h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0B2D5B',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '24px'
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#071a38' }}>{userName}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{currentUser?.email || 'Authenticated User'}</div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                  ✓ Verified Claimant Account
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Primary Linked Bank</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Zenith Bank Plc (***8942)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Jurisdiction</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Federal Republic of Nigeria</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#64748b' }}>Account Protection</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>2FA / Encrypted Restitution Protocol</span>
              </div>
            </div>
            <button
              className="btn btn-secondary-navy"
              onClick={() => setProfileModalOpen(false)}
              style={{ width: '100%' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Support & Legal Modal */}
      {supportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                Direct Legal Escalation & Support
              </h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              For claims exceeding ₦250,000 or contested merchant fraud, our certified arbitration officers provide priority institutional representation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600, color: '#071a38' }}>Arbitration Desk Hotline:</span>
                <span style={{ marginLeft: '8px', color: '#2563eb' }}>+234 1 800 768 3739</span>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600, color: '#071a38' }}>Priority Dispatch Email:</span>
                <span style={{ marginLeft: '8px', color: '#2563eb' }}>escalations@rekovry.ng</span>
              </div>
            </div>
            <button
              className="btn btn-primary-gold"
              onClick={() => {
                alert('Arbitration officer notified. An advocate will contact your registered phone within 2 hours.');
                setSupportModalOpen(false);
              }}
              style={{ width: '100%' }}
            >
              Request Dedicated Arbitration Officer
            </button>
          </div>
        </div>
      )}

      {/* Bank API Integrations Modal */}
      {integrationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071a38', margin: 0 }}>
                E-Statement & Bank API Feeds
              </h3>
              <button
                onClick={() => setIntegrationModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              Automatic ledger syncing confirms disputed debits directly with interbank clearing switches.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontWeight: 600, color: '#166534' }}>Access Bank Core API</span>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>● Active & Synced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontWeight: 600, color: '#166534' }}>GTBank Open Banking</span>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>● Active & Synced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontWeight: 600, color: '#166534' }}>Zenith Bank Switch Gateway</span>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>● Active & Synced</span>
              </div>
            </div>
            <button
              className="btn btn-secondary-navy"
              onClick={() => setIntegrationModalOpen(false)}
              style={{ width: '100%' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
