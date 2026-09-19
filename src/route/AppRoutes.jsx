import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './routes';
import ProtectedRoute from './ProtectedRoute';
import {
  LandingPage,
  Dashboard,
  MyClaims,
  NewClaim,
  ClaimDetail,
  ClaimCheckout,
  Settlements,
  Profile,
  Compliance,
  Login,
  Register,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
  LawyerDashboard,
  LawyerReferrals,
  LawyerKYC,
  LawyerProfile
} from '../pages';

export default function AppRoutes({
  claims,
  currentUser,
  lawyerUser,
  referrals,
  onUpdateReferralStatus,
  onRequestCounsel,
  onSwitchRole,
  searchQuery,
  setSearchQuery,
  onLoginSuccess,
  onRegisterSuccess,
  onLogout,
  onUpdateUser,
  onCreateClaim,
  onOpenSettlement,
  onOpenDemandNotice,
  onOpenEvidenceModal
}) {
  const navigate = useNavigate();

  // Effective lawyer profile: logged in user if lawyer, else fallback lawyer props
  const effectiveLawyer = currentUser?.role === 'LAWYER' || currentUser?.type === 'Lawyer'
    ? currentUser
    : lawyerUser;

  return (
    <Routes>
      {/* 1. Public Marketing & Regulatory Routes */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.COMPLIANCE} element={<Compliance />} />

      {/* 2. Authentication Flow Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={<Login onLoginSuccess={onLoginSuccess} />}
      />
      <Route
        path={ROUTES.REGISTER}
        element={<Register onRegisterSuccess={onRegisterSuccess} />}
      />
      <Route
        path={ROUTES.VERIFY_EMAIL}
        element={<VerifyEmail onNavigateLogin={() => navigate(ROUTES.LOGIN)} />}
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={<ForgotPassword />}
      />
      <Route
        path={ROUTES.RESET_PASSWORD}
        element={<ResetPassword />}
      />

      {/* 3. Authenticated Claimant Portal Routes (Protected: Login Required) */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <Dashboard
              claims={claims}
              currentUser={currentUser}
              onLogout={onLogout}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CLAIMS}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <MyClaims
              claims={claims}
              currentUser={currentUser}
              onLogout={onLogout}
              onOpenSettlement={onOpenSettlement}
              onOpenDemandNotice={onOpenDemandNotice}
              onOpenEvidenceModal={onOpenEvidenceModal}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_CLAIMS}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <MyClaims
              claims={claims}
              currentUser={currentUser}
              onLogout={onLogout}
              onOpenSettlement={onOpenSettlement}
              onOpenDemandNotice={onOpenDemandNotice}
              onOpenEvidenceModal={onOpenEvidenceModal}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CLAIM_CHECKOUT}
        element={
          <ClaimCheckout
            currentUser={currentUser}
            onLogout={onLogout}
          />
        }
      />

      <Route
        path={ROUTES.CLAIM_DETAIL}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <ClaimDetail
              claims={claims}
              currentUser={currentUser}
              referrals={referrals}
              onUpdateReferralStatus={onUpdateReferralStatus}
              onRequestCounsel={onRequestCounsel}
              onLogout={onLogout}
              onBack={() => navigate(ROUTES.CLAIMS)}
              onOpenSettlement={onOpenSettlement}
              onOpenDemandNotice={onOpenDemandNotice}
              onOpenEvidenceModal={onOpenEvidenceModal}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.NEW_CLAIM}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <NewClaim
              currentUser={currentUser}
              onLogout={onLogout}
              onCreateClaim={onCreateClaim}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CREATE_CLAIM}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <NewClaim
              currentUser={currentUser}
              onLogout={onLogout}
              onCreateClaim={onCreateClaim}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SETTLEMENTS}
        element={
          <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
            <Settlements
              claims={claims}
              currentUser={currentUser}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />

            <Route
        path={ROUTES.PROFILE}
        element={
          currentUser?.role === 'LAWYER' || currentUser?.type === 'Lawyer' ? (
            <Navigate to={ROUTES.LAWYER_PROFILE} replace />
          ) : (
            <ProtectedRoute user={currentUser} requiredRole="CLAIMANT">
              <Profile
                currentUser={currentUser}
                claims={claims}
                onLogout={onLogout}
                onUpdateUser={onUpdateUser}
              />
            </ProtectedRoute>
          )
        }
      />

      {/* 4. Accredited Legal Counsel Portal Routes (Protected: Login Required) */}
      <Route
        path="/lawyer"
        element={
          <ProtectedRoute user={currentUser} requiredRole="LAWYER">
            <Navigate to={ROUTES.LAWYER_DASHBOARD} replace />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.LAWYER_DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole="LAWYER">
            <LawyerDashboard
              lawyerUser={effectiveLawyer}
              referrals={referrals}
              onUpdateReferralStatus={onUpdateReferralStatus}
              onLogout={onLogout}
              onSwitchRole={() => {
                if (onSwitchRole) onSwitchRole('consumer');
                navigate(ROUTES.DASHBOARD);
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.LAWYER_REFERRALS}
        element={
          <ProtectedRoute user={currentUser} requiredRole="LAWYER">
            <LawyerReferrals
              lawyerUser={effectiveLawyer}
              referrals={referrals}
              onUpdateReferralStatus={onUpdateReferralStatus}
              onLogout={onLogout}
              onSwitchRole={() => {
                if (onSwitchRole) onSwitchRole('consumer');
                navigate(ROUTES.DASHBOARD);
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.LAWYER_PROFILE}
        element={
          <ProtectedRoute user={currentUser} requiredRole="LAWYER">
            <LawyerProfile
              lawyerUser={effectiveLawyer}
              onUpdateUser={onUpdateUser}
              onLogout={onLogout}
              onSwitchRole={() => {
                if (onSwitchRole) onSwitchRole('consumer');
                navigate(ROUTES.DASHBOARD);
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.LAWYER_KYC}
        element={
          <ProtectedRoute user={currentUser} requiredRole="LAWYER">
            <LawyerKYC
              lawyerUser={effectiveLawyer}
              onLogout={onLogout}
              onSwitchRole={() => {
                if (onSwitchRole) onSwitchRole('consumer');
                navigate(ROUTES.DASHBOARD);
              }}
            />
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
