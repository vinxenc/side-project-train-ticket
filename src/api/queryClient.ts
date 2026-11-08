import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './journeys';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a 404 never helps; other failures get up to 3 tries.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 3,
    },
  },
});
