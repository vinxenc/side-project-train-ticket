import { ApiError } from '@/api/journeys';
import { queryClient } from '@/api/queryClient';

type Retry = (failureCount: number, error: Error) => boolean;
const retry = queryClient.getDefaultOptions().queries?.retry as Retry;

test('never retries a 4xx error', () => {
  expect(retry(0, new ApiError(404, 'missing'))).toBe(false);
});

test('retries a 5xx or network error up to 3 times', () => {
  expect(retry(0, new ApiError(500, 'boom'))).toBe(true);
  expect(retry(2, new Error('network'))).toBe(true);
  expect(retry(3, new Error('network'))).toBe(false);
});
