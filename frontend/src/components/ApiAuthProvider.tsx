/**
 * API Auth Provider
 * Sets up API authentication globally for all pages
 */

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setupApiAuth } from '@/services/api';

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  // Setup API auth once when user signs in
  useEffect(() => {
    if (isSignedIn) {
      setupApiAuth(getToken);
    }
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}
