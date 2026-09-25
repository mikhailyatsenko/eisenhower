import { SyncFailure } from '../types';

// Codes of a refusal; the rest (unavailable, deadline-exceeded…) are transient
const REJECTED_CODES = [
  'permission-denied',
  'unauthenticated',
  'invalid-argument',
  'not-found',
  'already-exists',
  'failed-precondition',
  'out-of-range',
  'unimplemented',
];

export const toSyncFailure = (error: unknown): SyncFailure => {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String(error.code)
      : 'unknown';
  return { code, isRejected: REJECTED_CODES.includes(code) };
};
