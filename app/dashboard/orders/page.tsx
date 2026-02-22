"use client"

import * as React from "react"
import {
    IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight,
    IconDotsVertical, IconEye, IconPackage, IconPrinter, IconSearch,
    IconTruck, IconCheck, IconX, IconChevronDown, IconDownload
} from "@tabler/icons-react"
import {
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState,
    type SortingState, type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { getOrders, addOrder, updateOrder, deleteOrder, type Order } from "@/app/actions"

export default function OrdersPage() {
    const [data, setData] = React.useState<Order[]>([])
    const [loading, setLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
    const [isAddOrderOpen, setIsAddOrderOpen] = React.useState(false)
    const [isEditOrderOpen, setIsEditOrderOpen] = React.useState(false)
    const [editingOrder, setEditingOrder] = React.useState<Order | null>(null)
    const [viewingOrder, setViewingOrder] = React.useState<Order | null>(null)
    const [isViewOrderOpen, setIsViewOrderOpen] = React.useState(false)

    React.useEffect(() => {
        async function load() {
            try {
                const orders = await getOrders()
                setData(orders)
            } catch (e) {
                toast.error("Failed to load orders")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const columns: ColumnDef<Order>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: () => <div className="text-center">Order ID</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "customer",
            header: () => <div className="text-center">Customer</div>,
            cell: ({ row }) => (
                <div className="flex flex-col items-center">
                    <div className="font-medium">{row.getValue("customer")}</div>
                    <div className="text-muted-foreground text-xs">{row.original.email}</div>
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: () => <div className="text-center">Date</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue("date")}</div>,
        },
        {
            accessorKey: "items",
            header: () => <div className="text-center">Items</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue("items")}</div>,
        },
        {
            accessorKey: "total",
            header: () => <div className="text-center">Total</div>,
            cell: ({ row }) => {
                const total = parseFloat(row.getValue("total"))
                const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(total)
                return <div className="text-center font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                    "Delivered": "default", "Shipped": "secondary", "Processing": "secondary",
                    "Pending": "outline", "Cancelled": "destructive",
                }
                return (
                    <div className="flex justify-center">
                        <Badge variant={variants[status] || "default"}>
                            {status}
                        </Badge>
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><IconDotsVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                setViewingOrder(row.original)
                                setIsViewOrderOpen(true)
                            }}>
                                <IconEye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setEditingOrder(row.original)
                                setIsEditOrderOpen(true)
                            }}>
                                <IconPackage className="mr-2 h-4 w-4" /> Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        await deleteOrder(row.original.id)
                                        toast.success("Order deleted successfully")
                                        window.location.reload()
                                    } catch (error) {
                                        toast.error("Failed to delete order")
                                    }
                                }}
                                className="text-destructive"
                            >
                                <IconX className="mr-2 h-4 w-4" /> Delete Order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data, columns, onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter, pagination },
        onGlobalFilterChange: setGlobalFilter, onPaginationChange: setPagination,
        globalFilterFn: (row, columnId, filterValue) => {
            const o = row.original as Order
            return o.customer.toLowerCase().includes(filterValue.toLowerCase()) || o.id.toLowerCase().includes(filterValue.toLowerCase())
        },
    })

    if (loading) return <div className="p-8 text-center">Loading orders...</div>

    // Calculations
    const totalOrders = data.length
    const pendingOrders = data.filter(o => o.status === "Pending").length
    const revenue = data.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0), 0)

    async function handleAddSubmit(formData: FormData) {
        try {
            await addOrder(formData)
            toast.success("Order added successfully")
            setIsAddOrderOpen(false)
            window.location.reload()
        } catch (error) {
            toast.error("Failed to add order")
        }
    }

    async function handleEditSubmit(formData: FormData) {
        if (!editingOrder) return
        try {
            await updateOrder(editingOrder.id, formData)
            toast.success("Order updated successfully")
            setIsEditOrderOpen(false)
            setEditingOrder(null)
            window.location.reload()
        } catch (error) {
            toast.error("Failed to update order")
        }
    }

    // Handle Export
    function handleExport() {
        const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Items", "Total (₹)", "Payment Status", "Shipping"]

        const rowsToExport = table.getFilteredRowModel().rows.map(row => row.original)

        if (rowsToExport.length === 0) {
            toast.error("No data to export")
            return
        }

        const csvContent = [
            headers.join(","),
            ...rowsToExport.map(order => [
                `"${order.id}"`,
                `"${order.customer.replace(/"/g, '""')}"`,
                `"${order.email}"`,
                `"${order.date}"`,
                `"${order.status}"`,
                `"${order.items}"`,
                `"${order.total}"`,
                `"${order.payment}"`,
                `"${order.shipping}"`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Orders exported successfully")
    }

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-muted-foreground">Manage recent orders and fulfillment.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="pl-8 w-[250px]"
                        />
                    </div>
                    <Button variant="outline" onClick={handleExport}><IconDownload className="mr-2 h-4 w-4" /> Export</Button>
                    <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
                        <DialogTrigger asChild>
                            <Button><IconPackage className="mr-2 h-4 w-4" /> Quick Add Order</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form action={handleAddSubmit} className="grid gap-4 py-4">
                                <DialogHeader>
                                    <DialogTitle>Quick Add Order</DialogTitle>
                                    <DialogDescription>Create a new rudimentary order entry.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="customer-name" className="text-right">Customer</Label>
                                    <Input id="customer-name" name="customer" className="col-span-3" placeholder="Full Name" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="customer-email" className="text-right">Email</Label>
                                    <Input id="customer-email" name="email" type="email" className="col-span-3" placeholder="customer@example.com" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="customer-phone" className="text-right">Phone</Label>
                                    <Input id="customer-phone" name="phone" type="tel" className="col-span-3" placeholder="+1234567890" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="order-status" className="text-right">Status</Label>
                                    <Select name="status" defaultValue="Pending" required>
                                        <SelectTrigger id="order-status" className="col-span-3">
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
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="total_amount" className="text-right">Total Amount</Label>
                                    <Input id="total_amount" name="total_amount" type="number" step="0.01" className="col-span-3" placeholder="99.99" required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create Order</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Order Dialog */}
                    <Dialog open={isEditOrderOpen} onOpenChange={(open) => {
                        setIsEditOrderOpen(open)
                        if (!open) setEditingOrder(null)
                    }}>
                        <DialogContent className="sm:max-w-[425px]">
                            {editingOrder && (
                                <form action={handleEditSubmit} className="grid gap-4 py-4">
                                    <DialogHeader>
                                        <DialogTitle>Edit Order</DialogTitle>
                                        <DialogDescription>Update order status and details.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-customer" className="text-right">Customer</Label>
                                        <Input id="edit-customer" name="customer_name" defaultValue={editingOrder.customer} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-status" className="text-right">Status</Label>
                                        <Select name="status" defaultValue={editingOrder.status} required>
                                            <SelectTrigger id="edit-status" className="col-span-3">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Processing">Processing</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-payment" className="text-right">Payment</Label>
                                        <Select name="payment_status" defaultValue={editingOrder.payment || "Paid"} required>
                                            <SelectTrigger id="edit-payment" className="col-span-3">
                                                <SelectValue placeholder="Select payment status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Update Order</Button>
                                    </DialogFooter>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* View Order Dialog */}
                    <Dialog open={isViewOrderOpen} onOpenChange={(open) => {
                        setIsViewOrderOpen(open)
                        if (!open) setViewingOrder(null)
                    }}>
                        <DialogContent className="sm:max-w-[500px]">
                            {viewingOrder && (
                                <div className="space-y-4">
                                    <DialogHeader>
                                        <DialogTitle>Order Summary ({viewingOrder.id})</DialogTitle>
                                        <DialogDescription>Placed on {viewingOrder.date}</DialogDescription>
                                    </DialogHeader>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                            <p>{viewingOrder.customer}</p>
                                            <p className="text-sm">{viewingOrder.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Logistics</p>
                                            <p>Status: <Badge variant="outline">{viewingOrder.status}</Badge></p>
                                            <p>Payment: {viewingOrder.payment}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground">Summary</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Subtotal ({viewingOrder.items} items)</span>
                                            <span>₹{viewingOrder.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-bold text-lg pt-2">
                                            <span>Total</span>
                                            <span>₹{viewingOrder.total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsViewOrderOpen(false)}>Close</Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalOrders}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{pendingOrders}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(revenue)}</CardContent></Card>
            </div>
            {/* Table Section */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="text-muted-foreground text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger size="sm" className="w-[70px]" id="rows-per-page"><SelectValue placeholder={table.getState().pagination.pageSize} /></SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><IconChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><IconChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><IconChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><IconChevronsRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    )
}