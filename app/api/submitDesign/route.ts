import { NextResponse } from 'next/server'
import { EmailJSResponseStatus, send } from '@emailjs/browser'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      product: data.product,
      color: data.color,
      comments: data.comments,
      design_preview: data.imageData
    }

    const response = await send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.EMAILJS_PUBLIC_KEY
    )

    if (response.status === 200) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}