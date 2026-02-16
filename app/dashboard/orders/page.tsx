"use client"

import * as React from "react"
import {
    IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight,
    IconDotsVertical, IconEye, IconPackage, IconPrinter, IconSearch,
    IconTruck, IconCheck, IconX, IconChevronDown
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { getOrders, type Order } from "@/app/actions"

export default function OrdersPage() {
    const [data, setData] = React.useState<Order[]>([])
    const [loading, setLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

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
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
                const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)
                return <div className="text-right font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                    "Delivered": "default", "Shipped": "secondary", "Processing": "secondary",
                    "Pending": "outline", "Cancelled": "destructive",
                }
                return (
                    <Badge variant={variants[status] || "default"}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><IconDotsVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info(`View details for ${row.original.id}`)}>
                            <IconEye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const table = useReactTable({
        data, columns, onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
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

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalOrders}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{pendingOrders}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${revenue.toFixed(2)}</CardContent></Card>
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
        </div>
    )
}