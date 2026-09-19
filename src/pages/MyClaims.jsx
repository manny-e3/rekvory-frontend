import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import { claimService } from '../services';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  ArrowRight,
  Download,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Receipt,
  Cpu,
  ShoppingBag,
  Landmark,
  ArrowUpRight,
  Copy,
  Check,
  Calendar,
  X
} from 'lucide-react';
import { DISPUTE_CATEGORIES } from '../utils';

export default function MyClaimsView({
  claims = [],
  currentUser,
  onLogout,
  onOpenSettlement,
  onOpenDemandNotice,
  onOpenEvidenceModal
}) {
  const navigate = useNavigate();

  // Search, filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all'); // 'all' | 'warning' | 'info' | 'error' | 'success'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount-high' | 'amount-low'
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [liveClaims, setLiveClaims] = useState(claims);
  const [kpiSummary, setKpiSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Live Querying via GET /claims with search debouncing
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = {
          status: selectedStatusTab,
          sortBy,
          search: searchQuery.trim() || undefined
        };
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        const res = await claimService.getClaims(params);
        if (!isCancelled && res?.data) {
          setLiveClaims(res.data);
          if (res?.meta?.summary) {
            setKpiSummary(res.meta.summary);
          }
        }
      } catch (err) {
        console.warn('Live claims query failed:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedStatusTab, selectedCategory, sortBy, claims]);

  // Status counts from meta.summary or calculated from local dataset
  const counts = useMemo(() => {
    if (kpiSummary) {
      const resolvedCount = (kpiSummary.totalClaims || claims.length) -
        ((kpiSummary.underReview || 0) + (kpiSummary.awaitingCustomer || 0) + (kpiSummary.escalated || 0));
      return {
        all: kpiSummary.totalClaims || claims.length,
        warning: kpiSummary.underReview || 0,
        info: kpiSummary.awaitingCustomer || 0,
        error: kpiSummary.escalated || 0,
        success: Math.max(0, resolvedCount)
      };
    }
    return {
      all: claims.length,
      warning: claims.filter((c) => c.status === 'warning' || (c.statusLabel || '').toLowerCase().includes('under review')).length,
      info: claims.filter((c) => c.status === 'info' || (c.statusLabel || '').toLowerCase().includes('awaiting')).length,
      error: claims.filter((c) => c.status === 'error' || (c.statusLabel || '').toLowerCase().includes('escalated')).length,
      success: claims.filter((c) => c.status === 'success' || (c.statusLabel || '').toLowerCase().includes('resolved') || (c.statusLabel || '').toLowerCase().includes('recovered')).length
    };
  }, [claims, kpiSummary]);

  // Total recovered sum from meta.summary
  const recoveredAmountFormatted = useMemo(() => {
    if (kpiSummary && kpiSummary.recoveredAmount !== undefined) {
      return `₦${kpiSummary.recoveredAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    }
    const total = claims
      .filter((c) => c.status === 'success' || (c.statusLabel || '').toLowerCase().includes('resolved') || (c.statusLabel || '').toLowerCase().includes('recovered'))
      .reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);
    return `₦${total > 0 ? total.toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '485,000.00'}`;
  }, [claims, kpiSummary]);

  // Claims list provided by live query
  const filteredClaims = liveClaims && liveClaims.length > 0 ? liveClaims : claims;

  // Icon mapping
  const getDisputeIcon = (claim) => {
    const cat = (claim.category || '').toUpperCase();
    if (cat.includes('POS') || claim.iconType === 'receipt') return Receipt;
    if (cat.includes('NIP') || cat.includes('TRANSFER')) return Building;
    if (cat.includes('MERCHANT') || cat.includes('REFUND')) return ShoppingBag;
    if (cat.includes('GATEWAY')) return Cpu;
    return Landmark;
  };

  // Render Status Badge matching Dashboard design
  const renderStatusBadge = (status, label) => {
    const s = (status || '').toLowerCase();
    const l = (label || '').toLowerCase();

    if (s === 'warning' || l.includes('under review')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fff7ed',
            color: '#c2410c',
            border: '1px solid #ffedd5',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
          <span>UNDER REVIEW</span>
        </span>
      );
    }

    if (s === 'success' || l.includes('resolved') || l.includes('recovered')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#faf5ff',
            color: '#7e22ce',
            border: '1px solid #f3e8ff',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9333ea' }} />
          <span>RESOLVED</span>
        </span>
      );
    }

    if (s === 'info' || l.includes('awaiting')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #dbeafe',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
          <span>AWAITING CUSTOMER</span>
        </span>
      );
    }

    if (s === 'error' || l.includes('escalated')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fee2e2',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
          <span>ESCALATED</span>
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#f8fafc',
          color: '#475569',
          border: '1px solid #e2e8f0',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}
      >
        <span>{label || 'REGISTERED'}</span>
      </span>
    );
  };

  const handleExportCsv = () => {
    const headers = ['Claim ID', 'Title', 'Category', 'Origin Bank', 'Beneficiary Bank', 'Amount (NGN)', 'Status', 'SLA Remaining', 'Date Lodged'];
    const rows = filteredClaims.map((c) => [
      c.id,
      `"${c.title || ''}"`,
      `"${c.categoryName || c.category || ''}"`,
      `"${c.originBank || ''}"`,
      `"${c.beneficiaryBank || ''}"`,
      c.amount || 0,
      c.statusLabel || c.status || '',
      c.slaTimeRemaining || '',
      `"${c.transactionDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sovereign_Recovery_Claims_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '32px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Top Title & Header Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '28px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#f97316',
                    display: 'inline-block'
                  }}
                />
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#475569',
                    textTransform: 'uppercase'
                  }}
                >
                  CLAIMANT OPERATIONS • DISPUTE MANAGEMENT
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <h1
                  style={{
                    fontSize: '34px',
                    fontWeight: 800,
                    color: '#071a38',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  My Claims
                </h1>
                <span
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '999px'
                  }}
                >
                  {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#64748b', margin: '6px 0 0 0' }}>
                Comprehensive tracking, evidence management, and restitution status for all your interbank disputes.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportCsv}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Download size={15} />
                <span>Export Ledger (CSV)</span>
              </button>

              <button
                onClick={() => navigate('/new-claim')}
                style={{
                  backgroundColor: '#ff8c00',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 140, 0, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <PlusCircle size={16} />
                <span>Lodge New Claim</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}
          >
            {/* Card 1: Total Claims */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                  TOTAL CLAIMS LODGED
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#071a38', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
                  {counts.all}
                </div>
                <div style={{ fontSize: '11.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span>●</span>
                  <span>100% statutory tracking active</span>
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#071a38',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={20} />
              </div>
            </div>

            {/* Card 2: Under Inquest */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                  UNDER REVIEW / INQUEST
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
                  {counts.warning}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Dispatched to bank clearing desks
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={20} />
              </div>
            </div>

            {/* Card 3: Awaiting Action */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                  ACTION REQUIRED
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
                  {counts.info}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Awaiting evidence / acknowledgment
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertCircle size={20} />
              </div>
            </div>

            {/* Card 4: Restitution Recovered */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                  RESTITUTION RECOVERED
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#8f4e00', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
                  {recoveredAmountFormatted}
                </div>
                <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '2px' }}>
                  Disbursed directly to claimant accounts
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          {/* Main Card: Claims Data Table with Filter Controls */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden'
            }}
          >
            {/* Filter Header & Search Bar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              
              {/* Row 1: Status Tabs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '16px'
                }}
              >
                {[
                  { id: 'all', label: 'All Claims', count: counts.all },
                  { id: 'warning', label: 'Under Review', count: counts.warning, dot: '#ea580c' },
                  { id: 'info', label: 'Awaiting Customer', count: counts.info, dot: '#2563eb' },
                  { id: 'error', label: 'Escalated', count: counts.error, dot: '#dc2626' },
                  { id: 'success', label: 'Resolved / Recovered', count: counts.success, dot: '#9333ea' }
                ].map((tab) => {
                  const isActive = selectedStatusTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedStatusTab(tab.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '999px',
                        border: isActive ? '1px solid #071a38' : '1px solid #e2e8f0',
                        backgroundColor: isActive ? '#071a38' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.dot && !isActive && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: tab.dot }} />
                      )}
                      <span>{tab.label}</span>
                      <span
                        style={{
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '999px'
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Search Input + Category Filter + Sort Dropdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(240px, 1.6fr) minmax(180px, 1fr) minmax(160px, 0.8fr)',
                  gap: '12px'
                }}
                className="claims-search-grid"
              >
                {/* Search Box */}
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Case ID (#RK-...), bank, merchant, or session..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Dispute Categories</option>
                    {DISPUTE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="amount-high">Amount: High to Low</option>
                    <option value="amount-low">Amount: Low to High</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Claims Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafbfe', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      CASE / DISPUTE
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      INSTITUTION ROUTE
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      RESTITUTION SUM
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      STATUS
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      SLA REMAINING
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClaims.length > 0 ? (
                    filteredClaims.map((claim, idx) => {
                      const Icon = getDisputeIcon(claim);
                      const isCopied = copiedId === claim.id;

                      return (
                        <tr
                          key={claim.id}
                          onClick={() => {
                            navigate(`/claims/${claim.id}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            borderBottom: idx === filteredClaims.length - 1 ? 'none' : '1px solid #f1f5f9',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {/* Col 1: Case / Dispute */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '10px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#071a38',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Icon size={18} />
                              </div>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontWeight: 800,
                                      fontSize: '13px',
                                      color: '#2563eb'
                                    }}
                                  >
                                    #{claim.id}
                                  </span>

                                  <button
                                    onClick={(e) => handleCopyId(e, claim.id)}
                                    title="Copy Case ID"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: isCopied ? '#10b981' : '#94a3b8',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      display: 'inline-flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                  </button>
                                </div>

                                <div style={{ fontWeight: 700, color: '#071a38', fontSize: '13.5px', marginTop: '2px' }}>
                                  {claim.title}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                  {claim.categoryName || claim.category} • {claim.transactionDate}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Institution Route */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                                <span>{claim.originBank}</span>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>➔</span>
                                <span>{claim.beneficiaryBank}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                {claim.sessionId ? `Session: ${claim.sessionId.slice(0, 16)}...` : `RRN: ${claim.rrn || 'N/A'}`}
                              </div>
                            </div>
                          </td>

                          {/* Col 3: Restitution Sum */}
                          <td style={{ padding: '16px 20px' }}>
                            <div
                              style={{
                                fontWeight: 800,
                                color: '#071a38',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '14.5px'
                              }}
                            >
                              ₦{claim.amountFormatted || (parseFloat(claim.amount) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Full Restitution
                            </div>
                          </td>

                          {/* Col 4: Status */}
                          <td style={{ padding: '16px 20px' }}>
                            {renderStatusBadge(claim.status, claim.statusLabel)}
                          </td>

                          {/* Col 5: SLA Remaining */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                              <Clock size={13} color="#94a3b8" />
                              <span>{claim.slaTimeRemaining || 'Active Inquest'}</span>
                            </div>
                          </td>

                          {/* Col 6: Action */}
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/claims/${claim.id}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                color: '#071a38',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#071a38';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                e.currentTarget.style.color = '#071a38';
                              }}
                            >
                              <span>Dossier</span>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                          }}
                        >
                          <Search size={22} />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                          No claims match your filter criteria
                        </h4>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                          Try clearing your search query or selecting a different status filter tab.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedStatusTab('all');
                            setSelectedCategory('all');
                          }}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#2563eb',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Reset All Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div
              style={{
                padding: '14px 24px',
                backgroundColor: '#fafbfe',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                color: '#64748b'
              }}
            >
              <div>
                Showing <strong>{filteredClaims.length}</strong> of <strong>{claims.length}</strong> registered restitution claims
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#10b981" />
                <span>Central Bank of Nigeria (CBN) Restitution SLA Timers Active</span>
              </div>
            </div>

          </div>

          {/* Institutional Statutory Guarantee Banner */}
          <div
            style={{
              marginTop: '28px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Statutory Restitution Inquest Enforcement
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  All claims listed are served with binding legal demand notices to respondent clearing banks pursuant to CBN Consumer Protection Regulations.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/compliance')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span>View Regulatory Directives</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
