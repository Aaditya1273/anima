'use client'

// v0.27 device write-auth state for the console. Bridges the RelayGatewayClient
// "sign once, then chat" flow to React: resolves the daemon's write-auth mode,
// restores a persisted device token, exposes grant/revoke, and surfaces the
// authorized-device list. A device token is the ONLY credential persisted in the
// browser (revocable + expirable + operator+sandbox-scoped), keyed per agent.

import type { DeviceListing, RelayGatewayClient } from '@/lib/gateway/relay-client'
import { useCallback, useEffect, useState } from 'react'

export type WriteMode = 'loading' | 'trusted' | 'signed'

const DEVICE_ID_KEY = 'anima:deviceId'
const tokenKey = (tokenId: string) => `anima:deviceToken:${tokenId}`

interface StoredToken {
  token: string
  expiresAt: number // unix ms, 0 = never
  deviceId: string
}

/** One stable id for THIS browser (across agents). Server-validated grammar. */
function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    window.localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

function readStored(tokenId: string): StoredToken | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(tokenKey(tokenId))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredToken
    if (!parsed?.token) return null
    // Proactively drop an expired token so we re-prompt instead of 401-ing.
    if (parsed.expiresAt !== 0 && Date.now() >= parsed.expiresAt) {
      window.localStorage.removeItem(tokenKey(tokenId))
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export interface DeviceAuth {
  mode: WriteMode
  /** signed mode + no valid device token → the authorize card should show. */
  needsAuth: boolean
  granting: boolean
  error: string | null
  devices: DeviceListing[]
  deviceId: string
  grant: (expiresAt: number, label: string) => Promise<void>
  refreshDevices: () => Promise<void>
  revoke: (tokenId: string) => Promise<void>
  /** Called when a write 401s (revoked/expired mid-session) → re-prompt. */
  onUnauthorized: () => void
}

export function useDeviceAuth(client: RelayGatewayClient | null, tokenId: string): DeviceAuth {
  const [mode, setMode] = useState<WriteMode>('loading')
  const [hasToken, setHasToken] = useState(false)
  const [granting, setGranting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<DeviceListing[]>([])

  // Resolve write mode + restore a stored token for this agent.
  useEffect(() => {
    if (!client) {
      setMode('loading')
      return
    }
    let cancelled = false
    setMode('loading')
    setError(null)
    client
      .writeAuthMode()
      .then(m => {
        if (cancelled) return
        setMode(m)
        if (m === 'signed') {
          const stored = readStored(tokenId)
          if (stored) {
            client.setDeviceToken(stored.token)
            setHasToken(true)
          } else {
            client.setDeviceToken(undefined)
            setHasToken(false)
          }
        } else {
          setHasToken(false) // trusted: no token needed at all
        }
      })
      .catch(() => {
        if (!cancelled) setMode('signed') // safe default
      })
    return () => {
      cancelled = true
    }
  }, [client, tokenId])

  const grant = useCallback(
    async (expiresAt: number, label: string) => {
      if (!client) return
      setGranting(true)
      setError(null)
      try {
        const deviceId = getDeviceId()
        const res = await client.grantDevice({ deviceId, label, expiresAt })
        const stored: StoredToken = { token: res.token, expiresAt: res.expiresAt, deviceId }
        window.localStorage.setItem(tokenKey(tokenId), JSON.stringify(stored))
        setHasToken(true)
      } catch (e) {
        setError((e as Error).message)
        throw e
      } finally {
        setGranting(false)
      }
    },
    [client, tokenId],
  )

  const refreshDevices = useCallback(async () => {
    if (!client) return
    try {
      setDevices(await client.listDevices())
    } catch {
      /* read route unavailable — keep prior list */
    }
  }, [client])

  const revoke = useCallback(
    async (revTokenId: string) => {
      if (!client) return
      // If we're revoking THIS browser's device, drop the local token + re-prompt.
      const mine = devices.find(d => d.tokenId === revTokenId)?.deviceId === getDeviceId()
      await client.revokeDevice(revTokenId)
      if (mine) {
        window.localStorage.removeItem(tokenKey(tokenId))
        client.setDeviceToken(undefined)
        setHasToken(false)
      }
      await refreshDevices()
    },
    [client, tokenId, devices, refreshDevices],
  )

  const onUnauthorized = useCallback(() => {
    if (!client) return
    window.localStorage.removeItem(tokenKey(tokenId))
    client.setDeviceToken(undefined)
    setHasToken(false)
  }, [client, tokenId])

  return {
    mode,
    needsAuth: mode === 'signed' && !hasToken,
    granting,
    error,
    devices,
    deviceId: getDeviceId(),
    grant,
    refreshDevices,
    revoke,
    onUnauthorized,
  }
}
