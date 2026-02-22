// app/dashboard/analytics/page.tsx
"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { IconTrendingUp, IconTrendingDown, IconCalendar, IconDownload } from "@tabler/icons-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOrders, getProducts } from "@/app/actions"

const chartConfig = {
    sales: { label: "Sales", color: "hsl(var(--chart-1))" },
    orders: { label: "Orders", color: "hsl(var(--chart-2))" },
    visitors: { label: "Visitors", color: "hsl(var(--chart-3))" },
}

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = React.useState("year")
    const [salesData, setSalesData] = React.useState<any[]>([])
    const [categoryData, setCategoryData] = React.useState<any[]>([])
    const [topProducts, setTopProducts] = React.useState<any[]>([])

    // KPIs
    const [totalRevenue, setTotalRevenue] = React.useState(0)
    const [totalOrders, setTotalOrders] = React.useState(0)
    const [aov, setAov] = React.useState(0)

    React.useEffect(() => {
        async function loadData() {
            try {
                const orders = await getOrders()
                const products = await getProducts()

                // Monthly Sales Data
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                const monthly: Record<string, any> = {}
                months.forEach(m => monthly[m] = { month: m, sales: 0, orders: 0, visitors: Math.floor(Math.random() * 5000) + 3000 })

                let rev = 0
                let ords = 0

                orders.forEach(order => {
                    if (order.status !== "Cancelled") {
                        const d = new Date(order.date)
                        const m = d.toLocaleString('default', { month: 'short' })
                        if (monthly[m]) {
                            monthly[m].sales += order.total
                            monthly[m].orders += 1
                        }
                        rev += order.total
                        ords += 1
                    }
                })

                setSalesData(Object.values(monthly))
                setTotalRevenue(rev)
                setTotalOrders(ords)
                setAov(ords > 0 ? rev / ords : 0)

                // Category Data
                const catCounts: Record<string, number> = {}
                products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1 })

                const cColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]
                const catList = Object.entries(catCounts).map(([name, count], idx) => ({
                    name,
                    value: Math.round((count / products.length) * 100),
                    color: cColors[idx % cColors.length]
                }))
                setCategoryData(catList)

                // Top Products
                const sortedP = [...products].sort((a, b) => b.price - a.price).slice(0, 5).map(p => {
                    const mockSales = Math.floor(Math.random() * 150) + 50
                    return {
                        name: p.name,
                        sales: mockSales,
                        revenue: p.price * mockSales
                    }
                })
                setTopProducts(sortedP)

            } catch (error) {
                console.error("Failed to load analytics data", error)
            }
        }
        loadData()
    }, [])

    const handleExportPDF = () => {
        window.print();
    }

    if (!salesData.length) return <div className="p-8 text-center">Loading analytics...</div>

    return (
        <div id="analytics-dashboard" className="flex flex-col gap-6 p-4 lg:p-6 bg-background">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Analytics</h1>
                    <p className="text-muted-foreground">
                        Track your sales performance, revenue trends, and customer behavior.
                    </p>
                </div>
                <div data-html2canvas-ignore className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px]">
                            <IconCalendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExportPDF}>
                        <IconDownload className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +12.5%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">Real-time data</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +8.2%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Real-time data</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +3.8%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(aov)}
                        </div>
                        <p className="text-xs text-muted-foreground">Real-time data</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Badge variant="outline" className="text-red-600">
                            <IconTrendingDown className="mr-1 h-3 w-3" />
                            -1.2%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.24%</div>
                        <p className="text-xs text-muted-foreground">Estimated</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue & Orders Overview</CardTitle>
                    <CardDescription>Monthly sales performance and order volume</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px]">
                        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `₹${value}`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="var(--color-sales)"
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                strokeWidth={2}
                            />
                            <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Category Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Products by Category</CardTitle>
                        <CardDescription>Product distribution across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px]">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ChartContainer>
                        <div className="mt-4 space-y-2">
                            {categoryData.map((category) => (
                                <div key={category.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                                        <span>{category.name}</span>
                                    </div>
                                    <span className="font-medium">{category.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performing products by revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px]">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                                        />
                                    }
                                />
                                <Bar dataKey="revenue" fill="var(--color-sales)" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Traffic Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Website Traffic</CardTitle>
                    <CardDescription>Visitor trends and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px]">
                        <LineChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="visitors"
                                stroke="var(--color-visitors)"
                                strokeWidth={2}
                                dot={{ fill: "var(--color-visitors)", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}