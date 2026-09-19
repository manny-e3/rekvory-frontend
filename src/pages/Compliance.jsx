import React from 'react';
import { NIGERIAN_BANKS } from '../utils';
import { Shield, BookOpen, CheckCircle, Scale, Building2, ExternalLink } from 'lucide-react';

export default function ComplianceView() {
  return (
    <div style={{ padding: '28px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <span className="label-sm" style={{ color: 'var(--trust-blue)', display: 'block', marginBottom: '4px' }}>
            INSTITUTIONAL & REGULATORY GOVERNANCE
          </span>
          <h1 className="headline-lg" style={{ color: 'var(--primary-navy)' }}>
            Regulatory Framework & Interbank Network
          </h1>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Statutory legal backing and technical clearing integration underpinning sovereign restitution workflows.
          </p>
        </div>

        {/* Regulatory Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          {/* Card 1: CBN Directives */}
          <div className="surface-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--rounded-md)', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                <Scale size={22} />
              </div>
              <div>
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                  Central Bank of Nigeria (CBN) Framework
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                  Consumer Protection Department Directive (2020/2024)
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--neutral-charcoal)', lineHeight: '1.5' }}>
              Mandates that failed electronic fund transfers where value is debited from the customer's account but not received by the beneficiary must be reversed within statutory windows (instant to maximum T+1/T+2), failing which daily penalties apply to default institutions.
            </p>
          </div>

          {/* Card 2: NIBSS NIP Protocols */}
          <div className="surface-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--rounded-md)', backgroundColor: '#ecfdf5', color: '#047857' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                  NIBSS Instant Payments (NIP) Trace
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                  Clearing House Session Identifier Reconciliation
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--neutral-charcoal)', lineHeight: '1.5' }}>
              Direct integration with NIBSS electronic transaction trace protocols. Generates cryptographic Session ID verifications that pin-point exactly where funds stalled in the switch between originating and receiving settlement ledgers.
            </p>
          </div>

          {/* Card 3: Evidence Act 2011 */}
          <div className="surface-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--rounded-md)', backgroundColor: '#fffbeb', color: '#b45309' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                  Evidence Act (Section 84) Admissibility
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                  Judicially Certified Computer-Generated Records
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--neutral-charcoal)', lineHeight: '1.5' }}>
              All dispute files, demand notices, and electronic debit receipts generated within Sovereign Recovery include statutory Section 84 certificate hashes, ensuring automatic admissibility before high courts and regulatory tribunals.
            </p>
          </div>
        </div>

        {/* Directory of Integrated Financial Institutions */}
        <div className="surface-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                Integrated Nigerian Financial Institutions & Clearing Desks
              </h2>
              <p className="body-sm" style={{ color: 'var(--outline)', marginTop: '2px' }}>
                Direct API and designated compliance desk routing across commercial banks, merchant acquirers, and fintechs.
              </p>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#047857',
                backgroundColor: '#ecfdf5',
                padding: '4px 12px',
                borderRadius: 'var(--rounded-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle size={14} />
              <span>100% Core Switch Coverage</span>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}
          >
            {NIGERIAN_BANKS.map((bank) => (
              <div
                key={bank.id}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--surface-container-low)',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: 'var(--rounded-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--neutral-charcoal)', display: 'block' }}>
                    {bank.name}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                    CBN Code: {bank.code} • {bank.type}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: '#047857',
                    backgroundColor: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: 'var(--rounded-full)'
                  }}
                >
                  ONLINE
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
