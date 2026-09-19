import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, AlertCircle, Building } from 'lucide-react';
import { settlementService } from '../services';

export default function SettlementModal({ claim, onClose, onConfirmSettlement }) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!claim) return null;

  const handleConfirm = async () => {
    if (!agreed) return;
    setSubmitting(true);
    try {
      await settlementService.confirmSettlement(claim.id);
      if (onConfirmSettlement) {
        onConfirmSettlement(claim.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to confirm restitution settlement:', err);
      alert(err.message || 'Failed to authorize restitution settlement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#047857'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
                Authorize Restitution Settlement
              </h3>
              <p className="body-sm" style={{ color: 'var(--outline)' }}>
                Case Ref: {claim.id} • Statutory Restitution Order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '6px', height: 'auto' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Restitution Amount Card */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-low)',
              border: '1px solid var(--neutral-border)',
              borderRadius: 'var(--rounded-md)',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <span className="label-sm" style={{ color: 'var(--outline)' }}>
              APPROVED RESTITUTION SUM
            </span>
            <div
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--primary-navy)',
                marginTop: '4px'
              }}
            >
              ₦{claim.amountFormatted}
            </div>
            <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
              Full 100% Monetary Restitution without Deductions
            </div>
          </div>

          {/* Settlement Account Coordinates */}
          <div
            style={{
              border: '1px solid var(--neutral-border)',
              borderRadius: 'var(--rounded-md)',
              padding: '14px',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-navy)', marginBottom: '8px' }}>
              Disbursement Destination Ledger
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--outline)', display: 'block', fontSize: '11px' }}>BENEFICIARY ACCOUNT</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>{claim.originAccount} (NUBAN)</span>
              </div>
              <div>
                <span style={{ color: 'var(--outline)', display: 'block', fontSize: '11px' }}>SETTLEMENT INSTITUTION</span>
                <span style={{ fontWeight: 600 }}>{claim.originBank}</span>
              </div>
              <div>
                <span style={{ color: 'var(--outline)', display: 'block', fontSize: '11px' }}>CLAIMANT ENTITY</span>
                <span style={{ fontWeight: 600 }}>{claim.claimant}</span>
              </div>
              <div>
                <span style={{ color: 'var(--outline)', display: 'block', fontSize: '11px' }}>ORIGINAL SESSION ID</span>
                <span className="tabular-nums" style={{ fontWeight: 600, fontSize: '11px' }}>{claim.sessionId ? claim.sessionId.slice(0, 18) + '...' : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Statutory Declaration & Terms */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 'var(--rounded-md)',
              fontSize: '12px',
              color: '#92400e',
              lineHeight: '1.45'
            }}
          >
            <strong>Statutory Settlement Clause:</strong> Acceptance of this settlement executes a binding electronic release order. The funds will be credited to the verified origin account within 2 banking hours via NIBSS Settlement Clearing.
          </div>

          {/* Legal Checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                marginTop: '3px',
                width: '18px',
                height: '18px',
                accentColor: 'var(--primary-navy)'
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--neutral-charcoal)', lineHeight: '1.4' }}>
              I confirm authorization of this restitution resolution and certify that the above settlement coordinates are accurate and complete.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn btn-primary-gold"
            disabled={!agreed || submitting}
            onClick={handleConfirm}
          >
            {submitting ? 'Disbursing Settlement...' : 'Approve Settlement & Disburse'}
          </button>
        </div>

      </div>
    </div>
  );
}
