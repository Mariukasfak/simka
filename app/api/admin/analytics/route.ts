import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AnalyticsData } from '@/lib/types'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication and admin role
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total orders and revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      throw ordersError
    }

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get popular products
    const { data: popularProducts, error: productsError } = await supabase
      .from('orders')
      .select(`
        product_id,
        products (name)
      `)
      .limit(5)

    if (productsError) {
      throw productsError
    }

    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30)
    const { data: dailyRevenue, error: revenueError } = await supabase
      .from('orders')
      .select('created_at, total_price')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (revenueError) {
      throw revenueError
    }

    // Process daily revenue data
    const dailyRevenueData = dailyRevenue.reduce((acc: any[], order) => {
      const date = startOfDay(new Date(order.created_at)).toISOString()
      const existingDay = acc.find(day => day.date === date)
      
      if (existingDay) {
        existingDay.revenue += order.total_price
      } else {
        acc.push({ date, revenue: order.total_price })
      }
      
      return acc
    }, [])

    const analyticsData: AnalyticsData = {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      popularProducts: popularProducts.map((item: any) => ({
        productId: item.product_id,
        name: item.products.name,
        count: 1 // This should be aggregated in the query
      })),
      recentOrders: orders.slice(0, 10),
      dailyRevenue: dailyRevenueData
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}