"use client"

import * as React from "react"
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCircleCheckFilled,
    IconDotsVertical,
    IconLayoutColumns,
    IconPlus,
    IconSearch,
    IconTrash,
    IconEdit,
    IconEye,
    IconDownload,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Label } from '@/components/ui/label'
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

// Import Server Actions
import { getProducts, addProduct, updateProduct, deleteProduct, type Product } from "@/app/actions"

export default function InventoryPage() {
    const [data, setData] = React.useState<Product[]>([])
    const [loading, setLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
    const [viewingProduct, setViewingProduct] = React.useState<Product | null>(null)

    // Fetch Data
    const loadInventory = React.useCallback(async () => {
        try {
            const products = await getProducts()
            setData(products)
        } catch (error) {
            toast.error("Failed to load inventory")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadInventory()
    }, [loadInventory])

    // Handle Add
    async function handleAddSubmit(formData: FormData) {
        try {
            await addProduct(formData)
            toast.success("Product added successfully")
            setIsDialogOpen(false)
            loadInventory() // Refresh data
        } catch (error) {
            toast.error("Failed to add product")
        }
    }

    // Handle Edit
    async function handleEditSubmit(formData: FormData) {
        if (!editingProduct) return
        try {
            await updateProduct(editingProduct.id, formData)
            toast.success("Product updated successfully")
            setIsEditDialogOpen(false)
            setEditingProduct(null)
            loadInventory()
        } catch (error) {
            toast.error("Failed to update product")
        }
    }

    // Handle Delete
    async function handleDelete(id: string) {
        try {
            await deleteProduct(id)
            toast.success("Product deleted")
            loadInventory() // Refresh data
        } catch (error) {
            toast.error("Failed to delete product")
        }
    }

    // Handle Export
    function handleExport() {
        const headers = ["ID", "Name", "SKU", "Category", "Brand", "Status", "Stock", "Price", "Manager"]

        // Export currently filtered/sorted data from the table
        const rowsToExport = table.getFilteredRowModel().rows.map(row => row.original)

        if (rowsToExport.length === 0) {
            toast.error("No data to export")
            return
        }

        const csvContent = [
            headers.join(","),
            ...rowsToExport.map(item => [
                `"${item.id}"`,
                `"${item.name.replace(/"/g, '""')}"`, // Escape quotes
                `"${item.sku}"`,
                `"${item.category}"`,
                `"${item.brand}"`,
                `"${item.status}"`,
                `"${item.stock}"`,
                `"${item.price}"`,
                `"${item.manager}"`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Inventory exported successfully")
    }

    const columns: ColumnDef<Product>[] = [
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
            accessorKey: "name",
            header: () => <div className="text-center">Product Name</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "sku",
            header: () => <div className="text-center">SKU</div>,
            cell: ({ row }) => <div className="text-center text-muted-foreground text-xs">{row.getValue("sku")}</div>,
        },
        {
            accessorKey: "category",
            header: () => <div className="text-center">Category</div>,
            cell: ({ row }) => <div className="flex justify-center"><Badge variant="outline" className="capitalize">{row.getValue("category")}</Badge></div>,
        },
        {
            accessorKey: "brand",
            header: () => <div className="text-center">Brand</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue("brand")}</div>,
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <div className="flex justify-center">
                        <Badge
                            variant={status === "In Stock" ? "default" : status === "Low Stock" ? "secondary" : "destructive"}
                            className="gap-1"
                        >
                            {status === "In Stock" ? <IconCircleCheckFilled className="size-3" /> : null}
                            {status}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "stock",
            header: () => <div className="text-center">Stock</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.getValue("stock")}</div>,
        },
        {
            accessorKey: "price",
            header: () => <div className="text-center">Price</div>,
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"))
                const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price)
                return <div className="text-center font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "manager",
            header: () => <div className="text-center">Manager</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue("manager")}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <IconDotsVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                    setViewingProduct(product)
                                    setIsViewDialogOpen(true)
                                }}>
                                    <IconEye className="mr-2 h-4 w-4" /> View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    setEditingProduct(product)
                                    setIsEditDialogOpen(true)
                                }}>
                                    <IconEdit className="mr-2 h-4 w-4" /> Edit product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">
                                    <IconTrash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

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
        state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter, pagination },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        globalFilterFn: (row, columnId, filterValue) => {
            const p = row.original as Product
            const search = filterValue.toLowerCase()
            return p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search)
        },
    })

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage your products, stock levels, and pricing.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><IconPlus className="mr-2 h-4 w-4" /> Add Product</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form action={handleAddSubmit} className="grid gap-4 py-4">
                                <DialogHeader>
                                    <DialogTitle>Add New Product</DialogTitle>
                                    <DialogDescription>Create a new product in your inventory.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" name="name" className="col-span-3" placeholder="Product name" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">Category</Label>
                                    <Select name="category" required>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Footwear">Footwear</SelectItem>
                                            <SelectItem value="Apparel">Apparel</SelectItem>
                                            <SelectItem value="Equipment">Equipment</SelectItem>
                                            <SelectItem value="Accessories">Accessories</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">Price</Label>
                                    <Input id="price" name="price" type="number" step="0.01" className="col-span-3" placeholder="0.00" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="stock" className="text-right">Stock</Label>
                                    <Input id="stock" name="stock" type="number" className="col-span-3" placeholder="0" required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Product</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* View Product Dialog */}
                    <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
                        setIsViewDialogOpen(open)
                        if (!open) setViewingProduct(null)
                    }}>
                        <DialogContent className="sm:max-w-[425px]">
                            {viewingProduct && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>View Product</DialogTitle>
                                        <DialogDescription>Details for {viewingProduct.name}.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">Name:</span>
                                            <span className="col-span-3">{viewingProduct.name}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">SKU:</span>
                                            <span className="col-span-3">{viewingProduct.sku}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">Brand:</span>
                                            <span className="col-span-3">{viewingProduct.brand}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">Category:</span>
                                            <span className="col-span-3 capitalize">{viewingProduct.category}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">Status:</span>
                                            <span className="col-span-3">
                                                <Badge
                                                    variant={viewingProduct.status === "In Stock" ? "default" : viewingProduct.status === "Low Stock" ? "secondary" : "destructive"}
                                                >
                                                    {viewingProduct.status}
                                                </Badge>
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">Price:</span>
                                            <span className="col-span-3 text-lg font-semibold tabular-nums">
                                                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(viewingProduct.price)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <span className="font-medium text-right text-muted-foreground">Stock:</span>
                                            <span className="col-span-3">{viewingProduct.stock} units</span>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Edit Product Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (!open) setEditingProduct(null)
                    }}>
                        <DialogContent className="sm:max-w-[425px]">
                            {editingProduct && (
                                <form action={handleEditSubmit} className="grid gap-4 py-4">
                                    <DialogHeader>
                                        <DialogTitle>Edit Product</DialogTitle>
                                        <DialogDescription>Update details for {editingProduct.name}.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                                        <Input id="edit-name" name="name" defaultValue={editingProduct.name} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-category" className="text-right">Category</Label>
                                        <Select name="category" defaultValue={editingProduct.category} required>
                                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Footwear">Footwear</SelectItem>
                                                <SelectItem value="Apparel">Apparel</SelectItem>
                                                <SelectItem value="Equipment">Equipment</SelectItem>
                                                <SelectItem value="Accessories">Accessories</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-price" className="text-right">Price</Label>
                                        <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={editingProduct.price} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                                        <Input id="edit-stock" name="stock" type="number" defaultValue={editingProduct.stock} className="col-span-3" required />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Update Product</Button>
                                    </DialogFooter>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <IconLayoutColumns className="mr-2 h-4 w-4" />
                                <span className="hidden lg:inline">Customize Columns</span>
                                <span className="lg:hidden">Columns</span>
                                <IconChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={handleExport}><IconDownload className="mr-2 h-4 w-4" /> Export</Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    <TabsTrigger value="in-stock">In Stock</TabsTrigger>
                    <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                </TabsList>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative">
                        <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-8 w-full lg:w-[280px]"
                        />
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
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                </TabsContent>
            </Tabs>
        </div>
    )
}