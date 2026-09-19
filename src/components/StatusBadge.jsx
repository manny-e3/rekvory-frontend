import React from 'react';

export default function StatusBadge({ status = 'info', label }) {
  // Normalize status key
  const normalizedStatus = ['success', 'warning', 'error', 'info'].includes(status) ? status : 'info';

  const defaultLabels = {
    success: 'Recovered',
    warning: 'Under Review',
    error: 'Escalated',
    info: 'Awaiting Documents'
  };

  const displayLabel = label || defaultLabels[normalizedStatus];

  return (
    <span className={`status-pill ${normalizedStatus}`}>
      <span className="status-pill-dot" />
      <span>{displayLabel}</span>
    </span>
  );
}
