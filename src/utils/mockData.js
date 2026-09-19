// Sovereign Recovery - Reference Constants & Data Structures

export const NIGERIAN_BANKS = [
  { id: 'access', name: 'Access Bank Plc', code: '044', type: 'Commercial' },
  { id: 'gtbank', name: 'Guaranty Trust Bank (GTBank)', code: '058', type: 'Commercial' },
  { id: 'zenith', name: 'Zenith Bank Plc', code: '057', type: 'Commercial' },
  { id: 'firstbank', name: 'First Bank of Nigeria', code: '011', type: 'Commercial' },
  { id: 'uba', name: 'United Bank for Africa (UBA)', code: '033', type: 'Commercial' },
  { id: 'stanbic', name: 'Stanbic IBTC Bank', code: '221', type: 'Commercial' },
  { id: 'fidelity', name: 'Fidelity Bank Plc', code: '070', type: 'Commercial' },
  { id: 'opay', name: 'OPay Digital Services (Paycom)', code: '999992', type: 'Fintech/PSB' },
  { id: 'moniepoint', name: 'Moniepoint Microfinance Bank', code: '50515', type: 'Fintech/MFB' },
  { id: 'kuda', name: 'Kuda Bank (Microfinance)', code: '50211', type: 'Fintech/MFB' },
  { id: 'palmpay', name: 'PalmPay Limited', code: '999991', type: 'Fintech/PSB' },
  { id: 'wema', name: 'Wema Bank / ALAT', code: '035', type: 'Commercial' }
];

export const DISPUTE_CATEGORIES = [
  {
    id: 'REFUND',
    name: 'Refund',
    icon: '💰',
    description: 'Unprocessed or delayed refund for merchandise, duplicate debit, subscription or cancelled booking.',
    defaultResolutionTime: '24 - 48 Hours',
    regulatoryRule: 'CBN Direct Consumer Refund Framework'
  },
  {
    id: 'PAYMENT_ISSUE',
    name: 'Payment issue',
    icon: '💳',
    description: 'Declined POS card transaction, failed interbank instant transfer (NIP), or duplicate charge.',
    defaultResolutionTime: '24 - 72 Hours',
    regulatoryRule: 'CBN Guidelines on Electronic Payments and Instant Clearing'
  },
  {
    id: 'SERVICE_ISSUE',
    name: 'Service issue',
    icon: '📦',
    description: 'Unrendered corporate service, default on delivery contract, utility outage or unfulfilled booking.',
    defaultResolutionTime: '48 - 96 Hours',
    regulatoryRule: 'Federal Competition and Consumer Protection Act (FCCPA)'
  },
  {
    id: 'PRODUCT_ISSUE',
    name: 'Product issue',
    icon: '📄',
    description: 'Defective item, incorrect consignment, disputed commercial invoice, or breach of warranty.',
    defaultResolutionTime: '3 - 5 Business Days',
    regulatoryRule: 'Commercial Restitution & Goods Sale Guarantee Rules'
  },
  {
    id: 'CONSUMER_DISPUTE',
    name: 'Consumer dispute',
    icon: '⚠️',
    description: 'Arbitrary bank fee, breach of terms, unauthorized billing, or contractual dispute.',
    defaultResolutionTime: '3 - 5 Business Days',
    regulatoryRule: 'CBN Consumer Protection Regulations & Arbitration Framework'
  },
  {
    id: 'OTHER',
    name: 'Other',
    icon: '❓',
    description: 'Any other non-standard transaction, specialized dispute, or monetary restitution grievance.',
    defaultResolutionTime: '48 - 96 Hours',
    regulatoryRule: 'Statutory Monetary Restitution Framework'
  }
];

// Production Clean States - Zero Mock Data
export const INITIAL_CLAIMS = [];

export const EXECUTIVE_STATS = {
  totalClaimedValue: '₦0.00',
  totalRecoveredValue: '₦0.00',
  activeDisputesCount: 0,
  recoveredCount: 0,
  successRate: '0%',
  averageResolutionHours: '--',
  cbnComplianceIndex: '100% SLA Adherence'
};

export const MOCK_LAWYER_USER = null;

export const INITIAL_REFERRALS = [];
