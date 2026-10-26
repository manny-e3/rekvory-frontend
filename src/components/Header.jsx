import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { User, Menu, X, Shield, ArrowRight, LogOut, CheckCircle } from 'lucide-react';

export default function Header({
  currentUser,
  onLogout
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isCompliance = location.pathname === '/compliance';
  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname === '/dashboard' || location.pathname.startsWith('/claims');

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      style={{
        backgroundColor: '#03142e',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 999
      }}
    >
      <div className="app-container" style={{ padding: '12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          
          {/* Logo on Left */}
          <div
            onClick={() => handleNav('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <BrandLogo light={true} text="REKOVRY" />
          </div>

          {/* Center Navigation Links (Matching Screenshot: Home, How it works, FAQs, Login) */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px'
            }}
            className="header-center-nav"
          >
            <button
              onClick={() => handleNav('/')}
              style={{
                backgroundColor: isHome ? '#0d2852' : 'transparent',
                color: isHome ? '#ffffff' : 'rgba(255, 255, 255, 0.82)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '13.5px',
                fontWeight: 600,
                padding: '7px 18px',
                borderRadius: 'var(--rounded-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Home
            </button>

            <button
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => {
                    window.scrollTo({ top: 700, behavior: 'smooth' });
                  }, 150);
                } else {
                  window.scrollTo({ top: 700, behavior: 'smooth' });
                }
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.82)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '13.5px',
                fontWeight: 600,
                padding: '7px 18px',
                borderRadius: 'var(--rounded-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.82)')}
            >
              How it works
            </button>

            <button
              onClick={() => handleNav('/compliance')}
              style={{
                backgroundColor: isCompliance ? '#0d2852' : 'transparent',
                color: isCompliance ? '#ffffff' : 'rgba(255, 255, 255, 0.82)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '13.5px',
                fontWeight: 600,
                padding: '7px 18px',
                borderRadius: 'var(--rounded-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isCompliance ? '#ffffff' : 'rgba(255, 255, 255, 0.82)')}
            >
              FAQs
            </button>

            {/* Login / Portal Button */}
            {!currentUser ? (
              <button
                onClick={() => handleNav('/login')}
                style={{
                  backgroundColor: isLogin ? '#0d2852' : 'transparent',
                  color: isLogin ? '#ffffff' : 'rgba(255, 255, 255, 0.82)',
                  border: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  padding: '7px 18px',
                  borderRadius: 'var(--rounded-full)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isLogin ? '#ffffff' : 'rgba(255, 255, 255, 0.82)')}
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => handleNav('/dashboard')}
                style={{
                  backgroundColor: isDashboard ? '#0d2852' : 'transparent',
                  color: isDashboard ? '#ffffff' : 'rgba(255, 255, 255, 0.82)',
                  border: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  padding: '7px 18px',
                  borderRadius: 'var(--rounded-full)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Claimant Portal
              </button>
            )}
          </nav>

          {/* Right Action Zone: "Get Started" & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            {!currentUser && (
              <button
                className="btn btn-primary-gold header-desktop-cta"
                onClick={() => handleNav('/register')}
                style={{
                  padding: '8px 18px',
                  height: '38px',
                  borderRadius: 'var(--rounded-md)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Get Started
              </button>
            )}

            {/* Profile Avatar Button - only displayed when user is logged in */}
            {currentUser && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title={`${currentUser.name} (Signed In)`}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#0B2D5B',
                    border: '1.5px solid #E68000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <User size={18} />
                </button>

                {/* User Dropdown when logged in */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '46px',
                      width: '240px',
                      backgroundColor: '#ffffff',
                      color: 'var(--neutral-charcoal)',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-tier-3)',
                      border: '1px solid var(--neutral-border)',
                      padding: '12px',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--neutral-border)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0B2D5B' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--outline)' }}>
                        {currentUser.email}
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#047857',
                          backgroundColor: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: 'var(--rounded-full)',
                          marginTop: '4px'
                        }}
                      >
                        {currentUser.type || 'Verified Claimant'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNav('/dashboard')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: 'var(--neutral-charcoal)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-low)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      View Active Claims
                    </button>

                    <button
                      onClick={() => handleNav('/settlements')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: 'var(--neutral-charcoal)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-low)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Restitution Vault
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                        handleNav('/');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px',
                        borderTop: '1px solid var(--neutral-border)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px'
              }}
              className="mobile-toggle-btn"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div
            style={{
              paddingTop: '16px',
              paddingBottom: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <button
              onClick={() => handleNav('/')}
              style={{
                textAlign: 'left',
                background: isHome ? '#0d2852' : 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: 'var(--rounded-md)',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('/compliance')}
              style={{
                textAlign: 'left',
                background: isCompliance ? '#0d2852' : 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: 'var(--rounded-md)',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              How it works & FAQs
            </button>

            {!currentUser ? (
              <button
                onClick={() => handleNav('/login')}
                style={{
                  textAlign: 'left',
                  background: isLogin ? '#0d2852' : 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: 'var(--rounded-md)',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Login to Portal
              </button>
            ) : (
              <button
                onClick={() => handleNav('/dashboard')}
                style={{
                  textAlign: 'left',
                  background: isDashboard ? '#0d2852' : 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: 'var(--rounded-md)',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Claimant Portal & Cases
              </button>
            )}

            {!currentUser ? (
              <button
                onClick={() => handleNav('/register')}
                style={{
                  textAlign: 'left',
                  background: '#E68000',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: 'var(--rounded-md)',
                  fontWeight: 700,
                  fontSize: '14px',
                  marginTop: '4px'
                }}
              >
                Get Started / Open Account
              </button>
            ) : (
              <button
                onClick={() => {
                  onLogout();
                  setMobileOpen(false);
                  handleNav('/');
                }}
                style={{
                  textAlign: 'left',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: 'var(--rounded-md)',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out ({currentUser.name})</span>
              </button>
            )}
          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .header-desktop-cta { display: none !important; }
        }
        @media (min-width: 860px) {
          .header-center-nav { display: flex !important; }
          .mobile-toggle-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
