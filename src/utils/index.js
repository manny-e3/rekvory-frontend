// Sovereign Recovery - Utilities, Constants & Data Exports
export * from './mockData';

export const formatNaira = (amount, decimals = 2) => {
  const num = parseFloat(amount) || 0;
  return `₦${num.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

export const formatSessionId = (sessionId) => {
  if (!sessionId) return 'N/A';
  if (sessionId.length <= 16) return sessionId;
  return `${sessionId.slice(0, 16)}...`;
};

export const formatTimestamp = (dateStr) => {
  if (!dateStr) return 'Just now';
  return dateStr.replace('T', ' ');
};
