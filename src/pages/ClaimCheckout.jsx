import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import { claimService } from '../services';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  AlertCircle,
  Clock,
  Receipt,
  FileCheck,
  Download,
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

// Script loader helper for Paystack and Flutterwave inline popups
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

function formatNaira(num) {
  if (num === null || num === undefined) return '₦0.00';
  const val = Number(num);
  if (isNaN(val)) return '₦0.00';
  return '₦' + val.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ClaimCheckout({ currentUser, onLogout }) {
  const { claimId } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected payment gateway: 'PAYSTACK' | 'FLUTTERWAVE'
  const [gateway, setGateway] = useState('PAYSTACK');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCheckout() {
      try {
        setLoading(true);
        setError(null);
        const data = await claimService.getCheckoutDetails(claimId);
        if (!data) throw new Error(`Dispute dossier #${claimId} was not found.`);
        if (isMounted) {
          setClaim(data);
          if (data.paymentStatus === 'PAID') {
            setPaymentSuccess(true);
            setReceiptData({
              reference: data.paymentReference || 'CONFIRMED',
              gateway: data.paymentGateway || 'Card/Transfer',
              paidAt: data.paidAt || new Date().toISOString(),
              amount: data.serviceFee,
            });
          }
        }
      } catch (err) {
        console.error('Error loading checkout:', err);
        if (isMounted) setError(err.message || 'Failed to retrieve invoice coordinates.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (claimId) fetchCheckout();
    return () => { isMounted = false; };
  }, [claimId]);

  const handleVerifyPayment = async (reference, selectedGateway, transactionId) => {
    try {
      setIsPaying(true);
      const res = await claimService.verifyPayment(claimId, {
        gateway: selectedGateway,
        reference,
        transactionId,
      });

      setPaymentSuccess(true);
      setReceiptData({
        reference,
        gateway: selectedGateway,
        paidAt: new Date().toISOString(),
        amount: claim.serviceFee,
      });
    } catch (err) {
      console.error('Payment verification error:', err);
      alert(err.message || 'Payment completed but verification was delayed. Our team is activating your claim.');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayNow = async () => {
    if (!claim || !claim.serviceFee || claim.serviceFee <= 0) {
      alert('This claim has not been invoiced with a payable service fee yet.');
      return;
    }

    setIsPaying(true);
    try {
      const callbackUrl = `${window.location.origin}/claims/${claimId}/checkout`;
      const initRes = await claimService.initializePayment(claimId, {
        gateway,
        callbackUrl,
      });

      const initData = initRes?.data || {};

      if (gateway === 'PAYSTACK') {
        await loadScript('https://js.paystack.co/v1/inline.js');
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: initData.publicKey || 'pk_test_d3a8e74719bcae91244d5a23d4',
            email: claim.claimant?.email || currentUser?.email || 'claimant@sovereignrecovery.ng',
            amount: Math.round(Number(claim.serviceFee) * 100),
            ref: initData.reference,
            currency: 'NGN',
            metadata: {
              claimCode: claim.code || claimId,
              custom_fields: [
                { display_name: 'Claim ID', variable_name: 'claim_id', value: claim.code || claimId }
              ]
            },
            callback: function (response) {
              handleVerifyPayment(response.reference || initData.reference, 'PAYSTACK');
            },
            onClose: function () {
              setIsPaying(false);
            },
          });
          handler.openIframe();
          return;
        }
      }

      if (gateway === 'FLUTTERWAVE') {
        await loadScript('https://checkout.flutterwave.com/v3.js');
        if (window.FlutterwaveCheckout) {
          window.FlutterwaveCheckout({
            public_key: initData.publicKey || 'FLWPUBK_TEST-e0344d90fbfb1e7c94380b0f7422bdfc-X',
            tx_ref: initData.reference,
            amount: Number(claim.serviceFee),
            currency: 'NGN',
            payment_options: 'card,banktransfer,ussd',
            customer: {
              email: claim.claimant?.email || currentUser?.email || 'claimant@sovereignrecovery.ng',
              phone_number: claim.claimant?.phone || currentUser?.phone || '08000000000',
              name: claim.claimant?.name || currentUser?.name || 'Claimant',
            },
            customizations: {
              title: 'Sovereign Recovery',
              description: `Inquest Service Fee for Claim #${claim.code || claimId}`,
              logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            },
            callback: function (data) {
              handleVerifyPayment(data.tx_ref || initData.reference, 'FLUTTERWAVE', data.transaction_id);
            },
            onclose: function () {
              setIsPaying(false);
            },
          });
          return;
        }
      }

      // If inline script is not loaded or simulation mode
      setTimeout(() => {
        handleVerifyPayment(`SR-SIM-${Date.now()}`, gateway);
      }, 1200);

    } catch (err) {
      console.error('Payment initialization error:', err);
      alert(err.message || 'Failed to initiate secure checkout gateway.');
      setIsPaying(false);
    }
  };

  const copyReference = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <PortalLayout currentUser={currentUser} onLogout={onLogout}>
      <div style={{ padding: '32px 36px 80px', flex: 1, backgroundColor: '#f7f6fc', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

          {/* TOP NAVIGATION BREADCRUMB & SECURITY BADGE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <button
              onClick={() => navigate(`/claims/${claimId}`)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#071a38',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                transition: 'color 0.15s ease'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Claim Dossier #{claim?.code || claimId}</span>
            </button>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={14} />
              <span>256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '60px 24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
              }}
            >
              <RefreshCw size={36} color="#0B2D5B" className="spin-animation" style={{ margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#071a38', margin: '0 0 6px 0' }}>
                Retrieving Dispute Inquest Docket...
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Loading service fee coordinates and payment gateways for claim #{claimId}.
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
              }}
            >
              <AlertCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#991b1b', margin: '0 0 6px 0' }}>
                  Unable to Load Checkout Invoice
                </h3>
                <p style={{ fontSize: '13.5px', color: '#7f1d1d', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {error}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Retry Loading
                  </button>
                  <button
                    onClick={() => navigate(`/claims/${claimId}`)}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Return to Claim Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CHECKOUT VIEW */}
          {!loading && !error && claim && (
            <>
              {/* ========================================================================= */}
              {/* SCREEN 1: PAYMENT CONFIRMED / SETTLEMENT RECEIPT (SUCCESS) */}
              {/* ========================================================================= */}
              {paymentSuccess ? (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    padding: '48px 36px',
                    maxWidth: '680px',
                    margin: '0 auto',
                    textAlign: 'center'
                  }}
                >
                  {/* Hero Success Icon */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      border: '6px solid #d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px auto',
                      color: '#059669',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <CheckCircle2 size={44} />
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '12px'
                    }}
                  >
                    Service Fee Settled & Inquest Activated
                  </span>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: '#071a38',
                      margin: '0 0 8px 0',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    Payment Confirmed!
                  </h1>

                  <p style={{ fontSize: '14px', color: '#64748b', margin: '0 auto 28px auto', maxWidth: '480px', lineHeight: 1.6 }}>
                    Your legal & clearing inquest service fee of{' '}
                    <strong style={{ color: '#071a38' }}>{formatNaira(receiptData?.amount || claim.serviceFee)}</strong> has been
                    successfully received via <strong style={{ color: '#0284c7' }}>{receiptData?.gateway || gateway}</strong>.
                  </p>

                  {/* Official Receipt Card */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '24px',
                      textAlign: 'left',
                      marginBottom: '28px',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Receipt size={16} color="#0B2D5B" />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#071a38', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Official Restitution Inquest Receipt
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(receiptData?.paidAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      {/* Row 1: Claim Code */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Claim Reference:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0B2D5B', fontSize: '14px' }}>
                          {claim.code || claimId}
                        </span>
                      </div>

                      {/* Row 2: Transaction Reference with Copy */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Transaction Reference:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>
                            {receiptData?.reference || 'N/A'}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyReference(receiptData?.reference)}
                            title="Copy reference"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedRef ? '#059669' : '#64748b',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {copiedRef ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Dispute Title */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Dispute Under Recovery:</span>
                        <span style={{ fontWeight: 700, color: '#071a38', textAlign: 'right', maxWidth: '320px' }}>
                          {claim.title}
                        </span>
                      </div>

                      {/* Row 4: Payment Gateway */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Payment Gateway:</span>
                        <span
                          style={{
                            fontWeight: 800,
                            color: receiptData?.gateway === 'PAYSTACK' ? '#0284c7' : '#d97706',
                            backgroundColor: receiptData?.gateway === 'PAYSTACK' ? '#e0f2fe' : '#fef3c7',
                            padding: '2px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {receiptData?.gateway || gateway}
                        </span>
                      </div>

                      {/* Row 5: Total Settled Amount */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#071a38', fontSize: '14px' }}>Total Settled:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#059669', fontSize: '20px' }}>
                          {formatNaira(receiptData?.amount || claim.serviceFee)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps Notification Box */}
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      borderRadius: '14px',
                      border: '1px solid #bfdbfe',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      textAlign: 'left',
                      marginBottom: '32px'
                    }}
                  >
                    <FileCheck size={22} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                      <strong style={{ color: '#1e40af' }}>Next Operational Steps:</strong>
                      <br />
                      An electronic Pre-Action Demand Notice has been queued for immediate dispatch to the clearing desk of{' '}
                      <strong>{claim.claimAgainst}</strong>. The administrative case triage officer has been assigned to coordinate
                      formal settlement tracking.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <Link
                      to={`/claims/${claimId}`}
                      style={{
                        backgroundColor: '#0B2D5B',
                        color: '#ffffff',
                        padding: '13px 28px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(11, 45, 91, 0.25)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <span>View Active Claim Dossier</span>
                      <ChevronRight size={16} />
                    </Link>

                    <Link
                      to="/dashboard"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '13px 24px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>Return to Dashboard</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* SCREEN 2: CHECKOUT FORM & INVOICE REVIEW (UNPAID) */
                /* ========================================================================= */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
                  
                  {/* LEFT COLUMN: SCOPE & GATEWAY SELECTION */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Scope Determination Header Card */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '18px',
                        padding: '28px 32px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0284c7'
                          }}
                        >
                          <Sparkles size={22} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#071a38', margin: 0 }}>
                            Dispute Review & Scope Determination
                          </h2>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                            Case approved by Sovereign Recovery Adjudication Council
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          padding: '18px 20px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Dispute Reference:</span>
                          <strong style={{ fontFamily: 'monospace', color: '#0B2D5B', fontSize: '14px' }}>
                            {claim.code || claimId}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Dispute Against:</span>
                          <strong style={{ color: '#071a38' }}>{claim.claimAgainst}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Principal Disputed Sum:</span>
                          <strong style={{ color: '#071a38', fontFamily: 'monospace', fontSize: '14px' }}>
                            {formatNaira(claim.amount)}
                          </strong>
                        </div>
                      </div>

                      {/* Review Note from Admin */}
                      {claim.serviceFeeNote && (
                        <div
                          style={{
                            marginTop: '16px',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a'
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                            Reviewing Officer's Scope Note
                          </span>
                          <p style={{ fontSize: '13px', color: '#78350f', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                            "{claim.serviceFeeNote}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Gateway Selector Card */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '18px',
                        padding: '28px 32px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <CreditCard size={20} color="#0B2D5B" />
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#071a38', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Select Payment Provider
                        </h3>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        {/* Paystack Option */}
                        <div
                          onClick={() => setGateway('PAYSTACK')}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '14px',
                            padding: '18px',
                            border: gateway === 'PAYSTACK' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            backgroundColor: gateway === 'PAYSTACK' ? '#f0f9ff' : '#ffffff',
                            boxShadow: gateway === 'PAYSTACK' ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '17px', fontWeight: 900, color: '#071a38', letterSpacing: '-0.02em' }}>
                              Pay<span style={{ color: '#0284c7' }}>stack</span>
                            </div>
                            <input
                              type="radio"
                              name="gateway"
                              checked={gateway === 'PAYSTACK'}
                              onChange={() => setGateway('PAYSTACK')}
                              style={{ width: '18px', height: '18px', accentColor: '#0284c7', cursor: 'pointer' }}
                            />
                          </div>

                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            Debit/Credit Cards, Bank Transfer, USSD, Apple Pay. Verified by Paystack.
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <span>Instant Confirmation</span>
                          </div>
                        </div>

                        {/* Flutterwave Option */}
                        <div
                          onClick={() => setGateway('FLUTTERWAVE')}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '14px',
                            padding: '18px',
                            border: gateway === 'FLUTTERWAVE' ? '2px solid #d97706' : '1px solid #cbd5e1',
                            backgroundColor: gateway === 'FLUTTERWAVE' ? '#fffbeb' : '#ffffff',
                            boxShadow: gateway === 'FLUTTERWAVE' ? '0 4px 12px rgba(217, 119, 6, 0.12)' : 'none',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '17px', fontWeight: 900, color: '#071a38', letterSpacing: '-0.02em' }}>
                              Flutter<span style={{ color: '#d97706' }}>wave</span>
                            </div>
                            <input
                              type="radio"
                              name="gateway"
                              checked={gateway === 'FLUTTERWAVE'}
                              onChange={() => setGateway('FLUTTERWAVE')}
                              style={{ width: '18px', height: '18px', accentColor: '#d97706', cursor: 'pointer' }}
                            />
                          </div>

                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            Debit/Credit Cards, Direct Bank Transfer, Barter, USSD. Verified by Flutterwave.
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <span>Instant Confirmation</span>
                          </div>
                        </div>
                      </div>

                      {/* Claimant Contact Details */}
                      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                        <span>Official receipt will be dispatched to:</span>
                        <strong style={{ color: '#071a38' }}>{claim.claimant?.email || currentUser?.email || 'N/A'}</strong>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: INVOICED BREAKDOWN & PAY ACTION */}
                  <div style={{ minWidth: '320px' }}>
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                        padding: '28px',
                        position: 'sticky',
                        top: '24px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Receipt size={18} color="#0B2D5B" />
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#071a38', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Invoice Breakdown
                        </h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Forensic Inquest & Dispute Docket:</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#071a38' }}>
                            {formatNaira(claim.serviceFee)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569' }}>
                          <span>Statutory Demand Notice Service:</span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                            INCLUDED
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569' }}>
                          <span>Clearing Desk Mediation Filing:</span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                            INCLUDED
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569' }}>
                          <span>CBN SLA Arbitration Tracking:</span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                            INCLUDED
                          </span>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#071a38' }}>Total Payable:</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 900, color: '#0B2D5B' }}>
                            {formatNaira(claim.serviceFee)}
                          </span>
                        </div>
                      </div>

                      {/* Pay Button */}
                      <div style={{ marginTop: '24px' }}>
                        <button
                          onClick={handlePayNow}
                          disabled={isPaying || !claim.serviceFee || claim.serviceFee <= 0}
                          style={{
                            width: '100%',
                            backgroundColor: gateway === 'PAYSTACK' ? '#0284c7' : '#d97706',
                            color: '#ffffff',
                            border: 'none',
                            padding: '14px 20px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 800,
                            cursor: isPaying || !claim.serviceFee ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: gateway === 'PAYSTACK' ? '0 4px 15px rgba(2, 132, 199, 0.3)' : '0 4px 15px rgba(217, 119, 6, 0.3)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isPaying ? (
                            <>
                              <RefreshCw size={18} className="spin-animation" />
                              <span>Processing via {gateway}...</span>
                            </>
                          ) : (
                            <>
                              <Lock size={16} />
                              <span>Pay {formatNaira(claim.serviceFee)} with {gateway === 'PAYSTACK' ? 'Paystack' : 'Flutterwave'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                          By confirming payment, you authorize Sovereign Recovery to serve legal demand notices and conduct interbank inquest on your behalf.
                        </p>
                      </div>

                      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                          <Lock size={12} /> SSL 256-Bit
                        </span>
                        <span>&bull;</span>
                        <span>NDPR Compliant</span>
                        <span>&bull;</span>
                        <span>CBN Regulated</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>
      </div>
    </PortalLayout>
  );
}
