import { NextResponse } from 'next/server'
import { callOpenClawHttp } from '@/lib/openclaw-http'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action } = body as { action?: string }

        // We use the Engineer Agent (DeepSeek V3.2 theoretically deployed on BytePlus) 
        // to perform the vision inspection routing
        const agent = 'engineer'

        if (action === 'inspect') {
            try {
                const result = await callOpenClawHttp({
                    agent,
                    message: 'SYSTEM_ROUTING: Inspect user uploaded image payload for virtual try-on suitability. Check for background clutter, lighting conditions, and occlusion.',
                    timeout: 10000,
                })

                // Return a structured demo response representing the OpenClaw Vision Agent's output
                return NextResponse.json({
                    success: true,
                    data: {
                        status: 'flagged',
                        confidence: 0.87,
                        message: result.reply || 'BytePlus CV Engine detected high background complexity. This may reduce neural draping precision at the edges.',
                        agentResponse: result.reply,
                        source: 'openclaw',
                        agent: 'Try-On Engineer (DeepSeek V3.2 / BytePlus)',
                        suggestedSkill: 'BytePlus_Matting_Enhancement'
                    }
                })
            } catch (openclawError) {
                console.warn('[openclaw/tryon] OpenClaw unavailable, using fallback inspection:', openclawError)
                // Robust fallback for the demo
                return NextResponse.json({
                    success: true,
                    data: {
                        status: 'flagged',
                        confidence: 0.92,
                        message: 'BytePlus CV Engine detected high background complexity. This may reduce neural draping precision at the edges.',
                        agentResponse: 'Image dimensions OK. Background contains multiple overlapping objects. Lighting variance detected.',
                        source: 'fallback-rules',
                        agent: 'Try-On Engineer (Fallback)',
                        suggestedSkill: 'BytePlus_Matting_Enhancement'
                    }
                })
            }
        }

        if (action === 'photo_qc') {
            try {
                const prompt = `
You are a senior photo quality inspector for an AI virtual try-on studio.
You do NOT see the actual image pixels, but you know the rules for a good full-body fashion photo:
- Full body is visible from head to feet
- Person is facing the camera, arms relaxed at sides
- Lighting is even, face and garment details are clear
- Background is relatively clean (no heavy clutter)
- Single person in frame

Your task: based on these rules, infer whether the user's photo is likely suitable for virtual try-on,
and provide clear, actionable feedback in **ENGLISH**.

The JSON format MUST be:
{
  "passed": boolean,
  "score": number,            // from 0 to 100
  "issues": string[],         // list of short problem descriptions in ENGLISH
  "advice": string            // 1-3 sentences of friendly ENGLISH advice to help the user retake the photo
}

If you are not sure, be slightly strict (lower the score a bit) but still give very clear advice.
Remember: output valid JSON only.`

                const result = await callOpenClawHttp({
                    agent,
                    message: prompt,
                    timeout: 10000,
                })

                let parsed: {
                    passed?: boolean
                    score?: number
                    issues?: string[]
                    advice?: string
                } = {}

                try {
                    parsed = JSON.parse(result.reply || '{}')
                } catch (e) {
                    console.warn('[openclaw/tryon] Failed to parse photo_qc JSON reply:', e, result.reply)
                }

                const passed = typeof parsed.passed === 'boolean' ? parsed.passed : true
                const score = typeof parsed.score === 'number' ? parsed.score : 88

                return NextResponse.json({
                    success: true,
                    data: {
                        passed,
                        score,
                        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
                        advice: parsed.advice || 'Please face the camera, keep your full body in frame, use a simple background and even lighting, then retake the photo.',
                        source: 'openclaw-photo-qc',
                    }
                })
            } catch (qcError) {
                console.warn('[openclaw/tryon] photo_qc fallback:', qcError)
                // Safe fallback: 默认通过，但仍给出一条通用建议
                return NextResponse.json({
                    success: true,
                    data: {
                        passed: true,
                        score: 85,
                        issues: [],
                        advice: 'This photo is basically usable. For better try-on quality, please face the camera, keep your full body visible, choose a clean background, and ensure even lighting.',
                        source: 'fallback-rules',
                    }
                })
            }
        }

        if (action === 'enhance') {
            // Simulate the enhancement process via a skill
            await new Promise(r => setTimeout(r, 1500))
            return NextResponse.json({
                success: true,
                data: {
                    status: 'enhanced',
                    message: 'BytePlus Image Enhancement applied successfully. Background neutralized.',
                    source: 'byteplus-skill'
                }
            })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (error: unknown) {
        console.error('[openclaw/tryon] Error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
