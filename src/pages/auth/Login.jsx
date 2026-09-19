import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

export default function LoginView({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
  onBackToHome
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome();
    else navigate('/');
  };

  const handleNavigateRegister = () => {
    if (onNavigateRegister) onNavigateRegister();
    else navigate('/register');
  };

  const handleNavigateForgotPassword = () => {
    if (onNavigateForgotPassword) onNavigateForgotPassword();
    else navigate('/forgot-password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsUnverified(false);
    setResendSuccess('');

    if (!email || !password) {
      setErrorMessage('Please enter both your registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      const user = res?.data?.user;

      if (onLoginSuccess) {
        onLoginSuccess(user || { name: 'Claimant User', email, type: 'Consumer' });
      }

      const fromPath = location.state?.from?.pathname;
      if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
        navigate(fromPath);
      } else if (user?.role === 'LAWYER' || user?.type === 'Lawyer') {
        navigate('/lawyer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.status === 403 || err.code === 'FORBIDDEN') {
        setIsUnverified(true);
        setErrorMessage(
          err.message || 'Please verify your email address before logging in. Check your inbox for the verification link.'
        );
      } else if (err.status === 401 || err.code === 'UNAUTHORIZED' || err.code === 'INVALID_CREDENTIALS') {
        setErrorMessage('Invalid email address or password. Please verify your credentials and try again.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    setResendSuccess('');
    try {
      const res = await authService.resendVerification(email.trim());
      setResendSuccess(res?.message || 'A fresh verification link has been dispatched to your email.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification link.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Portal Sign In"
      subtitle="Access your active dispute dossiers, track recovery milestones, or review legal briefs."
      onBackToHome={handleBackToHome}
    >
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div
            style={{
              padding: '14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--rounded-md)',
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: isUnverified ? '10px' : '0' }}>
              <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>

            {isUnverified && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={12} className={resending ? 'spin' : ''} />
                <span>{resending ? 'Dispatching Link...' : 'Resend Verification Email'}</span>
              </button>
            )}
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
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle size={16} color="#10b981" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {/* Email Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            <span>Email Address</span>
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
              id="login-email"
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

        {/* Password */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
              Password
            </label>
            <button
              type="button"
              onClick={handleNavigateForgotPassword}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2F7BFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Forgot password?
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock
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
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              style={{ paddingLeft: '36px', paddingRight: '40px' }}
              placeholder="Enter your confidential password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--outline)',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--neutral-charcoal)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#0B2D5B' }}
            />
            <span>Remember session on this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary-gold"
          disabled={loading}
          style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
        >
          {loading ? 'Authenticating Credentials...' : 'Sign In to Portal'}
          {!loading && <ArrowRight size={16} />}
        </button>

        {/* Register Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--outline)' }}>
          Don't have a registered account yet?{' '}
          <button
            type="button"
            onClick={handleNavigateRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2F7BFF',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Create an Account (Individual or Lawyer)
          </button>
        </div>

      </form>
    </AuthLayout>
  );
}
