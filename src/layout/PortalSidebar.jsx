import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  User,
  HelpCircle,
  LogOut,
  Shield,
  Scale
} from 'lucide-react';

export default function PortalSidebar({
  onLogout,
  onOpenMessages,
  onOpenProfile,
  onOpenSupport
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardActive = location.pathname === '/dashboard';
  const isClaimsActive = location.pathname === '/claims' || location.pathname === '/my-claims' || location.pathname.startsWith('/claims/');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      path: '/dashboard',
      active: isDashboardActive
    },
    {
      id: 'claims',
      label: 'My Claims',
      icon: FileText,
      path: '/claims',
      active: isClaimsActive
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: '#001433',
        color: '#ffffff',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        zIndex: 100
      }}
      className="portal-sidebar"
    >
      {/* Brand Header */}
      <div
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 8px 32px'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <Shield size={20} color="#ff8c00" />
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#2F7BFF',
              top: '8px',
              right: '8px'
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#ffffff',
              lineHeight: 1.1
            }}
          >
            REKOVRY
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#7b96ca',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}
          >
            CLAIMS & RECOVERY
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (item.onClick) {
                  item.onClick();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: isActive ? '#ffffff' : '#8a99b5',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8a99b5';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#ffffff' : '#8a99b5'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
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
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Help & Support, Log out */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <button
          onClick={onOpenSupport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#8a99b5',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13.5px',
            fontWeight: 500,
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8a99b5';
          }}
        >
          <HelpCircle size={18} color="#8a99b5" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#8a99b5',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13.5px',
            fontWeight: 500,
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8a99b5';
          }}
        >
          <LogOut size={18} color="#8a99b5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
