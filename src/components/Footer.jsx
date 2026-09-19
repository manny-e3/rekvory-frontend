import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { Compass, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        backgroundColor: '#010d21',
        color: '#ffffff',
        padding: '56px 0 28px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '13px'
      }}
    >
      <div className="app-container">
        
        {/* 4-Column Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))',
            gap: '40px',
            paddingBottom: '40px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          className="footer-grid"
        >
          {/* Column 1: Brand & Compliance Badges */}
          <div>
            <div style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => handleNav('/')}>
              <BrandLogo light={true} text="REKOVRY" />
            </div>

            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.65)',
                maxWidth: '340px',
                marginBottom: '20px'
              }}
            >
              Institutional monetary dispute, chargeback restitution, and claims recovery engine engineered for Nigerian consumers, vendors, and businesses.
            </p>

            {/* Compliance Status Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--rounded-full)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'rgba(255, 255, 255, 0.85)'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E68000' }} />
                <span>CBN DISPUTE FRAMEWORK COMPLIANT</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--rounded-full)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'rgba(255, 255, 255, 0.85)'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2F7BFF' }} />
                <span>NDPR CERTIFIED</span>
              </div>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ffffff',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px'
              }}
            >
              SOLUTIONS
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255, 255, 255, 0.65)' }}>
              <li>
                <button onClick={() => handleNav('/new-claim?category=FAILED_NIP_TRANSFER')} style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                  Failed Bank Transfers
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/new-claim?category=CONTESTED_POS_DEBIT')} style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                  POS & ATM Reversals
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/new-claim?category=UNFULFILLED_MERCHANT')} style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                  Merchant Debits
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/settlements')} style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                  Corporate Settlements
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/new-claim')} style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                  e-Naira & Interbank Claims
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ffffff',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px'
              }}
            >
              NAVIGATION
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255, 255, 255, 0.65)' }}>
              <li>
                <button
                  onClick={() => handleNav('/')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/compliance')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  How it works & FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/dashboard')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Claimant Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/lawyer/dashboard')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Legal Counsel Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/login')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Sign In / Access Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/register')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Open Account (Individual / Lawyer)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/new-claim')}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  File New Dispute
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Help */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ffffff',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px'
              }}
            >
              CONTACT & HELP
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255, 255, 255, 0.65)' }}>
              <li>Victoria Island, Lagos, Nigeria</li>
              <li>
                <a href="mailto:support@rekovry.ng" style={{ color: 'inherit', textDecoration: 'none' }}>
                  support@rekovry.ng
                </a>
              </li>
              <li>+234 (0)1 888 7358</li>
              <li style={{ marginTop: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  <Compass size={14} color="#E68000" />
                  <span>LAGOS RESOLUTION DESK</span>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '24px',
            fontSize: '11.5px',
            color: 'rgba(255, 255, 255, 0.45)'
          }}
        >
          <div>
            © 2026 REKOVRY Nigeria Technologies Ltd. All rights reserved. RC 1884022.
          </div>
          <div>
            Regulatory Disclaimer: REKOVRY facilitates expedited claims arbitration & legal recovery under standard Nigerian banking guidelines.
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
