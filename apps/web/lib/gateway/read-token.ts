// Server-only mint of the SSE read-auth token. MUST stay byte-identical to the
// gateway's readTokenFor / currentReadToken (packages/gateway/src/auth.ts):
// HMAC-SHA256 over `anima-read:<bucket>` with a 1h bucket. A drift here yields a
// silent 401 on the read routes, so both sides pin the same known-answer vector
// (see read-token.test.ts here + auth.test.ts there).

import { createHmac } from 'node:crypto'

export const READ_TOKEN_BUCKET_MS = 60 * 60 * 1000

export function readTokenFor(readSecret: string, bucket: number): string {
  return createHmac('sha256', readSecret).update(`anima-read:${bucket}`).digest('hex')
}

/** Mint the current-bucket read token for a verified owner. */
export function mintReadToken(readSecret: string, now: number = Date.now()): string {
  return readTokenFor(readSecret, Math.floor(now / READ_TOKEN_BUCKET_MS))
}
