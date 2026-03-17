/**
 * OpenClaw Gateway HTTP Client
 *
 * Calls the OpenClaw Gateway's OpenAI-compatible /v1/chat/completions endpoint.
 * Works both locally (http://127.0.0.1:18789) and via tunnel (Cloudflare/ngrok).
 *
 * Env vars:
 *   OPENCLAW_GATEWAY_URL  — Gateway base URL (default: http://127.0.0.1:18789)
 *   OPENCLAW_GATEWAY_TOKEN — Bearer auth token
 */

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''

export interface OpenClawHttpResult {
  reply: string
  model: string
  durationMs: number
  agentId: string
}

export async function callOpenClawHttp(opts: {
  agent?: string
  message: string
  history?: { role: 'user' | 'assistant'; content: string }[]
  sessionUser?: string
  timeout?: number
}): Promise<OpenClawHttpResult> {
  const { agent = 'main', message, history, sessionUser, timeout = 55000 } = opts

  if (!GATEWAY_TOKEN) {
    throw new Error('OPENCLAW_GATEWAY_TOKEN not configured')
  }

  const messages: { role: string; content: string }[] = []

  // Add conversation history
  if (history && history.length > 0) {
    for (const msg of history.slice(-8)) {
      messages.push({ role: msg.role, content: msg.content })
    }
  }

  messages.push({ role: 'user', content: message })

  const body: Record<string, unknown> = {
    model: 'openclaw',
    messages,
  }

  // Use OpenAI `user` field for session persistence
  if (sessionUser) {
    body.user = sessionUser
  }

  const startTime = Date.now()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
        'x-openclaw-agent-id': agent,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenClaw Gateway HTTP ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || ''
    const durationMs = Date.now() - startTime

    return {
      reply,
      model: data.model || 'openclaw',
      durationMs,
      agentId: agent,
    }
  } finally {
    clearTimeout(timer)
  }
}
