import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { orderFormSchema } from '@/lib/validations/order'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const data = await request.json()

    // Validate form data
    const validatedData = orderFormSchema.parse(data)

    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Create order in database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: validatedData.name,
        customer_email: validatedData.email,
        size: validatedData.size,
        quantity: validatedData.quantity,
        comments: validatedData.comments,
        design_url: data.designPreview,
        status: 'pending',
        total_price: data.totalPrice || 0, // Calculate based on product and quantity
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    )
  }
}