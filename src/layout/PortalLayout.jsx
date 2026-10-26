import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import NotificationBell from '../components/NotificationBell';
import { ChevronDown, Menu, X, Bell } from 'lucide-react';

export default function PortalLayout({
  children,
  currentUser,
  onLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const userName = currentUser?.name || 'User';

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
              onOpenProfile={() => { setMobileMenuOpen(false); navigate('/profile'); }}
              onOpenSupport={() => { setMobileMenuOpen(false); setSupportModalOpen(true); }}
            />
          </div>
        </div>
      )}

      {/* 2. Main Portal Area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar with Profile */}
        <header
          className="portal-top-header"
          style={{
            padding: '16px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Mobile hamburger button + portal breadcrumb */}
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
                  onClick={() => { setUserDropdownOpen(false); navigate('/new-claim'); }}
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
                  File New Claim
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

        {/* Child Page Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .portal-top-header {
            padding: 12px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
