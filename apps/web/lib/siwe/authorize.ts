// Server-side ownership gate. The console's client-side ownerOf check
// (app/console/[tokenId]/layout.tsx) is UX-only — it redirects the browser but
// protects no server resource. Any authorized route that reveals how to reach a
// live agent (the relay connection info) MUST enforce ownerOf server-side here
// first, so an authenticated wallet cannot drive an agent it does not own.

import 'server-only'
import type { Address } from 'viem'
import { createPublicClient, http } from 'viem'
import { AGENT_NFT_ABI } from '../chain/abi'
import { ANIMA_AGENT_NFT_ADDRESS, zgMainnet } from '../chain/chain'
import { getSession } from './session'

const publicClient = createPublicClient({ chain: zgMainnet, transport: http() })

export type AuthorizedAgent = { operator: Address; tokenId: bigint; owner: Address }

/**
 * Returns the authorized operator + verified on-chain ownership, or null if the
 * caller is unauthenticated or is not the current owner of tokenId.
 */
export async function authorizeAgent(tokenId: bigint): Promise<AuthorizedAgent | null> {
  const session = await getSession()
  const operator = session.address
  if (!operator) return null
  let owner: Address
  try {
    owner = (await publicClient.readContract({
      address: ANIMA_AGENT_NFT_ADDRESS,
      abi: AGENT_NFT_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
    })) as Address
  } catch {
    return null
  }
  if (owner.toLowerCase() !== operator.toLowerCase()) return null
  return { operator, tokenId, owner }
}
