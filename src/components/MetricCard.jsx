import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'standard', // 'standard' | 'authority'
  accentColor = '#0B2D5B',
  badgeText,
  badgeStatus = 'info'
}) {
  const isAuthority = variant === 'authority';

  if (isAuthority) {
    return (
      <div className="surface-card-authority" style={{ minHeight: '140px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#acc7fe'
              }}
            >
              {title}
            </span>
            <div
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '28px',
                fontWeight: 700,
                color: '#ffffff',
                marginTop: '6px',
                lineHeight: 1.2
              }}
            >
              {value}
            </div>
          </div>
          {Icon && (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--rounded-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e68000'
              }}
            >
              <Icon size={22} strokeWidth={2} />
            </div>
          )}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.75)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="surface-card" style={{ minHeight: '140px' }}>
      <div className="card-top-accent" style={{ backgroundColor: accentColor }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--outline)'
            }}
          >
            {title}
          </span>
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--primary-navy)',
              marginTop: '6px',
              lineHeight: 1.2
            }}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--rounded-md)',
              backgroundColor: 'var(--neutral-canvas)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor
            }}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
            {subtitle}
          </span>
        )}
        {badgeText && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--rounded-full)',
              backgroundColor: badgeStatus === 'success' ? '#ecfdf5' : '#eff6ff',
              color: badgeStatus === 'success' ? '#047857' : '#1d4ed8'
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
