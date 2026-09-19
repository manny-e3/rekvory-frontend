import React from 'react';

export default function BrandLogo({ size = 'default', light = true, text = 'REKOVRY' }) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 34 : 26;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* Outer Shield & Restitution Arrow Vector Mark */}
      <div
        style={{
          width: isLarge ? '38px' : '30px',
          height: isLarge ? '38px' : '30px',
          borderRadius: '7px',
          backgroundColor: light ? 'transparent' : '#0B2D5B',
          border: light ? '1.5px solid rgba(255, 255, 255, 0.3)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Outline */}
          <path
            d="M16 3L5 7.2V15C5 22.2 9.7 28.8 16 30.5C22.3 28.8 27 22.2 27 15V7.2L16 3Z"
            fill={light ? '#ffffff' : '#0B2D5B'}
          />
          {/* Dynamic Restitution Gold Arrow */}
          <path
            d="M16 8L21.5 14H18V21.5H14V14H10.5L16 8Z"
            fill="#E68000"
          />
        </svg>
      </div>

      {/* Wordmark & Subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: isLarge ? '19px' : '16px',
            lineHeight: 1.15,
            letterSpacing: '0.06em',
            color: light ? '#FFFFFF' : '#0B2D5B',
            textTransform: 'uppercase'
          }}
        >
          {text}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: isLarge ? '9px' : '8.5px',
            lineHeight: 1.2,
            letterSpacing: '0.14em',
            color: light ? 'rgba(255, 255, 255, 0.75)' : '#E68000',
            textTransform: 'uppercase',
            marginTop: '2px'
          }}
        >
          CLAIMS & RECOVERY
        </span>
      </div>
    </div>
  );
}
