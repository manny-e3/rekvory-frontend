import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';

export default function ForgotPasswordView({
  onNavigateResetPassword,
  onNavigateLogin,
  onBackToHome
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome();
    else navigate('/');
  };

  const handleNavigateLogin = () => {
    if (onNavigateLogin) onNavigateLogin();
    else navigate('/login');
  };

  const handleNavigateResetPassword = () => {
    if (onNavigateResetPassword) onNavigateResetPassword(email);
    else navigate(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setResponseMessage(
        res?.message || 'If an account exists for this email, password reset instructions have been sent.'
      );
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to process reset request. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Account Credentials"
      subtitle="Verify your identity to regain access to your dispute dossiers and recovery authorizations."
      onBackToHome={handleBackToHome}
    >
      {!sent ? (
        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--rounded-md)',
                color: '#b91c1c',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <p style={{ fontSize: '13.5px', color: 'var(--neutral-charcoal)', lineHeight: '1.5', marginBottom: '20px' }}>
            Enter your registered official email address below. We will dispatch a 6-digit statutory security code and authorization link.
          </p>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="forgot-email">
              Registered Email Address
            </label>
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
                id="forgot-email"
                type="email"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="e.g. claimant@domain.ng or counsel@chambers.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-gold"
            disabled={loading}
            style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
          >
            {loading ? 'Dispatching Token...' : 'Dispatch Reset Authorization Code'}
            {!loading && <ArrowRight size={16} />}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
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
        </form>
      ) : (
        /* Success State */
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CheckCircle2 size={30} />
          </div>

          <h3 className="title-lg" style={{ color: '#0B2D5B', marginBottom: '8px' }}>
            Security Code Dispatched
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: '1.5', marginBottom: '24px' }}>
            A 6-digit statutory reset authorization code has been dispatched to <strong>{email}</strong>. The token remains valid for 15 minutes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-primary-gold"
              onClick={handleNavigateResetPassword}
              style={{ width: '100%', height: '44px' }}
            >
              <span>Enter 6-Digit Code & Reset Password</span>
              <KeyRound size={16} />
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => setSent(false)}
              style={{ fontSize: '13px' }}
            >
              Didn't receive email? Re-send Code
            </button>
          </div>

          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <button
              type="button"
              onClick={handleNavigateLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2F7BFF',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
