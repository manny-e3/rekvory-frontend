import React from 'react';
import { X, Printer, Download, ShieldCheck, FileText } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function DemandNoticeModal({ claim, onClose }) {
  if (!claim) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary-navy)" />
            <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
              Official Restitution Demand Notice
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Document Container */}
          <div
            id="printable-notice"
            style={{
              padding: '24px',
              border: '2px solid var(--neutral-border)',
              borderRadius: 'var(--rounded-md)',
              backgroundColor: '#ffffff',
              fontFamily: 'var(--font-body)',
              color: '#181930'
            }}
          >
            {/* Notice Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0B2D5B', paddingBottom: '16px', marginBottom: '20px' }}>
              <BrandLogo />
              <div style={{ textAlign: 'right' }}>
                <span className="label-sm" style={{ color: 'var(--outline)', display: 'block' }}>
                  STATUTORY INSTRUMENT REF
                </span>
                <span className="tabular-nums" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: '#0B2D5B' }}>
                  SR-DEMAND-{claim.id}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>
                  ISSUED: 16 SEP 2026 • 10:48 WAT
                </span>
              </div>
            </div>

            {/* Notice Title */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0B2D5B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                NOTICE OF DISPUTED TRANSACTION & FORMAL RESTITUTION DEMAND
              </h2>
              <span style={{ fontSize: '12px', color: '#B45309', fontWeight: 600 }}>
                PURSUANT TO CBN CONSUMER PROTECTION REGULATIONS & NIBSS ARBITRATION FRAMEWORK
              </span>
            </div>

            {/* Addressed To */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--rounded-md)', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>TO:</strong> Dispute Operations & Settlement Clearing Desks</div>
              <div style={{ marginTop: '2px' }}><strong>RESPONDENT INSTITUTION:</strong> {claim.beneficiaryBank} / {claim.originBank}</div>
              <div style={{ marginTop: '2px' }}><strong>CLAIMANT:</strong> {claim.claimant} ({claim.claimantType})</div>
            </div>

            {/* Matter Specifications */}
            <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
              <p>
                <strong>DEMAND SUMMARY:</strong> Take Notice that on <strong>{claim.transactionDate}</strong>, the sum of <strong>₦{claim.amountFormatted}</strong> was deducted from Claimant Account <code>{claim.originAccount}</code> held with {claim.originBank} under Session ID <code>{claim.sessionId || 'NIBSS-TRACE-UNCONFIRMED'}</code> (RRN: <code>{claim.rrn || 'N/A'}</code>).
              </p>
              <p style={{ marginTop: '8px' }}>
                Electronic trail demonstrates that value was not credited nor retained lawfully by the intended beneficiary <strong>{claim.beneficiaryName || 'Beneficiary'}</strong>. The statutory 24-hour instant payment reversal window has expired.
              </p>
            </div>

            {/* Demand Order Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderLeft: '4px solid #0B2D5B',
                padding: '12px 16px',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              <strong>STATUTORY DIRECTIVE:</strong>
              <div style={{ marginTop: '4px' }}>
                You are hereby notified to conclude automated interbank reconciliation or effect full refund of <strong>₦{claim.amountFormatted}</strong> to the originating account within statutory 48 banking hours, failing which this matter escalates to the CBN Consumer Protection Department and the Interbank Arbitration Panel.
              </div>
            </div>

            {/* Digital Verification Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--neutral-border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontSize: '12px', fontWeight: 600 }}>
                  <ShieldCheck size={18} />
                  <span>Digitally Certified by Sovereign Restitution Network</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--outline)', marginTop: '2px' }}>
                  Cryptographic Hash: e8f94a82c9012b5f63901ac8942b91
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', color: '#0B2D5B' }}>
                  SOVEREIGN LEGAL ARBITRATION
                </div>
                <div style={{ fontSize: '11px', color: 'var(--outline)' }}>
                  Office of Financial Restitution
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary-blue" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Notice</span>
          </button>
          <button className="btn btn-primary-gold" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
