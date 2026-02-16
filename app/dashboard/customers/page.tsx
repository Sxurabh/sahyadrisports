"use client"

import * as React from "react"
import {
    IconDotsVertical, IconMail, IconPhone, IconSearch, IconUser, IconStar, IconChevronDown
} from "@tabler/icons-react"
import {
    flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
    getFilteredRowModel, useReactTable, type ColumnDef, type SortingState,
    type ColumnFiltersState, type VisibilityState
} from "@tanstack/react-table"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { getCustomers, type Customer } from "@/app/actions"

export default function CustomersPage() {
    const [data, setData] = React.useState<Customer[]>([])
    const [loading, setLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")

    React.useEffect(() => {
        async function load() {
            try {
                const customers = await getCustomers()
                setData(customers)
            } catch (e) {
                toast.error("Failed to load customers")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const columns: ColumnDef<Customer>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                />
            ),
        },
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={row.original.avatar} />
                        <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        <div className="text-muted-foreground text-xs">{row.original.email}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div className="text-sm">{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "orders",
            header: "Orders",
            cell: ({ row }) => <div className="text-center font-medium">{row.getValue("orders")}</div>,
        },
        {
            accessorKey: "totalSpent",
            header: "Total Spent",
            cell: ({ row }) => {
                const val = parseFloat(row.getValue("totalSpent"))
                return <div className="text-right font-medium">${val.toFixed(2)}</div>
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return <Badge variant={status === "VIP" ? "default" : "secondary"}>{status}</Badge>
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
                        <DropdownMenuItem onClick={() => toast.info(`Viewing ${row.original.name}`)}>
                            <IconUser className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const table = useReactTable({
        data, columns, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), state: { sorting, globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const c = row.original as Customer
            return c.name.toLowerCase().includes(filterValue.toLowerCase()) || c.email.toLowerCase().includes(filterValue.toLowerCase())
        },
    })

    if (loading) return <div className="p-8 text-center">Loading customers...</div>

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer base.</p>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
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