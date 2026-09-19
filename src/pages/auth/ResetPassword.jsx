import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import { Eye, EyeOff, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Mail } from 'lucide-react';
import { authService } from '../../services/authService';

export default function ResetPasswordView({
  targetEmail,
  onResetSuccess,
  onNavigateLogin,
  onBackToHome
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [emailInput, setEmailInput] = useState(targetEmail || emailParam || '');
  const [token, setToken] = useState(tokenParam || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (tokenParam && !token) setToken(tokenParam);
    if (emailParam && !emailInput) setEmailInput(emailParam);
  }, [tokenParam, emailParam]);

  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome();
    else navigate('/');
  };

  const handleNavigateLogin = () => {
    if (onNavigateLogin) onNavigateLogin();
    else navigate('/login');
  };

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase;
  const doPasswordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Please enter the reset token received.');
      return;
    }
    if (!emailInput) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 8 characters with numbers and uppercase.');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token: token.trim(),
        email: emailInput.trim(),
        password,
        passwordConfirmation: confirmPassword
      });
      setCompleted(true);
      if (onResetSuccess) onResetSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter the statutory verification token dispatched to your email and set your new credentials."
      onBackToHome={handleBackToHome}
    >
      {!completed ? (
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
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Verification Code */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="reset-token">
              <span>6-Digit Verification Token</span>
              <span className="form-hint">Dispatched to {emailToDisplay}</span>
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
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
                id="reset-token"
                type="text"
                maxLength={6}
                className="form-control"
                style={{
                  paddingLeft: '36px',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  letterSpacing: '0.2em',
                  fontWeight: 700
                }}
                placeholder="492018"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                placeholder="Min. 8 characters"
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
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
              <input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Checklist */}
          <div style={{ fontSize: '11px', color: 'var(--outline)', marginBottom: '22px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ color: hasMinLength ? '#047857' : 'inherit' }}>✓ 8+ Characters</span>
            <span style={{ color: hasUppercase ? '#047857' : 'inherit' }}>✓ Uppercase Letter</span>
            <span style={{ color: hasNumber ? '#047857' : 'inherit' }}>✓ Number (0-9)</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary-gold"
            disabled={loading}
            style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
          >
            {loading ? 'Securing Credentials...' : 'Update Password & Re-authenticate'}
            {!loading && <ArrowRight size={16} />}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
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
              Cancel and return to Sign In
            </button>
          </div>
        </form>
      ) : (
        /* Reset Completed State */
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldCheck size={32} />
          </div>

          <h3 className="title-lg" style={{ color: '#0B2D5B', marginBottom: '8px' }}>
            Credentials Successfully Updated
          </h3>

          <p style={{ fontSize: '13.5px', color: 'var(--on-surface-variant)', lineHeight: '1.5', marginBottom: '28px' }}>
            Your account password has been updated across the Sovereign Recovery Network. You can now sign in with your new credentials.
          </p>

          <button
            className="btn btn-primary-gold"
            onClick={handleNavigateLogin}
            style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
          >
            <span>Sign In to Claimant Portal Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
