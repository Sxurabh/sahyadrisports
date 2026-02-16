// app/dashboard/orders/page.tsx
"use client"

import * as React from "react"
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconEye,
    IconPackage,
    IconPrinter,
    IconSearch,
    IconTruck,
    IconCheck,
    IconX,
} from "@tabler/icons-react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'

type Order = {
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

const sampleOrders: Order[] = [
    {
        id: "ORD-2024-001",
        customer: "Rahul Sharma",
        email: "rahul@example.com",
        date: "2024-01-15",
        total: 299.99,
        status: "Delivered",
        items: 3,
        payment: "Paid",
        shipping: "Express",
    },
    {
        id: "ORD-2024-002",
        customer: "Priya Patel",
        email: "priya@example.com",
        date: "2024-01-16",
        total: 149.50,
        status: "Shipped",
        items: 2,
        payment: "Paid",
        shipping: "Standard",
    },
    {
        id: "ORD-2024-003",
        customer: "Amit Kumar",
        email: "amit@example.com",
        date: "2024-01-16",
        total: 89.99,
        status: "Processing",
        items: 1,
        payment: "Paid",
        shipping: "Standard",
    },
    {
        id: "ORD-2024-004",
        customer: "Sneha Gupta",
        email: "sneha@example.com",
        date: "2024-01-17",
        total: 459.00,
        status: "Pending",
        items: 4,
        payment: "Pending",
        shipping: "Express",
    },
    {
        id: "ORD-2024-005",
        customer: "Vikram Singh",
        email: "vikram@example.com",
        date: "2024-01-17",
        total: 199.99,
        status: "Cancelled",
        items: 2,
        payment: "Failed",
        shipping: "Standard",
    },
    {
        id: "ORD-2024-006",
        customer: "Neha Verma",
        email: "neha@example.com",
        date: "2024-01-18",
        total: 349.99,
        status: "Shipped",
        items: 3,
        payment: "Paid",
        shipping: "Express",
    },
]

const columns: ColumnDef<Order>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.getValue("customer")}</div>
                <div className="text-muted-foreground text-xs">{row.original.email}</div>
            </div>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => <div className="text-center">{row.getValue("items")}</div>,
    },
    {
        accessorKey: "total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const total = parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(total)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                "Delivered": "default",
                "Shipped": "secondary",
                "Processing": "secondary",
                "Pending": "outline",
                "Cancelled": "destructive",
            }
            return (
                <Badge variant={variants[status] || "default"}>
                    {status === "Shipped" && <IconTruck className="mr-1 h-3 w-3" />}
                    {status === "Delivered" && <IconCheck className="mr-1 h-3 w-3" />}
                    {status === "Cancelled" && <IconX className="mr-1 h-3 w-3" />}
                    {status === "Processing" && <IconPackage className="mr-1 h-3 w-3" />}
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "payment",
        header: "Payment",
        cell: ({ row }) => {
            const payment = row.getValue("payment") as string
            return (
                <Badge variant={payment === "Paid" ? "default" : payment === "Pending" ? "secondary" : "destructive"}>
                    {payment}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Dialog>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <IconEye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Order {order.id}</DialogTitle>
                                    <DialogDescription>
                                        Order details and tracking information.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium">Customer</p>
                                            <p className="text-sm text-muted-foreground">{order.customer}</p>
                                            <p className="text-sm text-muted-foreground">{order.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Shipping Method</p>
                                            <p className="text-sm text-muted-foreground">{order.shipping}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm font-medium">Order Date</p>
                                            <p className="text-sm text-muted-foreground">{order.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Items</p>
                                            <p className="text-sm text-muted-foreground">{order.items}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Total</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${order.total.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenuItem onClick={() => toast.info(`Printing invoice ${order.id}`)}>
                            <IconPrinter className="mr-2 h-4 w-4" />
                            Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => toast.success(`Order ${order.id} updated`)}
                            disabled={order.status === "Delivered" || order.status === "Cancelled"}
                        >
                            <IconTruck className="mr-2 h-4 w-4" />
                            Update Status
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function OrdersPage() {
    const [data] = React.useState<Order[]>(sampleOrders)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        globalFilterFn: (row, columnId, filterValue) => {
            const searchableRow = row.original as Order
            return (
                searchableRow.id.toLowerCase().includes(filterValue.toLowerCase()) ||
                searchableRow.customer.toLowerCase().includes(filterValue.toLowerCase()) ||
                searchableRow.email.toLowerCase().includes(filterValue.toLowerCase())
            )
        },
    })

    // Calculate stats
    const totalOrders = data.length
    const pendingOrders = data.filter(o => o.status === "Pending").length
    const processingOrders = data.filter(o => o.status === "Processing").length
    const shippedOrders = data.filter(o => o.status === "Shipped").length
    const totalRevenue = data.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0)

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-muted-foreground">
                        View and manage customer orders, track shipments, and process refunds.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <IconPrinter className="mr-2 h-4 w-4" />
                        Print Orders
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <IconPackage className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">All time orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <IconDotsVertical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                        <IconPackage className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{processingOrders}</div>
                        <p className="text-xs text-muted-foreground">Being prepared</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <IconCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Total revenue</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <TabsList>
                        <TabsTrigger value="all">All Orders</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="processing">Processing</TabsTrigger>
                        <TabsTrigger value="shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-8 w-full lg:w-[280px]"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Columns
                                    <IconChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px]">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <TabsContent value="all" className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="flex items-center gap-6 lg:gap-8">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Rows per page</p>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => table.setPageSize(Number(value))}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {table.getState().pagination.pageIndex + 1} of{" "}
                                {table.getPageCount()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hidden h-8 w-8 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <IconChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <IconChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <IconChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hidden h-8 w-8 lg:flex"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <IconChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}