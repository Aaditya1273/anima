// Tests for parseSseChunk — the browser relay client's SSE frame parser. A
// malformed or partial frame must NOT crash the event loop; it must return null
// and be skipped. Pure string -> object, no network, no DOM.

import { test, expect } from 'bun:test'
import { parseSseChunk } from './relay-client'

// A well-formed daemon SSE frame: id + event + data(JSON {ts,data}).
function frame(parts: { id?: string; event?: string; data?: string; extra?: string[] }): string {
  const lines: string[] = []
  if (parts.extra) lines.push(...parts.extra)
  if (parts.id !== undefined) lines.push(`id: ${parts.id}`)
  if (parts.event !== undefined) lines.push(`event: ${parts.event}`)
  if (parts.data !== undefined) lines.push(`data: ${parts.data}`)
  return lines.join('\n')
}

test('well-formed frame parses to {seq, kind, ts, data}', () => {
  const chunk = frame({
    id: '42',
    event: 'tool-call',
    data: JSON.stringify({ ts: 1700000000000, data: { name: 'shell.run', ok: true } }),
  })
  const ev = parseSseChunk(chunk)
  expect(ev).not.toBeNull()
  expect(ev?.seq).toBe(42)
  expect(ev?.kind).toBe('tool-call')
  expect(ev?.ts).toBe(1700000000000)
  expect(ev?.data).toEqual({ name: 'shell.run', ok: true })
})

test('multi-line data: lines are joined with newline before JSON.parse', () => {
  // SSE spec: consecutive `data:` lines concatenate with \n. The parser joins
  // them with a literal newline, then JSON.parse. Split the payload at a
  // structural boundary (after the comma) where the inserted \n is valid JSON
  // whitespace between tokens, so the reconstructed JSON stays parseable.
  const head = '{"ts": 5,'
  const tail = '"data": "joined"}'
  const chunk = ['id: 1', 'event: msg', `data: ${head}`, `data: ${tail}`].join('\n')
  const ev = parseSseChunk(chunk)
  expect(ev).not.toBeNull()
  expect(ev?.seq).toBe(1)
  expect(ev?.ts).toBe(5)
  expect(ev?.data).toBe('joined')
})

test('missing id -> null (cannot advance last-event-id)', () => {
  const chunk = frame({ event: 'msg', data: JSON.stringify({ ts: 1, data: 'x' }) })
  expect(parseSseChunk(chunk)).toBeNull()
})

test('missing event -> null', () => {
  const chunk = frame({ id: '3', data: JSON.stringify({ ts: 1, data: 'x' }) })
  expect(parseSseChunk(chunk)).toBeNull()
})

test('missing data -> null', () => {
  const chunk = frame({ id: '3', event: 'msg' })
  expect(parseSseChunk(chunk)).toBeNull()
})

test('non-numeric id -> id stays null -> null', () => {
  const chunk = frame({ id: 'abc', event: 'msg', data: JSON.stringify({ ts: 1, data: 'x' }) })
  expect(parseSseChunk(chunk)).toBeNull()
})

test('malformed JSON in data -> null (does not throw)', () => {
  const chunk = frame({ id: '5', event: 'msg', data: '{ this is : not json' })
  expect(() => parseSseChunk(chunk)).not.toThrow()
  expect(parseSseChunk(chunk)).toBeNull()
})

test('comment lines (": heartbeat") and blank lines are ignored', () => {
  const chunk = [
    ': keep-alive heartbeat',
    '',
    'id: 9',
    'event: ping',
    `data: ${JSON.stringify({ ts: 2, data: null })}`,
  ].join('\n')
  const ev = parseSseChunk(chunk)
  expect(ev?.seq).toBe(9)
  expect(ev?.kind).toBe('ping')
  expect(ev?.data).toBeNull()
})

test('id: 0 is valid (Number.parseInt 0 is finite, not falsy-rejected)', () => {
  // Regression guard: the parser uses `id == null` not `!id`, so seq 0 passes.
  const chunk = frame({ id: '0', event: 'msg', data: JSON.stringify({ ts: 1, data: 'first' }) })
  const ev = parseSseChunk(chunk)
  expect(ev).not.toBeNull()
  expect(ev?.seq).toBe(0)
})

test('trailing whitespace / CRLF on lines is tolerated', () => {
  const chunk = ['id: 11  ', 'event: msg ', `data: ${JSON.stringify({ ts: 3, data: 'ok' })} `]
    .join('\r\n')
  const ev = parseSseChunk(chunk)
  // `event: msg ` -> trimEnd removes trailing space, kind === 'msg'.
  expect(ev?.seq).toBe(11)
  expect(ev?.kind).toBe('msg')
  expect(ev?.data).toBe('ok')
})

test('empty data value (data: ) -> treated as missing -> null', () => {
  const chunk = 'id: 1\nevent: msg\ndata: '
  expect(parseSseChunk(chunk)).toBeNull()
})
