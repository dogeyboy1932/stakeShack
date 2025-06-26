import { createHash } from 'crypto';

export const hashString = (input: string): Buffer => {
  return createHash('sha256').update(input).digest();
}; 