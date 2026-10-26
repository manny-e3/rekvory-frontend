import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import {
  Shield,
  CreditCard,
  Building,
  RotateCcw,
  Package,
  Gavel,
  MessageSquareText,
  MoreHorizontal,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Landmark,
  FileCheck,
  Scale,
  User,
  ShieldCheck
} from 'lucide-react';

export default function LandingPageView({
  onStartClaim,
  onTrackCase,
  onSelectCategory
}) {
  const navigate = useNavigate();

  const handleStartClaim = () => {
    if (onStartClaim) onStartClaim();
    else navigate('/new-claim');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackCase = () => {
    if (onTrackCase) onTrackCase();
    else navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryFilter) => {
    if (onSelectCategory) onSelectCategory(categoryFilter);
    else navigate(`/new-claim?category=${categoryFilter}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const recoveryCategories = [
    {
      id: 'refund',
      title: 'Refund',
      subtitle: 'Failed reversals',
      icon: RotateCcw,
      categoryFilter: 'FAILED_NIP_TRANSFER'
    },
    {
      id: 'payment_issue',
      title: 'Payment issue',
      subtitle: 'POS / ATM drops',
      icon: CreditCard,
      categoryFilter: 'CONTESTED_POS_DEBIT'
    },
    {
      id: 'service_not_delivered',
      title: 'Service not delivered',
      subtitle: 'Vendor default',
      icon: Package,
      categoryFilter: 'UNFULFILLED_MERCHANT'
    },
    {
      id: 'consumer_claim',
      title: 'Consumer claim',
      subtitle: 'Legal compliance',
      icon: Gavel,
      categoryFilter: 'GATEWAY_CHARGEBACK'
    },
    {
      id: 'dispute',
      title: 'Dispute',
      subtitle: 'Merchant contracts',
      icon: MessageSquareText,
      categoryFilter: 'UNFULFILLED_MERCHANT'
    },
    {
      id: 'other',
      title: 'Other',
      subtitle: 'Direct inquiry',
      icon: MoreHorizontal,
      categoryFilter: 'FAILED_NIP_TRANSFER'
    }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: 'var(--neutral-charcoal)' }}>
      
      {/* 1. HERO SECTION (Dark Sovereign Navy) */}
      <section
        className="hero-section"
        style={{
          background: 'linear-gradient(135deg, #021129 0%, #081d3d 50%, #0d2852 100%)',
          color: '#ffffff',
          padding: '60px 0 110px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle geometric grid background overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(rgba(47, 123, 255, 0.12) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            opacity: 0.7,
            pointerEvents: 'none'
          }}
        />

        {/* Ambient glow in upper right */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '5%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(47, 123, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        <div className="app-container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
              gap: '48px',
              alignItems: 'center'
            }}
            className="hero-grid"
          >
            {/* Left Column: Headline & Action Triggers */}
            <div className="hero-content-col">
              {/* Protocol Status Pill */}
              <div
                className="hero-protocol-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  padding: '6px 14px',
                  borderRadius: 'var(--rounded-full)',
                  marginBottom: '20px',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#E68000',
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                />
                <span
                  className="hero-protocol-text"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    lineHeight: '1.4'
                  }}
                >
                  CBN DISPUTE RESOLUTION PROTOCOLS ACTIVE
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="display-lg hero-headline"
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(28px, 6.5vw, 48px)',
                  lineHeight: '1.15',
                  letterSpacing: '-0.02em',
                  marginBottom: '16px'
                }}
              >
                Real people.
                <br />
                <span style={{ color: '#E68000' }}>Real resolutions.</span>
              </h1>

              {/* Description Paragraph */}
              <p
                className="hero-desc"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.82)',
                  maxWidth: '520px',
                  marginBottom: '32px'
                }}
              >
                We help individuals and businesses get the refunds, payments and services they are entitled to. Reclaiming contested funds through rigorous institutional channels.
              </p>

              {/* CTA Action Buttons */}
              <div
                className="hero-cta-group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  marginBottom: '40px'
                }}
              >
                <button
                  className="btn btn-primary-gold"
                  onClick={handleStartClaim}
                  style={{
                    padding: '12px 28px',
                    height: '48px',
                    fontSize: '15px',
                    borderRadius: 'var(--rounded-md)',
                    fontWeight: 700
                  }}
                >
                  Start a Claim
                </button>

                <button
                  onClick={handleTrackCase}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '10px 0'
                  }}
                >
                  <span>Track your case</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Trust Footnotes Bar */}
              <div
                className="hero-trust-bar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="#E68000" />
                  <span>Trusted across Nigeria</span>
                </span>
                <span className="hero-bullet" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} color="#E68000" />
                  <span className="tabular-nums">Over ₦450M recovered</span>
                </span>
                <span className="hero-bullet" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={14} color="#E68000" />
                  <span>Fast legal resolution</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Graphic with Floating Badge */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '430px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  backgroundColor: '#051833',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <img
                  src="/hero-executive.jpg"
                  alt="Sovereign Recovery Executive"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback in case path resolution needs artifact path
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Floating "Tier-1 Interbank Recourse" Badge */}
                <div
                  className="hero-floating-badge"
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    backgroundColor: '#ffffff',
                    color: 'var(--neutral-charcoal)',
                    borderRadius: 'var(--rounded-md)',
                    padding: '12px 18px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 10,
                    maxWidth: '280px'
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--rounded-md)',
                      backgroundColor: 'var(--surface-container)',
                      color: '#0B2D5B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Landmark size={20} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', color: '#0B2D5B' }}>
                      Tier-1 Interbank Recourse
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px' }}>
                      Arbitration within 14 Days
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FLOATING CARD: "What do you need help recovering?" */}
      <section style={{ position: 'relative', marginTop: '-65px', zIndex: 10, marginBottom: '48px' }} className="categories-section">
        <div className="app-container">
          <div
            className="categories-card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '36px 32px',
              boxShadow: '0 12px 36px -4px rgba(11, 45, 91, 0.08), 0 4px 12px rgba(11, 45, 91, 0.04)',
              border: '1px solid #e9edf5'
            }}
          >
            {/* Title */}
            <h2
              className="headline-md"
              style={{
                textAlign: 'center',
                color: '#0B2D5B',
                marginBottom: '28px',
                fontWeight: 700
              }}
            >
              What do you need help recovering?
            </h2>

            {/* 6 Category Tiles */}
            <div
              className="categories-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
              }}
            >
              {recoveryCategories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.categoryFilter)}
                    style={{
                      backgroundColor: '#f3f6fc',
                      borderRadius: '12px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#2F7BFF';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 123, 255, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f6fc';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0B2D5B',
                        marginBottom: '12px',
                        boxShadow: '0 2px 6px rgba(11, 45, 91, 0.06)'
                      }}
                    >
                      <IconComponent size={20} strokeWidth={2} />
                    </div>

                    <strong
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0B2D5B',
                        marginBottom: '4px'
                      }}
                    >
                      {cat.title}
                    </strong>

                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--outline)'
                      }}
                    >
                      {cat.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Link */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--outline)' }}>
                Already have a claim?{' '}
              </span>
              <button
                onClick={handleTrackCase}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2F7BFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Track your case</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FOUR KEY STATISTICS GRID */}
      <section style={{ padding: '24px 0 60px' }}>
        <div className="app-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Stat 1: Total Recovered */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e9edf5',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-tier-1)'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#2F7BFF',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                TOTAL RECOVERED
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#0B2D5B',
                  lineHeight: '1.2',
                  marginBottom: '8px'
                }}
              >
                ₦450M+
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
                Returned directly to verified individual claimant accounts.
              </p>
            </div>

            {/* Stat 2: Resolution Success */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e9edf5',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-tier-1)'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#E68000',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                RESOLUTION SUCCESS
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#0B2D5B',
                  lineHeight: '1.2',
                  marginBottom: '8px'
                }}
              >
                94.2%
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
                Of eligible interbank and unauthorized card debit claims recovered in full.
              </p>
            </div>

            {/* Stat 3: Turnaround Time */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e9edf5',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-tier-1)'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#2F7BFF',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                TURNAROUND TIME
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#0B2D5B',
                  lineHeight: '1.2',
                  marginBottom: '8px'
                }}
              >
                14 Days
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
                Average settlement duration from submission to institutional credit reversal.
              </p>
            </div>

            {/* Stat 4: Institutional Range */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e9edf5',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-tier-1)'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#2F7BFF',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                INSTITUTIONAL RANGE
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#0B2D5B',
                  lineHeight: '1.2',
                  marginBottom: '8px'
                }}
              >
                32+ Banks
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
                Seamless integration with commercial banks, payment switches & fintech gateways.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. "Structured recovery backed by Nigerian financial law." SECTION */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="app-container">
          <div
            className="law-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e9edf5',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: 'var(--shadow-tier-1)'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                gap: '40px',
                alignItems: 'center'
              }}
              className="law-section-grid"
            >
              {/* Left Column: Statutory Law Narrative */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#E68000'
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#E68000',
                      textTransform: 'uppercase'
                    }}
                  >
                    ARBITRATION WORKFLOW
                  </span>
                </div>

                <h2
                  className="headline-lg"
                  style={{
                    color: '#0B2D5B',
                    fontSize: '30px',
                    lineHeight: '1.25',
                    marginBottom: '14px',
                    fontWeight: 700
                  }}
                >
                  Structured recovery backed by Nigerian financial law.
                </h2>

                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--on-surface-variant)',
                    marginBottom: '24px'
                  }}
                >
                  Every filed incident automatically invokes CBN regulatory timelines, dispatching automated legal requests and arbitration documents to corresponding payment operators.
                </p>

                {/* Feature highlight box 1 */}
                <div
                  style={{
                    backgroundColor: '#f3f6fc',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    marginBottom: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#e6eeff',
                      color: '#2F7BFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0B2D5B', display: 'block' }}>
                      Automated Chargeback Filings
                    </strong>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                      Immediate evidence packets dispatched to acquiring switch desks.
                    </p>
                  </div>
                </div>

                {/* Feature highlight box 2 */}
                <div
                  style={{
                    backgroundColor: '#f3f6fc',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#fff4e5',
                      color: '#E68000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0B2D5B', display: 'block' }}>
                      Strict 72-Hour Audit Deadlines
                    </strong>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                      Mandatory response intervals enforced against defaulting processors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: "Live Claim Progression" Card */}
              <div
                style={{
                  backgroundColor: '#f3f6fc',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #e2e8f4'
                }}
              >
                {/* Header with Case ID Pill */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#E68000'
                      }}
                    />
                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#0B2D5B' }}>
                      Live Claim Progression
                    </strong>
                  </div>

                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      color: 'var(--outline)',
                      padding: '4px 10px',
                      borderRadius: 'var(--rounded-full)',
                      border: '1px solid #e2e8f4'
                    }}
                  >
                    CASE #RK-8842-LOS
                  </span>
                </div>

                {/* Timeline Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  
                  {/* Step 1 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#0B2D5B',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#0B2D5B' }}>
                          Dispute Lodged & Evidence Bundled
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Day 1</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                        Transaction reference, debit alert, and session ID registered.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#0B2D5B',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <RotateCcw size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#0B2D5B' }}>
                          Interbank Settlement Inquiry Sent
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Day 4</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                        Formal demand served to switch reconciliation desk in Marina, Lagos.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#e6eeff',
                        color: '#2F7BFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CreditCard size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '13px', color: '#0B2D5B' }}>
                          Restitution & Direct Account Credit
                        </strong>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            backgroundColor: '#fff4e5',
                            color: '#E68000',
                            padding: '2px 8px',
                            borderRadius: 'var(--rounded-full)'
                          }}
                        >
                          Pending Credit
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                        Final automated reversal batch scheduled by destination payment gateway.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Footer bar inside widget */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e2e8f4',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0B2D5B' }}>
                    <Shield size={14} color="#047857" />
                    <span>Protected by Escrow Audit</span>
                  </div>

                  <button
                    onClick={handleStartClaim}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#E68000',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Start filing now</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Custom styles for mobile responsiveness */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
            gap: 36px !important;
          }
          .hero-grid > div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .law-section-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .hero-cta-group {
            justify-content: center !important;
          }
        }
        @media (max-width: 768px) {
          .hero-section {
            padding: 40px 0 60px !important;
          }
          .hero-headline {
            font-size: clamp(26px, 7vw, 36px) !important;
          }
          .hero-desc {
            font-size: 14.5px !important;
            margin-bottom: 24px !important;
          }
          .categories-section {
            margin-top: -24px !important;
            margin-bottom: 32px !important;
          }
          .categories-card {
            padding: 24px 16px !important;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .law-card {
            padding: 20px 16px !important;
          }
          .hero-floating-badge {
            left: 10px !important;
            right: 10px !important;
            bottom: 10px !important;
            max-width: calc(100% - 20px) !important;
            padding: 10px 12px !important;
          }
          .hero-trust-bar {
            justify-content: center !important;
            gap: 8px !important;
            font-size: 11.5px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-cta-group {
            flex-direction: column !important;
            width: 100% !important;
            gap: 12px !important;
          }
          .hero-cta-group button {
            width: 100% !important;
          }
          .hero-bullet {
            display: none !important;
          }
          .hero-trust-bar {
            flex-direction: column !important;
            gap: 6px !important;
          }
          .hero-protocol-text {
            font-size: 9px !important;
            letter-spacing: 0.04em !important;
          }
          .categories-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>

    </div>
  );
}
