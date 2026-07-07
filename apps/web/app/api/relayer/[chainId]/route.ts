/**
 * Server-side Zama FHE relayer proxy.
 *
 * The browser calls /api/relayer/11155111/* and this route forwards the
 * request to Zama's relayer network, injecting the ZAMA_API_KEY header.
 *
 * The API key MUST stay server-side. Never prefix with NEXT_PUBLIC_.
 *
 * Based on: https://docs.zama.ai/protocol/sdk/guides/authentication
 */

import { type NextRequest, NextResponse } from 'next/server'

const ZAMA_RELAYER_BASE = 'https://relayer.zama.ai'

function getApiKey(): string {
  const key = process.env.ZAMA_API_KEY
  if (!key) throw new Error('ZAMA_API_KEY env var is not set')
  return key
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
  const url = new URL(req.url)
  // Strip the /api/relayer/<chainId> prefix and forward the rest
  const suffix = url.pathname.replace(`/api/relayer/${chainId}`, '')
  const target = `${ZAMA_RELAYER_BASE}/${chainId}${suffix}${url.search}`

  try {
    const apiKey = getApiKey()
    const headers = new Headers(req.headers)
    headers.set('x-api-key', apiKey)
    headers.delete('host')

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
