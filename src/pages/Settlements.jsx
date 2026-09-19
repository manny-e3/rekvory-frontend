import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { ShieldCheck, Download, FileText, CheckCircle2, ArrowUpRight, DollarSign } from 'lucide-react';
import { settlementService } from '../services';

export default function SettlementsView({
  claims = [],
  currentUser,
  onLogout,
  onSelectClaim
}) {
  const navigate = useNavigate();
  const [apiSettlements, setApiSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSettlements = async () => {
      setIsLoading(true);
      try {
        const res = await settlementService.getSettlements();
        if (isMounted && res?.data) {
          setApiSettlements(res.data);
        }
      } catch (err) {
        console.warn('Failed to load settlements:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSettlements();
    return () => { isMounted = false; };
  }, [claims]);

  const recoveredClaims = claims.filter((c) => c.status === 'success');

  const callerSettledItems = apiSettlements.map((c) => ({
    id: `REC-${(c.id || '0001').replace('RK-', '2026-')}`,
    caseId: c.id,
    claimant: c.claimant || currentUser?.name || 'Verified Claimant',
    amount: c.recoveredAmountFormatted || c.amountFormatted || `₦${parseFloat(c.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    bank: c.originBank || 'Originating Bank',
    account: c.originAccount || 'NUBAN',
    date: c.transactionDate || 'Recently',
    approvalAuth: `Demand Notice #${c.demandNoticeId || 'DN-2026-00042'} / NIBSS Clearing`,
    channel: c.categoryName || 'Interbank Dispute Resolution'
  }));

  const allLedgerItems = callerSettledItems;

  const totalRecoveredSum = apiSettlements.reduce((sum, item) => sum + (parseFloat(item.recoveredAmount || item.amount || 0)), 0);
  const totalRecoveredFormatted = `₦${totalRecoveredSum.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  const settledCount = callerSettledItems.length;

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '28px 36px 60px', flex: 1, backgroundColor: '#f7f6fc' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <span className="label-sm" style={{ color: 'var(--trust-blue)', display: 'block', marginBottom: '4px' }}>
              SECURE FINANCIAL RESTITUTION REPOSITORY
            </span>
            <h1 className="headline-lg" style={{ color: 'var(--primary-navy)' }}>
              Settlement & Restitution Vault
            </h1>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Immutable repository of executed restitution disbursements, discharge releases, and audited bank receipts.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px',
            marginBottom: '32px'
          }}
        >
          <MetricCard
            variant="authority"
            title="Total Disbursed Restitutions"
            value={totalRecoveredFormatted}
            subtitle="100% principal restitution without statutory deductions"
            icon={ShieldCheck}
          />
          <MetricCard
            title="Total Restitution Vouchers"
            value={settledCount.toString()}
            subtitle="Formal discharge certificates executed"
            icon={FileText}
            accentColor="#10B981"
            badgeText="Audited"
            badgeStatus="success"
          />
          <MetricCard
            title="Average Restitution Turnaround"
            value={settledCount > 0 ? 'Under 48 Hours' : '--'}
            subtitle="From dispute lodgement to bank credit"
            icon={CheckCircle2}
            accentColor="#E68000"
          />
        </div>

        {/* Restitution Ledger Table */}
        <div className="surface-card" style={{ padding: '0', overflow: 'hidden' }}>
          
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--neutral-border)' }}>
            <h2 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
              Executed Restitution Discharges & Receipts
            </h2>
            <p className="body-sm" style={{ color: 'var(--outline)', marginTop: '2px' }}>
              All disbursements verified via NIBSS clearing vouchers and bank credit advices.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--neutral-border)' }}>
                  <th style={{ padding: '14px 20px', fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--outline)' }}>
                    SETTLEMENT VOUCHER
                  </th>
                  <th style={{ padding: '14px 20px', fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--outline)' }}>
                    BENEFICIARY CLAIMANT & BANK
                  </th>
                  <th style={{ padding: '14px 20px', fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--outline)' }}>
                    RECOVERED SUM
                  </th>
                  <th style={{ padding: '14px 20px', fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--outline)' }}>
                    AUTHORIZATION DESK
                  </th>
                  <th style={{ padding: '14px 20px', fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--outline)' }}>
                    STATUS
                  </th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--outline)' }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {allLedgerItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--outline)' }}>
                      No executed restitution disbursements or discharge records found.
                    </td>
                  </tr>
                ) : (
                  allLedgerItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--neutral-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-low)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="tabular-nums" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary-navy)' }}>
                          {item.id}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px' }}>
                          Case Ref:{' '}
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectClaim) onSelectClaim(item.caseId);
                              navigate(`/claims/${item.caseId}`);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--trust-blue)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              textDecoration: 'underline',
                              padding: 0
                            }}
                          >
                            {item.caseId}
                          </button>{' '}
                          • {item.date}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--neutral-charcoal)' }}>
                          {item.claimant}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                          {item.bank} ({item.account})
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span className="tabular-nums" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: '#047857' }}>
                        {item.amount}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--neutral-charcoal)' }}>
                        {item.approvalAuth}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <StatusBadge status="success" label="Restitution Paid" />
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary-blue btn-sm"
                        onClick={() => alert(`Downloading Official Restitution Receipt & Discharge Certificate for Voucher ${item.id}`)}
                      >
                        <Download size={14} />
                        <span>Receipt (PDF)</span>
                      </button>
                    </td>
                  </tr>
                )))
                }
              </tbody>
            </table>
          </div>

        </div>
        </div>
      </div>
    </PortalLayout>
  );
}
