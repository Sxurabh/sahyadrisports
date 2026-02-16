// app/dashboard/search/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    IconSearch,
    IconPackage,
    IconShoppingCart,
    IconUser,
    IconFileText,
    IconArrowRight,
    IconX
} from "@tabler/icons-react"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// Mock search results
const mockResults = {
    products: [
        { id: "1", name: "Nike Air Max 90", category: "Footwear", price: 120 },
        { id: "2", name: "Adidas Ultraboost 22", category: "Footwear", price: 180 },
        { id: "3", name: "Dri-FIT Training Shirt", category: "Apparel", price: 45 },
    ],
    orders: [
        { id: "ORD-2024-001", customer: "Rahul Sharma", total: 299.99, status: "Delivered" },
        { id: "ORD-2024-002", customer: "Priya Patel", total: 149.50, status: "Shipped" },
    ],
    customers: [
        { id: "1", name: "Rahul Sharma", email: "rahul@example.com", orders: 12 },
        { id: "2", name: "Priya Patel", email: "priya@example.com", orders: 8 },
    ],
    pages: [
        { title: "Inventory Management", path: "/dashboard/inventory", description: "Manage your product stock" },
        { title: "Orders Management", path: "/dashboard/orders", description: "View and process customer orders" },
        { title: "Sales Analytics", path: "/dashboard/analytics", description: "View sales reports and trends" },
    ]
}

export default function SearchPage() {
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<typeof mockResults | null>(null)
    const [recentSearches, setRecentSearches] = React.useState<string[]>([
        "Nike Air Max",
        "Order ORD-2024-001",
        "Rahul Sharma"
    ])
    const router = useRouter()

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults(null)
            return
        }

        // Simulate search - in real app, this would be an API call
        setResults(mockResults)

        // Add to recent searches if not already there
        if (!recentSearches.includes(searchQuery)) {
            setRecentSearches(prev => [searchQuery, ...prev].slice(0, 5))
        }
    }

    const clearSearch = () => {
        setQuery("")
        setResults(null)
    }

    const removeRecentSearch = (search: string) => {
        setRecentSearches(prev => prev.filter(s => s !== search))
    }

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(query)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Search</h1>
                <p className="text-muted-foreground">
                    Search across products, orders, customers, and pages.
                </p>
            </div>

            <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for products, orders, customers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-lg"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={clearSearch}
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {!results && !query && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h3>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-muted px-3 py-1"
                                    onClick={() => setQuery(search)}
                                >
                                    {search}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-2 hover:bg-transparent"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeRecentSearch(search)
                                        }}
                                    >
                                        <IconX className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Links</h3>
                        <div className="grid gap-2 md:grid-cols-2">
                            {[
                                { icon: IconPackage, label: "View All Products", path: "/dashboard/inventory" },
                                { icon: IconShoppingCart, label: "Recent Orders", path: "/dashboard/orders" },
                                { icon: IconUser, label: "Customer List", path: "/dashboard/customers" },
                                { icon: IconFileText, label: "Sales Reports", path: "/dashboard/analytics" },
                            ].map((link, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    className="justify-start h-auto py-3"
                                    onClick={() => router.push(link.path)}
                                >
                                    <link.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                                    <span className="flex-1 text-left">{link.label}</span>
                                    <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {results && (
                <div className="space-y-6">
                    {/* Products Results */}
                    {results.products.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <IconPackage className="h-5 w-5" />
                                        Products
                                    </CardTitle>
                                    <Badge variant="secondary">{results.products.length} results</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {results.products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                        onClick={() => router.push(`/dashboard/inventory`)}
                                    >
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">${product.price}</span>
                                            <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Orders Results */}
                    {results.orders.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <IconShoppingCart className="h-5 w-5" />
                                        Orders
                                    </CardTitle>
                                    <Badge variant="secondary">{results.orders.length} results</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {results.orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                        onClick={() => router.push(`/dashboard/orders`)}
                                    >
                                        <div>
                                            <p className="font-medium">{order.id}</p>
                                            <p className="text-sm text-muted-foreground">{order.customer}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                                                {order.status}
                                            </Badge>
                                            <span className="font-medium">${order.total}</span>
                                            <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Customers Results */}
                    {results.customers.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <IconUser className="h-5 w-5" />
                                        Customers
                                    </CardTitle>
                                    <Badge variant="secondary">{results.customers.length} results</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {results.customers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                        onClick={() => router.push(`/dashboard/customers`)}
                                    >
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground">{customer.orders} orders</span>
                                            <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Pages Results */}
                    {results.pages.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <IconFileText className="h-5 w-5" />
                                        Pages
                                    </CardTitle>
                                    <Badge variant="secondary">{results.pages.length} results</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {results.pages.map((page, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                                        onClick={() => router.push(page.path)}
                                    >
                                        <div>
                                            <p className="font-medium">{page.title}</p>
                                            <p className="text-sm text-muted-foreground">{page.description}</p>
                                        </div>
                                        <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {results.products.length === 0 && results.orders.length === 0 &&
                        results.customers.length === 0 && results.pages.length === 0 && (
                            <div className="text-center py-12">
                                <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No results found</h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search terms or browse the categories above.
                                </p>
                            </div>
                        )}
                </div>
            )}
        </div>
    )
}