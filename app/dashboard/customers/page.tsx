"use client"

import * as React from "react"
import {
    IconDotsVertical, IconMail, IconPhone, IconSearch, IconUser, IconStar, IconChevronDown,
    IconPlus, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight,
    IconUserEdit, IconX, IconDownload
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { getCustomers, addCustomer, updateCustomer, deleteCustomer, type Customer } from "@/app/actions"

export default function CustomersPage() {
    const [data, setData] = React.useState<Customer[]>([])
    const [loading, setLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

    const [isAddCustomerOpen, setIsAddCustomerOpen] = React.useState(false)
    const [isEditCustomerOpen, setIsEditCustomerOpen] = React.useState(false)
    const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null)

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
                <div className="flex justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                    />
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: () => <div className="text-center">Customer</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={row.original.avatar} />
                            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <div className="font-medium">{row.original.name}</div>
                            <div className="text-muted-foreground text-xs">{row.original.email}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: () => <div className="text-center">Phone</div>,
            cell: ({ row }) => <div className="text-center text-sm">{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "orders",
            header: () => <div className="text-center">Orders</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.getValue("orders")}</div>,
        },
        {
            accessorKey: "totalSpent",
            header: () => <div className="text-center">Total Spent</div>,
            cell: ({ row }) => {
                const val = parseFloat(row.getValue("totalSpent"))
                return <div className="text-center font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val)}</div>
            },
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return <div className="flex justify-center"><Badge variant={status === "VIP" ? "default" : "secondary"}>{status}</Badge></div>
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
                            <DropdownMenuItem onClick={() => toast.info(`Viewing ${row.original.name}`)}>
                                <IconUser className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setEditingCustomer(row.original)
                                setIsEditCustomerOpen(true)
                            }}>
                                <IconUserEdit className="mr-2 h-4 w-4" /> Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        await deleteCustomer(row.original.id)
                                        toast.success("Customer deleted successfully")
                                        window.location.reload()
                                    } catch (error) {
                                        toast.error("Failed to delete customer")
                                    }
                                }}
                                className="text-destructive"
                            >
                                <IconX className="mr-2 h-4 w-4" /> Delete Customer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data, columns, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), state: { sorting, globalFilter, pagination },
        onGlobalFilterChange: setGlobalFilter, onPaginationChange: setPagination,
        globalFilterFn: (row, columnId, filterValue) => {
            const c = row.original as Customer
            return c.name.toLowerCase().includes(filterValue.toLowerCase()) || c.email.toLowerCase().includes(filterValue.toLowerCase())
        },
    })

    async function handleAddSubmit(formData: FormData) {
        try {
            await addCustomer(formData)
            toast.success("Customer added successfully")
            setIsAddCustomerOpen(false)
            window.location.reload()
        } catch (error) {
            toast.error("Failed to add customer")
        }
    }

    async function handleEditSubmit(formData: FormData) {
        if (!editingCustomer) return
        try {
            await updateCustomer(editingCustomer.id, formData)
            toast.success("Customer updated successfully")
            setIsEditCustomerOpen(false)
            setEditingCustomer(null)
            window.location.reload()
        } catch (error) {
            toast.error("Failed to update customer")
        }
    }

    function handleExport() {
        const headers = ["Customer ID", "Name", "Email", "Phone", "Orders", "Total Spent ($)", "Status"]
        const rowsToExport = table.getFilteredRowModel().rows.map(row => row.original)

        if (rowsToExport.length === 0) {
            toast.error("No data to export")
            return
        }

        const csvContent = [
            headers.join(","),
            ...rowsToExport.map(c => [
                `"${c.id}"`, `"${c.name.replace(/"/g, '""')}"`, `"${c.email}"`, `"${c.phone}"`,
                `"${c.orders}"`, `"${c.totalSpent}"`, `"${c.status}"`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Customers exported successfully")
    }

    if (loading) return <div className="p-8 text-center">Loading customers...</div>

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer base.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="pl-8 w-[250px]"
                        />
                    </div>
                    <Button variant="outline" onClick={handleExport}><IconDownload className="mr-2 h-4 w-4" /> Export</Button>
                    <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                        <DialogTrigger asChild>
                            <Button><IconPlus className="mr-2 h-4 w-4" /> Add Customer</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form action={handleAddSubmit} className="grid gap-4 py-4">
                                <DialogHeader>
                                    <DialogTitle>Add Customer</DialogTitle>
                                    <DialogDescription>Create a new customer profile.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="req-name" className="text-right">Name</Label>
                                    <Input id="req-name" name="name" className="col-span-3" placeholder="Full Name" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="req-email" className="text-right">Email</Label>
                                    <Input id="req-email" name="email" type="email" className="col-span-3" placeholder="email@example.com" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="req-phone" className="text-right">Phone</Label>
                                    <Input id="req-phone" name="phone" type="tel" className="col-span-3" placeholder="+1234567890" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Customer</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Dialog */}
                    <Dialog open={isEditCustomerOpen} onOpenChange={(open) => {
                        setIsEditCustomerOpen(open)
                        if (!open) setEditingCustomer(null)
                    }}>
                        <DialogContent className="sm:max-w-[425px]">
                            {editingCustomer && (
                                <form action={handleEditSubmit} className="grid gap-4 py-4">
                                    <DialogHeader>
                                        <DialogTitle>Edit Customer</DialogTitle>
                                        <DialogDescription>Update customer profile details.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                                        <Input id="edit-name" name="name" defaultValue={editingCustomer.name} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-email" className="text-right">Email</Label>
                                        <Input id="edit-email" name="email" type="email" defaultValue={editingCustomer.email} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                                        <Input id="edit-phone" name="phone" type="tel" defaultValue={editingCustomer.phone || ""} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-status" className="text-right">Status</Label>
                                        <Select name="status" defaultValue={editingCustomer.status} required>
                                            <SelectTrigger id="edit-status" className="col-span-3">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                                <SelectItem value="VIP">VIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Update Customer</Button>
                                    </DialogFooter>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>

                </div>
            </div>

            <div className="flex flex-col gap-4 overflow-auto">
                <div className="rounded-md border min-w-[800px]">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(hg => (
                                <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
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
        </div>
    )
}