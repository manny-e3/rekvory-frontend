import React from 'react';
import BrandLogo from '../components/BrandLogo';
import { Shield, ShieldCheck, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
  title,
  subtitle,
  onBackToHome,
  sidebarBadge,
  sidebarTitle = 'Institutional Recovery Portal',
  sidebarSubtitle = 'Direct access for Nigerian consumers, vendors, and corporate entities tracking active dispute dossiers, interbank inquests, and restitution disbursements.',
  sidebarChecklist = [
    'Automated NIBSS NIP Session Trace & Switch Evidence',
    'Statutory 72-Hour Response Time Enforcement',
    'Section 84 Evidence Act Certified Audit Vouchers'
  ],

}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#03142e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '36px 16px 20px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(47, 123, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(230, 128, 0, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)',
          position: 'relative',
          zIndex: 10,
          margin: 'auto 0'
        }}
        className="auth-grid"
      >
        {/* Left Side: Institutional Authority Panel (Navy) */}
        <div
          style={{
            background: 'linear-gradient(145deg, #021129 0%, #081d3d 60%, #0c2752 100%)',
            color: '#ffffff',
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
          className="auth-sidebar"
        >
          {/* Top Brand & Back to Home button */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
              <BrandLogo light={true} text="REKOVRY" />
              <button
                onClick={onBackToHome}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: 'var(--rounded-full)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={13} />
                <span>Home</span>
              </button>
            </div>

            {sidebarBadge || (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(230, 128, 0, 0.15)',
                  border: '1px solid rgba(230, 128, 0, 0.3)',
                  padding: '4px 10px',
                  borderRadius: 'var(--rounded-full)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#ffb356',
                  marginBottom: '16px'
                }}
              >
                <ShieldCheck size={13} />
                <span>CBN RESTITUTION PROTOCOLS</span>
              </div>
            )}

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '1.3',
                color: '#ffffff',
                marginBottom: '14px'
              }}
            >
              {sidebarTitle}
            </h2>

            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '28px' }}>
              {sidebarSubtitle}
            </p>

            {/* Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sidebarChecklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="#E68000" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* Right Side: Interactive Form Container (White) */}
        <div
          className="auth-form-container"
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Mobile-Only Header Brand Bar */}
          <div
            className="auth-mobile-header"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--neutral-border)'
            }}
          >
            <div onClick={onBackToHome} style={{ cursor: 'pointer' }}>
              <BrandLogo light={false} text="REKOVRY" />
            </div>
            <button
              onClick={onBackToHome}
              style={{
                background: '#f1f5f9',
                border: '1px solid var(--neutral-border)',
                color: 'var(--neutral-charcoal)',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: 'var(--rounded-full)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={13} />
              <span>Home</span>
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h1
              className="headline-md"
              style={{ color: '#0B2D5B', fontWeight: 700, marginBottom: '6px' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '13.5px', color: 'var(--outline)' }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* Minimal Institutional Auth Footer */}
      <footer
        style={{
          width: '100%',
          maxWidth: '1020px',
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11.5px',
          color: 'rgba(255, 255, 255, 0.55)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={12} color="#acc7fe" />
          <span>© 2026 REKOVRY Technologies Ltd. All rights reserved.</span>
        </div>

      </footer>

      <style>{`
        @media (max-width: 860px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-sidebar {
            display: none !important;
          }
          .auth-mobile-header {
            display: flex !important;
          }
          .auth-form-container {
            padding: 28px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
