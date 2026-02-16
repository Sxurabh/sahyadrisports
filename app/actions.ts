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

// --- ORDER ACTIONS ---

export async function getOrders(): Promise<Order[]> {
    const supabase = await createClient()

    // Fetch orders with customer details and a count of items
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      customers (name, email),
      order_items (count)
    `)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return data.map((order: any) => ({
        id: order.id,
        customer: order.customers?.name || 'Unknown',
        email: order.customers?.email || 'Unknown',
        date: new Date(order.created_at).toISOString().split('T')[0],
        total: order.total_amount || 0, // Ensure your DB column is named total_amount or adjust here
        status: order.status,
        items: order.order_items[0]?.count || 1, // Default to 1 if count fails
        payment: order.payment_status,
        shipping: order.shipping_method || 'Standard'
    }))
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
        total_amount
      )
    `)

    if (error) throw new Error(error.message)

    return data.map((c: any) => {
        const totalSpent = c.orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
        const lastOrderDate = c.orders.length > 0
            ? new Date(Math.max(...c.orders.map((o: any) => new Date(o.created_at).getTime()))).toISOString().split('T')[0]
            : 'Never'

        return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || 'N/A',
            orders: c.orders.length,
            totalSpent: totalSpent,
            status: c.status,
            lastOrder: lastOrderDate,
            avatar: c.avatar_url
        }
    })
}