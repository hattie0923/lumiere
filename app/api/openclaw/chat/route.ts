import { NextResponse } from 'next/server'
import { callOpenClawHttp } from '@/lib/openclaw-http'
import { callKimi } from '@/lib/kimi'

// ─── Agent Metadata ───
const AGENT_META: Record<string, { name: string; model: string; provider: string }> = {
  main: { name: 'LUMIÈRE Concierge', model: 'Kimi K2.5', provider: 'Moonshot' },
  stylist: { name: 'Fashion Stylist', model: 'Kimi K2.5', provider: 'Moonshot' },
  engineer: { name: 'Try-On Engineer', model: 'DeepSeek V3.2', provider: 'BytePlus' },
}

export async function POST(req: Request) {
  try {
    const { message, agent = 'main', sessionId, history } = await req.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const meta = AGENT_META[agent] || AGENT_META.main

    // ─── Strategy 1: OpenClaw Gateway HTTP API (full agent + skills) ───
    try {
      const result = await callOpenClawHttp({
        agent,
        message,
        history: history || [],
        sessionUser: sessionId || undefined,
      })

      return NextResponse.json({
        success: true,
        data: {
          reply: result.reply,
          model: meta.model,
          durationMs: result.durationMs,
          agent: meta.name,
          provider: meta.provider,
          source: 'openclaw',
        },
      })
    } catch (openclawError) {
      console.warn('[chat] OpenClaw Gateway unavailable:', openclawError instanceof Error ? openclawError.message : openclawError)
    }

    // ─── Strategy 2: Kimi K2.5 Direct API (no agent orchestration) ───
    try {
      const result = await callKimi({
        agent,
        message,
        history: history || [],
      })

      return NextResponse.json({
        success: true,
        data: {
          reply: result.reply,
          model: result.model,
          durationMs: result.durationMs,
          agent: meta.name,
          provider: meta.provider,
          source: 'kimi-direct',
        },
      })
    } catch (kimiError) {
      console.warn('[chat] Kimi direct API failed:', kimiError instanceof Error ? kimiError.message : kimiError)
    }

    // ─── Strategy 3: Static fallback (all APIs down) ───
    return NextResponse.json({
      success: true,
      data: {
        reply: 'Our AI services are temporarily unavailable. Please try again in a moment, or browse our collection at /products.',
        model: meta.model,
        durationMs: 0,
        agent: meta.name,
        provider: meta.provider,
        source: 'fallback',
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[chat] Error:', msg)
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    )
  }
}
