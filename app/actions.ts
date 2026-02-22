'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Types ---
export type Product = {
    id: string
    name: string
    category: string
    stock: number
    price: number
    manager: string
    sku: string
    brand: string
    status: "In Stock" | "Low Stock" | "Out of Stock"
}

export type Order = {
    id: string
    customer: string
    email: string
    date: string
    total: number
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
    items: number
    payment: "Paid" | "Pending" | "Failed"
    shipping: string
}

export type Customer = {
    id: string
    name: string
    email: string
    phone: string
    orders: number
    totalSpent: number
    status: "Active" | "Inactive" | "VIP"
    lastOrder: string
    avatar?: string
}

// --- INVENTORY ACTIONS ---

export async function getProducts(): Promise<Product[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return data.map((p: any) => ({
        ...p,
        // Calculate status dynamically based on stock levels
        status: p.stock === 0 ? "Out of Stock" : p.stock < 20 ? "Low Stock" : "In Stock"
    }))
}

// --- DASHBOARD ACTIONS ---

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Total Sales (sum of all Order amounts)
    // We need to fetch order_items joined with orders to calculate the total
    const { data: orderItemsData, error: salesError } = await supabase
        .from('order_items')
        .select(`
            quantity,
            unit_price,
            orders!inner(status)
        `)

    if (salesError) throw new Error(salesError.message)

    // Filter out cancelled orders and sum the value
    const totalSales = orderItemsData.reduce((sum: number, item: any) => {
        if (item.orders?.status !== 'Cancelled') {
            return sum + (item.quantity * item.unit_price)
        }
        return sum
    }, 0)

    // 2. Orders This Week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { count: ordersThisWeek, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

    if (ordersError) throw new Error(ordersError.message)

    // 3. Products In Stock & Low Stock Items
    const { data: inventoryData, error: inventoryError } = await supabase
        .from('products')
        .select('stock')

    if (inventoryError) throw new Error(inventoryError.message)

    const productsInStock = inventoryData.filter(p => p.stock > 0).length
    const lowStockItems = inventoryData.filter(p => p.stock > 0 && p.stock < 20).length

    return {
        totalSales,
        ordersThisWeek: ordersThisWeek || 0,
        productsInStock,
        lowStockItems
    }
}

export async function getDashboardChartData() {
    const supabase = await createClient()

    // Fetch last 90 days of orders
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: itemsData, error } = await supabase
        .from('order_items')
        .select(`
            quantity,
            unit_price,
            orders!inner(created_at, status)
        `)
        .gte('orders.created_at', ninetyDaysAgo.toISOString())

    if (error) throw new Error(error.message)

    // Aggregate by day
    const dailyData: Record<string, { desktop: number, mobile: number }> = {}

    // Initialize all 90 days with 0 to ensure continuous chart lines
    for (let i = 0; i < 90; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        dailyData[dateStr] = { desktop: 0, mobile: 0 }
    }

    // Fill with real data
    itemsData.forEach((item: any) => {
        if (!item.orders || item.orders.status === 'Cancelled') return;

        const dateStr = new Date(item.orders.created_at).toISOString().split('T')[0]
        if (dailyData[dateStr]) {
            const amount = item.quantity * item.unit_price
            dailyData[dateStr].desktop += amount * 0.6
            dailyData[dateStr].mobile += amount * 0.4
        }
    })

    // Convert to array and sort by date ascending
    return Object.entries(dailyData)
        .map(([date, values]) => ({
            date,
            desktop: Math.round(values.desktop),
            mobile: Math.round(values.mobile)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function addProduct(formData: FormData) {
    const supabase = await createClient()

    const product = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
        brand: "Generic", // You can add a field for this in the form later
        sku: `SKU-${Date.now().toString().slice(-6)}`, // Auto-generate simple SKU
        manager: "Admin User" // In a real app, fetch the logged-in user's name
    }

    const { error } = await supabase.from('products').insert([product])
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient()

    const updates = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
    }

    const { error } = await supabase.from('products').update(updates).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/inventory')
}

// --- ORDER ACTIONS ---

export async function getOrders(): Promise<Order[]> {
    const supabase = await createClient()

    // Fetch orders with customer details and order items
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      customers (name, email),
      order_items (quantity, unit_price)
    `)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return data.map((order: any) => {
        const orderTotal = order.order_items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0;
        const itemsCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

        return {
            id: order.id,
            customer: order.customers?.name || 'Unknown',
            email: order.customers?.email || 'Unknown',
            date: new Date(order.created_at).toISOString().split('T')[0],
            total: orderTotal,
            status: order.status,
            items: itemsCount || 1, // Defaulting to 1 if empty for visual purposes
            payment: order.payment_status,
            shipping: order.shipping_method || 'Standard'
        }
    })
}

// --- CUSTOMER ACTIONS ---

export async function getCustomers(): Promise<Customer[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('customers')
        .select(`
      *,
      orders (
        created_at,
        order_items (quantity, unit_price)
      )
    `)

    if (error) throw new Error(error.message)

    return data.map((c: any) => {
        let totalSpent = 0;
        if (c.orders) {
            c.orders.forEach((o: any) => {
                const orderTotal = o.order_items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0;
                totalSpent += orderTotal;
            });
        }

        const lastOrderDate = c.orders && c.orders.length > 0
            ? new Date(Math.max(...c.orders.map((o: any) => new Date(o.created_at).getTime()))).toISOString().split('T')[0]
            : 'Never'

        return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || 'N/A',
            orders: c.orders?.length || 0,
            totalSpent: totalSpent,
            status: c.status,
            lastOrder: lastOrderDate,
            avatar: c.avatar_url
        }
    })
}

export async function addCustomer(formData: FormData) {
    const supabase = await createClient()

    const customer = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || null,
        status: "Active"
    }

    const { error } = await supabase.from('customers').insert([customer])
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/customers')
}

export async function updateCustomer(id: string, formData: FormData) {
    const supabase = await createClient()

    const updates = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || null,
        status: formData.get('status') as string,
    }

    const { error } = await supabase.from('customers').update(updates).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/customers')
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/customers')
}

export async function addOrder(formData: FormData) {
    const supabase = await createClient()

    // 1. We must find or create a minimal customer for this order
    // Simulating finding customer by name to satisfy schema relation
    const customerName = formData.get('customer') as string

    // Check if customer exists
    let { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .ilike('name', customerName)
        .limit(1)
        .single()

    let customerId = existingCustomer?.id

    // Create a dummy customer if they don't exist
    if (!customerId) {
        const customerEmail = formData.get('email') as string || `${customerName.toLowerCase().replace(/\s/g, "")}@example.com`
        const customerPhone = formData.get('phone') as string || null

        const { data: newCustomer, error: custError } = await supabase
            .from('customers')
            .insert([{ name: customerName, email: customerEmail, phone: customerPhone, status: "Active" }])
            .select()
            .single()

        if (custError) throw new Error(custError.message)
        customerId = newCustomer.id
    }

    const order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        customer_id: customerId,
        status: formData.get('status') as string,
        payment_status: "Paid", // Defaulting for quick create
        shipping_method: "Standard" // Defaulting for quick create
    }

    const { data: insertedOrder, error: insertError } = await supabase.from('orders').insert([order]).select().single()
    if (insertError) throw new Error(insertError.message)

    const submittedAmount = parseFloat(formData.get('total_amount') as string)

    // We need to associate this order with an order_item to record the total_amount
    // First, find a random product to associate with (or create a dummy one if none exists)
    let { data: products } = await supabase.from('products').select('id').limit(1)

    let productId;
    if (products && products.length > 0) {
        productId = products[0].id
    } else {
        // Create a dummy product
        const { data: newProd } = await supabase.from('products').insert([{
            name: "Custom Order Item",
            price: submittedAmount,
            sku: "CUSTOM-001"
        }]).select().single()
        if (newProd) productId = newProd.id
    }

    if (productId) {
        await supabase.from('order_items').insert([{
            id: `ITEM-${Date.now().toString().slice(-6)}`,
            order_id: insertedOrder.id,
            product_id: productId,
            quantity: 1,
            unit_price: submittedAmount
        }])
    }

    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard') // Also update dashboard stats
}

export async function updateOrder(id: string, formData: FormData) {
    const supabase = await createClient()

    const updates = {
        status: formData.get('status') as string,
        payment_status: formData.get('payment_status') as string,
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', id)
    if (error) throw new Error(error.message)

    const customerName = formData.get('customer_name') as string
    if (customerName) {
        const { data: orderData } = await supabase.from('orders').select('customer_id').eq('id', id).single()
        if (orderData?.customer_id) {
            await supabase.from('customers').update({ name: customerName }).eq('id', orderData.customer_id)
        }
    }

    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard')
}

export async function deleteOrder(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard')
}