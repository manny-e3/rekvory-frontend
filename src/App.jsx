import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SettlementModal from './components/SettlementModal';
import DemandNoticeModal from './components/DemandNoticeModal';
import EvidenceModal from './components/EvidenceModal';
import { AppRoutes, ROUTES } from './route';
// Zero Mock Data Architecture
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Persistent Claims State
  const [claims, setClaims] = useState(() => {
    try {
      // One-time purge of previously cached browser test/dummy claims
      if (localStorage.getItem('sr_mock_purged_v2') !== 'true') {
        localStorage.removeItem('sr_claims');
        localStorage.removeItem('sr_referrals');
        localStorage.setItem('sr_mock_purged_v2', 'true');
        return [];
      }
      const saved = localStorage.getItem('sr_claims');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved claims from localStorage:', err);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sr_claims', JSON.stringify(claims));
    } catch (err) {
      console.warn('Failed to persist claims to localStorage:', err);
    }
  }, [claims]);

  // 2. Persistent Authenticated User State (Only real logged in users can access portal dashboard)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('sr_auth_token') || localStorage.getItem('sr_token');
      if (token && token.startsWith('mock_jwt_')) {
        localStorage.removeItem('sr_auth_token');
        localStorage.removeItem('sr_token');
        localStorage.removeItem('sr_user');
        return null;
      }
      const saved = localStorage.getItem('sr_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge any old demo/test accounts (e.g. Esther Ehighelua, demo counsel)
        if (
          parsed?.email === 'esther.ehighelua@apexlogistics.ng' ||
          parsed?.email === 'c.adebayo@apexjuris.ng' ||
          parsed?.name === 'Esther Ehighelua' ||
          parsed?.isMock
        ) {
          localStorage.removeItem('sr_user');
          localStorage.removeItem('sr_auth_token');
          localStorage.removeItem('sr_token');
          return null;
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse saved user from localStorage:', err);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('sr_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('sr_user');
      }
    } catch (err) {
      console.warn('Failed to update user in localStorage:', err);
    }
  }, [currentUser]);

  // 3. Persistent Referrals State (Individual Dispute Claims <-> Accredited Counsel Referrals)
  const [referrals, setReferrals] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_referrals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Purge mock referrals
          const genuineRefs = parsed.filter((r) => !r.id?.startsWith('REF-2026-001') && !r.id?.startsWith('REF-2026-002') && !r.isMock);
          return genuineRefs;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved referrals from localStorage:', err);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sr_referrals', JSON.stringify(referrals));
    } catch (err) {
      console.warn('Failed to persist referrals to localStorage:', err);
    }
  }, [referrals]);

  // Accredited Legal Counsel Profile - dynamically resolved from authenticated user
  const lawyerUser = (currentUser?.type === 'Lawyer' || currentUser?.role === 'LAWYER') ? currentUser : null;

  // Search & Navigation states
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeSettlementClaim, setActiveSettlementClaim] = useState(null);
  const [activeDemandNoticeClaim, setActiveDemandNoticeClaim] = useState(null);
  const [activeEvidenceClaim, setActiveEvidenceClaim] = useState(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Two-Way Referral Status Management:
  // Lawyer can ACCEPT/REJECT the referral; Client can ACCEPT/REJECT the matched terms.
  const handleUpdateReferralStatus = (referralId, newStatus, meta = {}) => {
    let affectedClaimId = null;

    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === referralId) {
          affectedClaimId = r.claimId;
          const updated = {
            ...r,
            status: newStatus,
            ...(meta.contingencyPercent !== undefined ? { contingencyPercent: meta.contingencyPercent } : {}),
            ...(meta.reason ? { rejectionReason: meta.reason } : {})
          };

          if (newStatus === 'ACCEPTED_BY_LAWYER') {
            updated.lawyerDecisionAt = 'Just now';
          } else if (newStatus === 'MUTUALLY_ACCEPTED') {
            updated.clientDecisionAt = 'Just now';
            updated.statutoryNoticeDrafted = true;
          }

          return updated;
        }
        return r;
      })
    );

    // Update claim audit trail and notify users
    if (affectedClaimId) {
      let auditAction = '';
      if (newStatus === 'ACCEPTED_BY_LAWYER') {
        auditAction = `Counsel ${lawyerUser?.name || 'Assigned Counsel'} accepted brief with ${meta.contingencyPercent || 10}% contingency recovery fee proposal.`;
        showToast('Brief accepted! Client notified to review terms.');
      } else if (newStatus === 'MUTUALLY_ACCEPTED') {
        auditAction = `Client ${currentUser?.name || 'Claimant'} accepted counsel representation terms. Mutual legal retainer active with ${lawyerUser?.firmName || 'Counsel'}.`;
        showToast('Legal Retainer Executed! Form 14 Pre-Action Notice queued.');
      } else if (newStatus === 'REJECTED_BY_LAWYER') {
        auditAction = `Counsel declined brief due to institution conflict of interest (${meta.reason || 'Conflict of interest'}). Dispute queued for alternative counsel.`;
        showToast('Brief declined. Dispute returned to clearing desk for reassignment.');
      } else if (newStatus === 'REJECTED_BY_CLIENT') {
        auditAction = `Client declined counsel match. Reassignment requested.`;
        showToast('Counsel match declined. Re-routing dispute.');
      }

      if (auditAction) {
        setClaims((prev) =>
          prev.map((c) => {
            if (c.id === affectedClaimId) {
              return {
                ...c,
                auditLog: [
                  {
                    timestamp: 'Just now',
                    actor: 'Accredited Legal Counsel Desk',
                    action: auditAction
                  },
                  ...(c.auditLog || [])
                ]
              };
            }
            return c;
          })
        );
      }
    }
  };

  // Client requests legal escalation for an unassigned claim
  const handleRequestCounsel = (claimId) => {
    const targetClaim = claims.find((c) => c.id === claimId);
    if (!targetClaim) return;

    const existing = referrals.find((r) => r.claimId === claimId);
    if (existing) {
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                status: 'PENDING_LAWYER',
                referralDate: 'Just now',
                lawyerDecisionAt: null,
                clientDecisionAt: null,
                rejectionReason: null
              }
            : r
        )
      );
    } else {
      const newRef = {
        id: `REF-2026-${String(referrals.length + 1).padStart(3, '0')}`,
        claimId: targetClaim.id,
        claimTitle: targetClaim.title || targetClaim.categoryName,
        clientName: currentUser?.name || targetClaim.claimant,
        clientEmail: currentUser?.email || '',
        clientPhone: currentUser?.phone || '',
        disputedAmount: targetClaim.amount,
        disputedAmountFormatted: targetClaim.amountFormatted,
        originBank: targetClaim.originBank,
        beneficiaryBank: targetClaim.beneficiaryBank,
        category: targetClaim.category,
        categoryName: targetClaim.categoryName,
        lawyerId: lawyerUser?.id || null,
        lawyerName: lawyerUser?.name || 'Accredited Legal Counsel',
        lawyerFirm: lawyerUser?.firmName || '',
        contingencyPercent: lawyerUser?.contingencyRate || 10,
        referralDate: 'Just now',
        status: 'PENDING_LAWYER',
        lawyerDecisionAt: null,
        clientDecisionAt: null,
        statutoryNoticeDrafted: false
      };
      setReferrals((prev) => [newRef, ...prev]);
    }

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            auditLog: [
              {
                timestamp: 'Just now',
                actor: 'Claimant Operations Desk',
                action: `Claim escalated to NBA Accredited Counsel (${lawyerUser?.name || 'Legal Counsel'}) on a contingency basis.`
              },
              ...(c.auditLog || [])
            ]
          };
        }
        return c;
      })
    );

    showToast(`Claim ${claimId} referred to Accredited Counsel network for conflict check.`);
  };

  const handleSwitchRole = (role) => {
    if (role === 'lawyer') {
      navigate(ROUTES.LAWYER_DASHBOARD);
      showToast('Switched to Accredited Legal Counsel Portal');
    } else {
      navigate(ROUTES.DASHBOARD);
      showToast('Switched to Claimant Portal');
    }
  };

  const handleCreateClaim = (newClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
    showToast(`Claim ${newClaim.id} successfully registered and served to clearing desks.`);
  };

    const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('sr_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('Failed to update user session in storage:', err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('sr_user', JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to persist user session:', err);
    }
    showToast(`Welcome back, ${user.name}! Accessing portal.`);
  };

  const handleRegisterSuccess = (user) => {
    // Note: registration dispatches email verification. Account must be verified before login.
    if (user.type === 'Lawyer' || user.role === 'LAWYER') {
      showToast(`Legal Counsel account initialized for ${user.name}. Please check your inbox to verify your email.`);
    } else {
      showToast(`Account initialized for ${user.name}. Please check your inbox to verify your email.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sr_user');
      localStorage.removeItem('sr_token');
    } catch (err) {
      console.warn('Failed to clear user session:', err);
    }
    showToast('You have signed out of your account.');
    navigate(ROUTES.LOGIN);
  };

  const handleConfirmSettlement = (claimId) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const updatedTimeline = c.timeline.map((step) => {
            if (step.stage === 4) {
              return {
                ...step,
                completed: true,
                current: true,
                date: 'Completed just now'
              };
            }
            return { ...step, completed: true, current: false };
          });

          return {
            ...c,
            status: 'success',
            statusLabel: 'Recovered',
            stage: 4,
            stageName: 'Restitution Issued & Settled',
            slaTimeRemaining: 'Closed (Resolved)',
            timeline: updatedTimeline,
            auditLog: [
              {
                timestamp: 'Just now',
                actor: 'Claimant / Sovereign Desk',
                action: `Settlement approved. Restitution of ₦${c.amountFormatted} released to origin account ${c.originAccount}.`
              },
              ...(c.auditLog || [])
            ]
          };
        }
        return c;
      })
    );

    showToast(`Restitution settlement for ${claimId} successfully authorized and disbursed!`);
  };

  const handleAddEvidence = (claimId, newFile) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            evidenceFiles: [newFile, ...(c.evidenceFiles || [])],
            auditLog: [
              {
                timestamp: 'Just now',
                actor: 'Claimant Operations Desk',
                action: `Attached verified evidence file: ${newFile.name} (${newFile.type}).`
              },
              ...(c.auditLog || [])
            ]
          };
        }
        return c;
      })
    );

    showToast(`Document "${newFile.name}" lodged and cryptographically timestamped.`);
  };

  // Auth pages have their own standalone centered AuthLayout
  const isAuthRoute = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.VERIFY_EMAIL,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD
  ].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Portal pages have their own PortalLayout (or LawyerLayout) with dark navy sidebar
  const isPortalRoute = [
    ROUTES.DASHBOARD,
    ROUTES.NEW_CLAIM,
    ROUTES.CREATE_CLAIM,
    ROUTES.CLAIMS,
    ROUTES.MY_CLAIMS,
    ROUTES.SETTLEMENTS,
    ROUTES.PROFILE,
    ROUTES.LAWYER_DASHBOARD,
    ROUTES.LAWYER_REFERRALS,
    ROUTES.LAWYER_KYC,
    '/lawyer'
  ].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Public pages show marketing header, but Coming Soon has its own integrated sovereign header & footer
  const isComingSoonRoute = location.pathname === '/coming-soon' || location.pathname === ROUTES.COMING_SOON;
  const hidePublicNav = isAuthRoute || isPortalRoute || isComingSoonRoute;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isAuthRoute ? '#03142e' : 'transparent'
      }}
    >
      
      {/* Top Navigation Bar - displayed on public pages */}
      {!hidePublicNav && (
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--primary-navy)',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: 'var(--rounded-md)',
            boxShadow: 'var(--shadow-tier-3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 2500,
            animation: 'slideUp 0.2s ease-out',
            borderLeft: '4px solid #10b981',
            fontSize: '13px',
            fontFamily: 'var(--font-body)'
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Routed Views managed by AppRoutes */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isAuthRoute ? '#03142e' : 'transparent'
        }}
      >
        <AppRoutes
          claims={claims}
          currentUser={currentUser}
          lawyerUser={lawyerUser}
          referrals={referrals}
          onUpdateReferralStatus={handleUpdateReferralStatus}
          onRequestCounsel={handleRequestCounsel}
          onSwitchRole={handleSwitchRole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          onLogout={handleLogout}
          onCreateClaim={handleCreateClaim}
          onOpenSettlement={(c) => setActiveSettlementClaim(c)}
          onOpenDemandNotice={(c) => setActiveDemandNoticeClaim(c)}
          onOpenEvidenceModal={(c) => setActiveEvidenceClaim(c)}
        />
      </main>

      {/* Institutional Legal Footer - displayed on public pages */}
      {!hidePublicNav && <Footer />}

      {/* Modals */}
      {activeSettlementClaim && (
        <SettlementModal
          claim={activeSettlementClaim}
          onClose={() => setActiveSettlementClaim(null)}
          onConfirmSettlement={handleConfirmSettlement}
        />
      )}

      {activeDemandNoticeClaim && (
        <DemandNoticeModal
          claim={activeDemandNoticeClaim}
          onClose={() => setActiveDemandNoticeClaim(null)}
        />
      )}

      {activeEvidenceClaim && (
        <EvidenceModal
          claim={activeEvidenceClaim}
          onClose={() => setActiveEvidenceClaim(null)}
          onAddEvidence={handleAddEvidence}
        />
      )}

    </div>
  );
}
