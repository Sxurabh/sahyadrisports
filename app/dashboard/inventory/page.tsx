// app/dashboard/inventory/page.tsx
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
    IconFilter,
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

// Product type definition
type Product = {
    id: string
    name: string
    category: string
    status: "In Stock" | "Low Stock" | "Out of Stock"
    stock: number
    price: number
    manager: string
    sku: string
    brand: string
}

// Sample data - replace with your actual data fetching
const sampleProducts: Product[] = [
    {
        id: "1",
        name: "Nike Air Max 90",
        category: "Footwear",
        status: "In Stock",
        stock: 145,
        price: 120,
        manager: "John Smith",
        sku: "NK-AM90-001",
        brand: "Nike",
    },
    {
        id: "2",
        name: "Adidas Ultraboost 22",
        category: "Footwear",
        status: "In Stock",
        stock: 89,
        price: 180,
        manager: "John Smith",
        sku: "AD-UB22-001",
        brand: "Adidas",
    },
    {
        id: "3",
        name: "Puma RS-X",
        category: "Footwear",
        status: "Low Stock",
        stock: 12,
        price: 95,
        manager: "Sarah Wilson",
        sku: "PM-RSX-001",
        brand: "Puma",
    },
    {
        id: "4",
        name: "Dri-FIT Training Shirt",
        category: "Apparel",
        status: "In Stock",
        stock: 234,
        price: 45,
        manager: "Mike Davis",
        sku: "NK-DFTS-001",
        brand: "Nike",
    },
    {
        id: "5",
        name: "Basketball Pro Jersey",
        category: "Apparel",
        status: "Low Stock",
        stock: 28,
        price: 65,
        manager: "Sarah Wilson",
        sku: "BK-JER-001",
        brand: "Generic",
    },
    {
        id: "6",
        name: "Running Shorts",
        category: "Apparel",
        status: "In Stock",
        stock: 156,
        price: 39,
        manager: "Mike Davis",
        sku: "RN-SHT-001",
        brand: "Generic",
    },
    {
        id: "7",
        name: "Sports Water Bottle",
        category: "Accessories",
        status: "In Stock",
        stock: 445,
        price: 25,
        manager: "Emily Brown",
        sku: "AC-WB-001",
        brand: "Generic",
    },
    {
        id: "8",
        name: "Yoga Mat Premium",
        category: "Equipment",
        status: "In Stock",
        stock: 67,
        price: 55,
        manager: "Emily Brown",
        sku: "EQ-YM-001",
        brand: "Generic",
    },
    {
        id: "9",
        name: "Gym Dumbbells Set",
        category: "Equipment",
        status: "In Stock",
        stock: 34,
        price: 199,
        manager: "John Smith",
        sku: "EQ-DB-001",
        brand: "Generic",
    },
    {
        id: "10",
        name: "Wireless Sports Headphones",
        category: "Electronics",
        status: "Low Stock",
        stock: 18,
        price: 129,
        manager: "Emily Brown",
        sku: "EL-HP-001",
        brand: "Generic",
    },
]

const columns: ColumnDef<Product>[] = [
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
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => <div className="text-muted-foreground text-xs">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("category")}
            </Badge>
        ),
    },
    {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => <div>{row.getValue("brand")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant={status === "In Stock" ? "default" : status === "Low Stock" ? "secondary" : "destructive"}
                    className="gap-1"
                >
                    {status === "In Stock" ? <IconCircleCheckFilled className="size-3" /> : null}
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "stock",
        header: () => <div className="text-right">Stock</div>,
        cell: ({ row }) => {
            const stock = parseInt(row.getValue("stock"))
            return <div className="text-right font-medium">{stock}</div>
        },
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "manager",
        header: "Manager",
        cell: ({ row }) => <div>{row.getValue("manager")}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

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
                        <DropdownMenuItem onClick={() => toast.info(`Viewing ${product.name}`)}>
                            <IconEye className="mr-2 h-4 w-4" />
                            View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Editing ${product.name}`)}>
                            <IconEdit className="mr-2 h-4 w-4" />
                            Edit product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => toast.success(`Deleted ${product.name}`)}
                            className="text-destructive"
                        >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function InventoryPage() {
    const [data] = React.useState<Product[]>(sampleProducts)
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
            const searchableRow = row.original as Product
            return (
                searchableRow.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                searchableRow.sku.toLowerCase().includes(filterValue.toLowerCase()) ||
                searchableRow.category.toLowerCase().includes(filterValue.toLowerCase()) ||
                searchableRow.brand.toLowerCase().includes(filterValue.toLowerCase())
            )
        },
    })

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">
                        Manage your products, stock levels, and pricing.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <IconPlus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>
                                    Create a new product in your inventory. Fill in all the required fields.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="name" className="col-span-3" placeholder="Product name" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">
                                        Category
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="footwear">Footwear</SelectItem>
                                            <SelectItem value="apparel">Apparel</SelectItem>
                                            <SelectItem value="equipment">Equipment</SelectItem>
                                            <SelectItem value="accessories">Accessories</SelectItem>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">
                                        Price
                                    </Label>
                                    <Input id="price" type="number" className="col-span-3" placeholder="0.00" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="stock" className="text-right">
                                        Stock
                                    </Label>
                                    <Input id="stock" type="number" className="col-span-3" placeholder="0" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={() => toast.success("Product added successfully")}>
                                    Save Product
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline">
                        <IconDownload className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <TabsList>
                        <TabsTrigger value="all">All Products</TabsTrigger>
                        <TabsTrigger value="in-stock">In Stock</TabsTrigger>
                        <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                        <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-8 w-full lg:w-[280px]"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <IconLayoutColumns className="mr-2 h-4 w-4" />
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
                                            No results found.
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

                <TabsContent value="in-stock">
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                        Filtered view: In Stock products only
                    </div>
                </TabsContent>
                <TabsContent value="low-stock">
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                        Filtered view: Low Stock products only
                    </div>
                </TabsContent>
                <TabsContent value="out-of-stock">
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                        Filtered view: Out of Stock products only
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}