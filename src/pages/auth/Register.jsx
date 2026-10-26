import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Scale,
  Award,
  MailCheck,
  RefreshCw
} from 'lucide-react';
import { authService } from '../../services/authService';

export default function RegisterView({
  onRegisterSuccess,
  onNavigateLogin,
  onBackToHome
}) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('individual'); // 'individual' | 'lawyer'

  // Form Fields - strictly full name, email, phone, password, confirm password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Check Email Screen State (Post-Registration Success)
  const [successInfo, setSuccessInfo] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome();
    else navigate('/');
  };

  const handleNavigateLogin = () => {
    if (onNavigateLogin) onNavigateLogin();
    else navigate('/login');
  };

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase;
  const doPasswordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (!isPasswordValid) {
      setErrorMsg('Please ensure your password meets all statutory security criteria (8+ characters, uppercase, number).');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }
    if (!termsAgreed) {
      setErrorMsg(
        accountType === 'individual'
          ? 'You must agree to the Statutory Dispute Undertaking and NDPR terms.'
          : 'You must certify your Nigerian Bar standing and RPC compliance.'
      );
      return;
    }

    setLoading(true);

    try {
      let payload;
      if (accountType === 'individual') {
        payload = {
          accountType: 'Claimant',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          passwordConfirmation: confirmPassword,
          type: 'Consumer',
          primaryBankCode: '057' // Default commercial settlement bank clearing code
        };
      } else {
        payload = {
          accountType: 'Lawyer',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          passwordConfirmation: confirmPassword,
          nbaEnrollmentNumber: 'NBA/ENR/PENDING',
          callToBarYear: new Date().getFullYear()
        };
      }

      const res = await authService.register(payload);

      setSuccessInfo({
        accountType: payload.accountType,
        name: payload.name,
        email: payload.email,
        message: res?.message || 'Account created successfully. Please check your email to verify your address before logging in.',
        isLawyer: payload.accountType === 'Lawyer'
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(res?.data?.user || { name: payload.name, email: payload.email, type: payload.accountType });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please review your details and try again.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendFromSuccess = async () => {
    if (!successInfo?.email) return;
    setResending(true);
    setResendNotice('');
    try {
      const res = await authService.resendVerification(successInfo.email);
      setResendNotice(res?.message || 'A fresh verification link has been dispatched to your email.');
    } catch (err) {
      setResendNotice(err.message || 'Failed to dispatch verification email. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  // Dynamic Sidebar configuration
  const isIndividual = accountType === 'individual';

  const sidebarBadge = isIndividual ? (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(230, 128, 0, 0.15)',
        border: '1px solid rgba(230, 128, 0, 0.3)',
        padding: '4px 10px',
        borderRadius: 'var(--rounded-full)',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: '#ffb356',
        marginBottom: '16px'
      }}
    >
      <ShieldCheck size={13} />
      <span>CBN RESTITUTION PROTOCOLS</span>
    </div>
  ) : (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(230, 128, 0, 0.18)',
        border: '1px solid rgba(230, 128, 0, 0.4)',
        padding: '4px 10px',
        borderRadius: 'var(--rounded-full)',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: '#ffb356',
        marginBottom: '16px'
      }}
    >
      <Scale size={13} />
      <span>ACCREDITED COUNSEL NETWORK</span>
    </div>
  );

  const sidebarTitle = isIndividual
    ? 'Sovereign Claimant Portal'
    : 'Legal Advocacy & Briefs Desk';

  const sidebarSubtitle = isIndividual
    ? 'Direct access for individual claimants tracking active dispute dossiers, interbank inquests, and automated bank reversals.'
    : 'Secure pipeline for accredited Legal Practitioners to receive verified dispute referrals, manage contingency retainers, and lodge statutory Form 14 notices.';

  const sidebarChecklist = isIndividual
    ? [
      'Automated NIBSS NIP Session Trace & Switch Evidence',
      'Statutory 72-Hour Response Time Enforcement',
      'Section 84 Evidence Act Certified Audit Vouchers'
    ]
    : [
      'Direct Client Case Referrals from Verified Claimants',
      'Form 14 Pre-Action Notice Automation & Direct Service',
      'Transparent Contingency Yield Tracking & Escrow Remittance'
    ];

  return (
    <AuthLayout
      title={
        successInfo
          ? 'Verify Your Email'
          : isIndividual
            ? 'Open Claimant Account'
            : 'Open Lawyer Account'
      }
      subtitle={
        successInfo
          ? 'Security credentials dispatched to your inbox.'
          : isIndividual
            ? 'Establish claimant credentials to initiate automated interbank arbitration and restitution workflows.'
            : 'Establish accredited practitioner credentials to receive dispute referrals and manage legal briefs.'
      }
      onBackToHome={handleBackToHome}
      sidebarBadge={sidebarBadge}
      sidebarTitle={sidebarTitle}
      sidebarSubtitle={sidebarSubtitle}
      sidebarChecklist={sidebarChecklist}
    >
      {/* ========================================================= */}
      {/* SUCCESS SCREEN: "CHECK YOUR EMAIL" */}
      {/* ========================================================= */}
      {successInfo ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              border: '2px solid #a7f3d0',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <MailCheck size={36} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0B2D5B', marginBottom: '10px' }}>
            Check Your Email Inbox
          </h2>

          <p style={{ fontSize: '13.5px', color: 'var(--neutral-charcoal)', lineHeight: '1.6', marginBottom: '16px' }}>
            We have created your account and dispatched an official verification link to:
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              backgroundColor: 'var(--surface-container-low)',
              borderRadius: 'var(--rounded-md)',
              border: '1px solid var(--neutral-border)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#0B2D5B',
              marginBottom: '20px'
            }}
          >
            {successInfo.email}
          </div>

          {successInfo.isLawyer && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(230, 128, 0, 0.08)',
                border: '1px solid rgba(230, 128, 0, 0.25)',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#92400e',
                lineHeight: '1.5',
                marginBottom: '24px',
                textAlign: 'left'
              }}
            >
              <strong>Accreditation Notice:</strong> In accordance with statutory protocols, your profile has been initialized. You can verify your email and complete your Bar credentials (KYC) once signed in.
            </div>
          )}

          {resendNotice && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#15803d',
                marginBottom: '20px'
              }}
            >
              {resendNotice}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary-gold"
              onClick={handleNavigateLogin}
              style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
            >
              <span>Proceed to Sign In</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleResendFromSuccess}
              disabled={resending}
              style={{
                background: 'transparent',
                border: '1px solid var(--neutral-border)',
                borderRadius: 'var(--rounded-md)',
                color: 'var(--neutral-charcoal)',
                height: '42px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={14} className={resending ? 'spin' : ''} />
              <span>{resending ? 'Dispatching Link...' : 'Resend Verification Email'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* REGISTRATION FORM VIEW */
        /* ========================================================= */
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Account Type Toggle (Individual vs Lawyer) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--surface-container-low)',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid var(--neutral-border)',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAccountType('individual');
                setErrorMsg('');
                setFieldErrors({});
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: isIndividual ? '#0B2D5B' : 'transparent',
                color: isIndividual ? '#ffffff' : 'var(--neutral-charcoal)',
                boxShadow: isIndividual ? '0 2px 6px rgba(11, 45, 91, 0.25)' : 'none'
              }}
            >
              <User size={15} color={isIndividual ? '#ffffff' : '#64748b'} />
              <span>Individual</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('lawyer');
                setErrorMsg('');
                setFieldErrors({});
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: !isIndividual ? '#0B2D5B' : 'transparent',
                color: !isIndividual ? '#ffffff' : 'var(--neutral-charcoal)',
                boxShadow: !isIndividual ? '0 2px 6px rgba(11, 45, 91, 0.25)' : 'none'
              }}
            >
              <Scale size={15} color={!isIndividual ? '#ffffff' : '#64748b'} />
              <span>Lawyer Account</span>
            </button>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              {isIndividual ? 'Full Name ' : ' Full Name'}
            </label>
            <div style={{ position: 'relative' }}>
              {isIndividual ? (
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
              ) : (
                <Award size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
              )}
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder={isIndividual ? 'e.g. John Doe' : 'e.g. Barr. Jane Doe'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {fieldErrors.name && (
              <span style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px', display: 'block' }}>
                {fieldErrors.name.join(' ')}
              </span>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">
                {isIndividual ? 'Email Address' : 'Official Legal Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder={isIndividual ? 'example@mail.com' : 'example@mail.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px', display: 'block' }}>
                  {fieldErrors.email.join(' ')}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {isIndividual ? 'Mobile Number' : 'Direct Mobile Number'}
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input
                  type="number"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="08030000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              {fieldErrors.phone && (
                <span style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px', display: 'block' }}>
                  {fieldErrors.phone.join(' ')}
                </span>
              )}
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
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
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--outline)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px', display: 'block' }}>
                  {fieldErrors.password.join(' ')}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {fieldErrors.passwordConfirmation && (
                <span style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px', display: 'block' }}>
                  {fieldErrors.passwordConfirmation.join(' ')}
                </span>
              )}
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '11px',
              color: 'var(--outline)',
              marginBottom: '18px',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ color: hasMinLength ? '#047857' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} strokeWidth={hasMinLength ? 3 : 1.5} /> 8+ Characters
            </span>
            <span style={{ color: hasUppercase ? '#047857' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} strokeWidth={hasUppercase ? 3 : 1.5} /> Uppercase letter
            </span>
            <span style={{ color: hasNumber ? '#047857' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} strokeWidth={hasNumber ? 3 : 1.5} /> Number (0-9)
            </span>
          </div>

          {/* Statutory Undertaking Checkbox */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '12.5px',
                color: 'var(--neutral-charcoal)',
                lineHeight: '1.45'
              }}
            >
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#0B2D5B' }}
              />
              {isIndividual ? (
                <span>
                  I certify that all claims filed under this account shall represent genuine contested transactions, governed by Section 84 Evidence Act and CBN Consumer Protection Guidelines.
                </span>
              ) : (
                <span>
                  I certify that I am a Legal Practitioner called to the Nigerian Bar in good standing with the Supreme Court Roll, governed by the Legal Practitioners Act and Rules of Professional Conduct (RPC 2023).
                </span>
              )}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary-gold"
            disabled={loading || !termsAgreed}
            style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700 }}
          >
            {loading ? (
              isIndividual ? 'Creating Claimant Account...' : 'Registering Legal Counsel...'
            ) : (
              isIndividual ? 'Open Claimant Account' : 'Open Lawyer Account'
            )}
            {!loading && <ArrowRight size={16} />}
          </button>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--outline)' }}>
            Already registered?{' '}
            <button
              type="button"
              onClick={handleNavigateLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2F7BFF',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Sign In to Portal
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
