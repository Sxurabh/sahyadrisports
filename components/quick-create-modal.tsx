"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import our server actions
import { addProduct, addCustomer, addOrder } from "@/app/actions"

interface QuickCreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)

    async function handleAddProduct(formData: FormData) {
        setLoading(true)
        try {
            await addProduct(formData)
            toast.success("Product created successfully")
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast.error("Failed to create product")
        } finally {
            setLoading(false)
        }
    }

    async function handleAddCustomer(formData: FormData) {
        setLoading(true)
        try {
            await addCustomer(formData)
            toast.success("Customer created successfully")
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast.error("Failed to create customer")
        } finally {
            setLoading(false)
        }
    }

    async function handleAddOrder(formData: FormData) {
        setLoading(true)
        try {
            await addOrder(formData)
            toast.success("Order created successfully")
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast.error("Failed to create order")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quick Create</DialogTitle>
                    <DialogDescription>
                        Add a new record to your database quickly.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="product" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="product">Product</TabsTrigger>
                        <TabsTrigger value="customer">Customer</TabsTrigger>
                        <TabsTrigger value="order">Order</TabsTrigger>
                    </TabsList>

                    {/* Product Tab */}
                    <TabsContent value="product">
                        <form action={handleAddProduct} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Footwear">Footwear</SelectItem>
                                        <SelectItem value="Apparel">Apparel</SelectItem>
                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input id="price" name="price" type="number" step="0.01" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" name="stock" type="number" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-4" disabled={loading}>
                                {loading ? "Saving..." : "Create Product"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Customer Tab */}
                    <TabsContent value="customer">
                        <form action={handleAddCustomer} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_name">Full Name</Label>
                                <Input id="customer_name" name="name" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" type="tel" />
                            </div>
                            <Button type="submit" className="w-full mt-4" disabled={loading}>
                                {loading ? "Saving..." : "Create Customer"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Order Tab */}
                    <TabsContent value="order">
                        <form action={handleAddOrder} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="order_customer">Customer Name</Label>
                                <Input id="order_customer" name="customer" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="order_amount">Total Amount</Label>
                                <Input id="order_amount" name="total_amount" type="number" step="0.01" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="order_status">Status</Label>
                                <Select name="status" defaultValue="Pending">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full mt-4" disabled={loading}>
                                {loading ? "Saving..." : "Create Order"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
