import { getJourney } from '../api/fake';
import type { Journey } from '../types';

// Synchronous for now; callers never know where the data comes from.
export function useJourney(id: string | undefined): Journey | undefined {
  return id === undefined ? undefined : getJourney(id);
}
