// Sovereign Recovery - Route Path Definitions
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  CLAIMS: '/claims',
  MY_CLAIMS: '/my-claims',
  CLAIM_DETAIL: '/claims/:claimId',
  CLAIM_CHECKOUT: '/claims/:claimId/checkout',
  NEW_CLAIM: '/new-claim',
  CREATE_CLAIM: '/create-claim',
  SETTLEMENTS: '/settlements',
  PROFILE: '/profile',
  COMPLIANCE: '/compliance',
  LAWYER_DASHBOARD: '/lawyer/dashboard',
  LAWYER_REFERRALS: '/lawyer/referrals',
  LAWYER_KYC: '/lawyer/kyc',
  LAWYER_PROFILE: '/lawyer/profile'
};

export default ROUTES;
