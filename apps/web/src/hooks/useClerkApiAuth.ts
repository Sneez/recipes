import { useEffect } from 'react';

import { useAuth } from '@clerk/clerk-react';

import { setTokenGetter } from '@/lib/api-client';

export function useClerkApiAuth() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
}
