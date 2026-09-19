import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

export default function VerifyEmailView({ onBackToHome, onNavigateLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome();
    else navigate('/');
  };

  const handleNavigateLogin = () => {
    if (onNavigateLogin) onNavigateLogin();
    else navigate('/login');
  };

  useEffect(() => {
    if (token && emailParam) {
      handleAutoVerify();
    } else if (!token) {
      setErrorMessage('No verification token provided in URL. Please click the exact link sent to your email.');
    }
  }, [token, emailParam]);

  const handleAutoVerify = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.verifyEmail({ token, email: emailParam });
      setVerified(true);
    } catch (err) {
      setErrorMessage(err.message || 'Verification token is invalid, expired, or has already been used.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setResending(true);
    setResendSuccess('');
    try {
      const res = await authService.resendVerification(resendEmail);
      setResendSuccess(res?.message || 'If an account exists for this email and is not yet verified, a new verification link has been sent.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend verification link. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Email Address Verification"
      subtitle="Confirm your identity to activate access to your dispute dossiers and arbitration portals."
      onBackToHome={handleBackToHome}
    >
      <div>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid rgba(47, 123, 255, 0.15)',
                borderTopColor: '#2F7BFF',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}
            />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2D5B', marginBottom: '8px' }}>
              Validating Security Token...
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--outline)' }}>
              Verifying token credentials with the Sovereign Identity Registry.
            </p>
          </div>
        )}

        {/* Verified Success State */}
        {!loading && verified && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1.5px solid #a7f3d0'
              }}
            >
              <CheckCircle2 size={36} color="#10b981" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0B2D5B', marginBottom: '10px' }}>
              Email Verified Successfully
            </h3>

            <p style={{ fontSize: '13.5px', color: 'var(--neutral-charcoal)', lineHeight: '1.6', marginBottom: '28px' }}>
              Your email address <strong style={{ color: '#0B2D5B' }}>{emailParam}</strong> has been officially confirmed. You can now access your active dispute dossiers and recovery authorizations.
            </p>

            <button
              type="button"
              className="btn btn-primary-gold"
              onClick={handleNavigateLogin}
              style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
            >
              <span>Sign In to Your Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Error / Resend State */}
        {!loading && !verified && (
          <div>
            {errorMessage && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--rounded-md)',
                  color: '#b91c1c',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {resendSuccess && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--rounded-md)',
                  color: '#047857',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{resendSuccess}</span>
              </div>
            )}

            <div
              style={{
                padding: '18px',
                backgroundColor: 'var(--surface-container-low)',
                borderRadius: '12px',
                border: '1px solid var(--neutral-border)',
                marginBottom: '24px'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0B2D5B', marginBottom: '6px' }}>
                Need a New Verification Link?
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--outline)', lineHeight: '1.5', marginBottom: '14px' }}>
                Verification links expire after 24 hours. Enter your registered email address below to dispatch a fresh single-use verification link.
              </p>

              <form onSubmit={handleResend}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--outline)'
                      }}
                    />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: '36px' }}
                      placeholder="e.g. claimant@domain.ng"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-gold"
                  disabled={resending}
                  style={{ width: '100%', height: '42px', fontSize: '13px', fontWeight: 700 }}
                >
                  {resending ? 'Sending Verification Link...' : 'Resend Verification Email'}
                  {!resending && <RefreshCw size={14} />}
                </button>
              </form>
            </div>

            <div style={{ textAlign: 'center', fontSize: '13px' }}>
              <button
                type="button"
                onClick={handleNavigateLogin}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2F7BFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
}
