import { NextResponse } from 'next/server'

// Vercel Hobby max: 60s
export const maxDuration = 60

type GarmentType = 'top' | 'bottom' | 'dress' | 'full_outfit'

async function runFashn(userImage: string, garmentImage: string) {
  const FASHN_API_KEY = process.env.FASHN_API_KEY
  if (!FASHN_API_KEY) throw new Error('FASHN_API_KEY not configured')

  console.log('[try-on] FASHN submit (tryon-max)')

  const submitRes = await fetch('https://api.fashn.ai/v1/run', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FASHN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_name: 'tryon-max',
      inputs: {
        model_image: userImage,
        product_image: garmentImage,
      },
    }),
  })

  const submitData = await submitRes.json()
  const jobId = submitData.id
  if (!jobId) throw new Error(`FASHN submit failed: ${JSON.stringify(submitData)}`)

  console.log('[try-on] FASHN job:', jobId)

  for (let i = 0; i < 18; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const statusRes = await fetch(`https://api.fashn.ai/v1/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` },
    })
    const statusData = await statusRes.json()
    console.log('[try-on] FASHN poll raw:', JSON.stringify(statusData))
    console.log(`[try-on] FASHN poll ${i + 1}: ${statusData.status}`)

    if (statusData.status === 'completed') {
      return statusData.output?.[0] || statusData.output
    }
    if (statusData.status === 'failed') {
      const errorPayload = statusData.error ?? statusData
      throw new Error(`FASHN failed: ${typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload)}`)
    }
  }
  throw new Error('FASHN timeout')
}

// ─── Main API Route ───

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userImage, garmentImage, garmentType } = body as {
      userImage: string
      garmentImage: string
      garmentType: GarmentType
    }

    if (!userImage || !garmentImage || !garmentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userImage, garmentImage, garmentType' },
        { status: 400 }
      )
    }

    console.log(`[try-on] Start: type=${garmentType}`)

    const resultUrl = await runFashn(userImage, garmentImage)

    return NextResponse.json({
      success: true,
      data: {
        rendered_image_url: resultUrl,
        model_used: 'FASHN Try-On Max',
        garment_type: garmentType,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[try-on] Error:', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
