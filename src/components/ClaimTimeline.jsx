import React from 'react';
import { Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ClaimTimeline({ timeline = [] }) {
  return (
    <div style={{ position: 'relative', padding: '8px 0' }}>
      {timeline.map((step, idx) => {
        const isLast = idx === timeline.length - 1;
        const isDone = step.completed;
        const isCurrent = step.current;

        let nodeBg = 'var(--neutral-canvas)';
        let nodeBorder = 'var(--neutral-border)';
        let nodeColor = 'var(--outline)';
        let lineColor = isDone ? 'var(--trust-blue)' : 'var(--neutral-border)';

        if (isDone) {
          nodeBg = '#ecfdf5';
          nodeBorder = '#10b981';
          nodeColor = '#047857';
        } else if (isCurrent) {
          nodeBg = '#fffbeb';
          nodeBorder = '#e68000';
          nodeColor = '#e68000';
        }

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '16px',
              position: 'relative',
              paddingBottom: isLast ? '0px' : '28px'
            }}
          >
            {/* Vertical Connector Line */}
            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '24px',
                  bottom: '0px',
                  width: '2px',
                  backgroundColor: lineColor,
                  transition: 'background-color 0.2s ease'
                }}
              />
            )}

            {/* Node Indicator (24px circle) */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: nodeBg,
                border: `2px solid ${nodeBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: nodeColor,
                flexShrink: 0,
                zIndex: 2,
                boxShadow: isCurrent ? '0 0 0 4px rgba(230, 128, 0, 0.15)' : 'none'
              }}
            >
              {isDone ? (
                <Check size={12} strokeWidth={3} />
              ) : isCurrent ? (
                <Clock size={12} strokeWidth={2.5} />
              ) : (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--outline-variant)' }} />
              )}
            </div>

            {/* Step Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDone || isCurrent ? 'var(--neutral-charcoal)' : 'var(--outline)'
                  }}
                >
                  {step.title}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: isCurrent ? 'var(--recovery-gold)' : 'var(--outline)'
                  }}
                >
                  {step.date}
                </span>
              </div>

              {step.description && (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--on-surface-variant)',
                    marginTop: '4px',
                    lineHeight: '1.45'
                  }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
