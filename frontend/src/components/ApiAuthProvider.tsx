/**
 * API Auth Provider
 * Sets up API authentication and loads user data on sign-in
 */

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setupApiAuth, userApi } from '@/services/api';
import { useUserStore } from '@/stores/userStore';

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { setUser, clearUser } = useUserStore();

  // Setup API auth once when user signs in
  useEffect(() => {
    if (isSignedIn) {
      setupApiAuth(getToken);

      // Load user profile + quota into store
      userApi
        .getMe()
        .then((res: any) => {
          setUser(res.data);
        })
        .catch((err: any) => {
          console.error('Failed to load user profile:', err);
        });
    } else {
      clearUser();
    }
  }, [isSignedIn, getToken, setUser, clearUser]);

  return <>{children}</>;
}
