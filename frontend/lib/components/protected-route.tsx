'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  fallback?: ReactNode;
}

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Unauthorized Fallback Component
 */
function UnauthorizedFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600">
          You do not have permission to access this page.
        </p>
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact the administrator.
        </p>
      </div>
    </div>
  );
}

/**
 * Protected Route Component
 * Ensures only authenticated users with correct roles can access the route
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  // Check role-based access
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userHasRole = requiredRoles.includes(user.role);

    if (!userHasRole) {
      return fallback || <UnauthorizedFallback />;
    }
  }

  // User is authenticated and authorized
  return children;
}

export default ProtectedRoute;
