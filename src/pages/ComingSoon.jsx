import React from 'react';
import {
  RotateCcw,
  CreditCard,
  Scale,
  ShieldAlert
} from 'lucide-react';
import './ComingSoon.css';

export default function ComingSoon() {
  return (
    <div className="rekovry-cs-viewport" id="rekovry-coming-soon">
      {/* Precision grid mesh and concentric circular radar waves */}
      <div className="rekovry-cs-mesh" />
      <div className="rekovry-cs-concentric" />
      <div className="rekovry-cs-orb-azure" />
      <div className="rekovry-cs-orb-gold" />

      {/* Main Showcase Canvas */}
      <div className="rekovry-cs-canvas">
        {/* Floating Illuminated Brand Crest */}
        <div className="rekovry-cs-crest-wrapper">
          <div className="rekovry-cs-crest-glow" />
          <div className="rekovry-cs-crest">
            <svg
              width="44"
              height="44"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sovereign Shield Outline */}
              <path
                d="M16 3L5 7.2V15C5 22.2 9.7 28.8 16 30.5C22.3 28.8 27 22.2 27 15V7.2L16 3Z"
                fill="#ffffff"
              />
              {/* Dynamic Restitution Gold Arrow */}
              <path
                d="M16 8L21.5 14H18V21.5H14V14H10.5L16 8Z"
                fill="#E68000"
              />
            </svg>
          </div>
        </div>

        {/* Brand Wordmark & Tagline */}
        <div className="rekovry-cs-brand-text">
          <span className="rekovry-cs-brand-name">REKOVRY</span>
          <span className="rekovry-cs-brand-sub">CLAIMS &amp; RECOVERY PLATFORM</span>
        </div>

        {/* Status Radar Ribbon */}
        <div className="rekovry-cs-status">
          <span className="rekovry-cs-radar">
            <span className="rekovry-cs-radar-dot" />
            <span className="rekovry-cs-radar-ring" />
          </span>
          <span className="rekovry-cs-status-text">
            System Initialization • Public Launch Imminent
          </span>
        </div>

        {/* Grand Headline */}
        <h1 className="rekovry-cs-heading">
          Financial Restitution.{' '}
          <span className="rekovry-cs-gradient-text">Redefined.</span>
        </h1>

        {/* Strategic Purpose Manifesto */}
        <p className="rekovry-cs-manifesto">
          Nigeria’s sovereign restitution and dispute arbitration engine. 
          Holding financial institutions and defaulting merchants accountable through 
          automated evidence bundling, statutory CBN circular compliance, and accredited 
          legal counsel enforcement.
        </p>

        {/* Core Pillars / Target Disputations */}
        <div className="rekovry-cs-pillars">
          <div className="rekovry-cs-pillar-item">
            <span className="rekovry-cs-pillar-icon" style={{ color: '#38bdf8' }}>
              <RotateCcw size={15} />
            </span>
            <span>Failed NIP Bank Transfers</span>
          </div>

          <div className="rekovry-cs-pillar-item">
            <span className="rekovry-cs-pillar-icon" style={{ color: '#e68000' }}>
              <CreditCard size={15} />
            </span>
            <span>Contested POS &amp; ATM Debits</span>
          </div>

          <div className="rekovry-cs-pillar-item">
            <span className="rekovry-cs-pillar-icon" style={{ color: '#a855f7' }}>
              <ShieldAlert size={15} />
            </span>
            <span>Vendor Delivery Defaults</span>
          </div>

          <div className="rekovry-cs-pillar-item">
            <span className="rekovry-cs-pillar-icon" style={{ color: '#10b981' }}>
              <Scale size={15} />
            </span>
            <span>Accredited Counsel Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
