/**
 * Server-side Zama FHE relayer proxy.
 *
 * Forwards browser FHE requests to Zama's relayer network.
 *
 * Sepolia testnet (chainId 11155111):
 *   No API key required — Zama's relayer is open on testnet.
 *   ZAMA_API_KEY env var can be left blank.
 *
 * Ethereum mainnet (production):
 *   Requires a relayer API key obtained by following:
 *   https://github.com/zama-ai/fhevm-relayer-sdk
 *   Set ZAMA_API_KEY in .env.local — never prefix with NEXT_PUBLIC_.
 */

import { type NextRequest, NextResponse } from 'next/server'

// Sepolia testnet relayer (open, no key required)
const SEPOLIA_RELAYER  = 'https://relayer.testnet.zama.ai'
// Mainnet relayer (API key required)
const MAINNET_RELAYER  = 'https://relayer.zama.ai'

const SEPOLIA_CHAIN_ID = '11155111'

function getRelayerBase(chainId: string): string {
  return chainId === SEPOLIA_CHAIN_ID ? SEPOLIA_RELAYER : MAINNET_RELAYER
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
): Promise<NextResponse> {
  return proxy(req, await params)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
): Promise<NextResponse> {
  return proxy(req, await params)
}

async function proxy(
  req: NextRequest,
  params: { chainId: string },
): Promise<NextResponse> {
  const { chainId } = params
  const url   = new URL(req.url)
  const base  = getRelayerBase(chainId)
  const suffix = url.pathname.replace(`/api/relayer/${chainId}`, '')
  const target = `${base}/${chainId}${suffix}${url.search}`

  try {
    const headers = new Headers(req.headers)
    headers.delete('host')

    // Inject API key only when set (mainnet) — testnet works without it
    const apiKey = process.env.ZAMA_API_KEY
    if (apiKey) {
      headers.set('x-api-key', apiKey)
    }

    const body = req.method === 'POST' ? await req.arrayBuffer() : undefined

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    })

    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.set('access-control-allow-origin', '*')

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error('[relayer-proxy]', err)
    return NextResponse.json({ error: 'relayer-proxy-error' }, { status: 502 })
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, x-api-key',
    },
  })
}
