import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from './routes';

/**
 * ProtectedRoute
 * Guards routes so that only authenticated users can access them.
 * If not authenticated, redirects to the login route and saves the intended destination.
 * If requiredRole is specified, ensures the user's role matches.
 */
export default function ProtectedRoute({
  user,
  requiredRole,
  children
}) {
  const location = useLocation();

  // 1. Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Role-based verification (if specified)
  if (requiredRole) {
    const userRole = (user.role || user.type || '').toUpperCase();
    const targetRole = requiredRole.toUpperCase();

    // Lawyer trying to access claimant dashboard/claims
    if (targetRole === 'CLAIMANT' && (userRole === 'LAWYER' || userRole === 'COUNSEL')) {
      return <Navigate to={ROUTES.LAWYER_DASHBOARD} replace />;
    }

    // Claimant trying to access lawyer briefs/desk
    if (targetRole === 'LAWYER' && (userRole === 'CLAIMANT' || userRole === 'CONSUMER')) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return children;
}
