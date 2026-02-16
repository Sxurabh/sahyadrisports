// app/dashboard/analytics/page.tsx
"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { IconTrendingUp, IconTrendingDown, IconCalendar, IconDownload } from "@tabler/icons-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Sample data for charts
const salesData = [
    { month: "Jan", sales: 4500, orders: 120, visitors: 3400 },
    { month: "Feb", sales: 5200, orders: 145, visitors: 4100 },
    { month: "Mar", sales: 4800, orders: 132, visitors: 3800 },
    { month: "Apr", sales: 6100, orders: 168, visitors: 5200 },
    { month: "May", sales: 7200, orders: 195, visitors: 6100 },
    { month: "Jun", sales: 6800, orders: 182, visitors: 5800 },
    { month: "Jul", sales: 8100, orders: 220, visitors: 7200 },
    { month: "Aug", sales: 7900, orders: 215, visitors: 6900 },
    { month: "Sep", sales: 8500, orders: 235, visitors: 7500 },
    { month: "Oct", sales: 9200, orders: 258, visitors: 8200 },
    { month: "Nov", sales: 10500, orders: 290, visitors: 9500 },
    { month: "Dec", sales: 11800, orders: 325, visitors: 10800 },
]

const categoryData = [
    { name: "Footwear", value: 35, color: "hsl(var(--chart-1))" },
    { name: "Apparel", value: 28, color: "hsl(var(--chart-2))" },
    { name: "Equipment", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Accessories", value: 12, color: "hsl(var(--chart-4))" },
    { name: "Electronics", value: 5, color: "hsl(var(--chart-5))" },
]

const topProducts = [
    { name: "Nike Air Max 90", sales: 245, revenue: 29400 },
    { name: "Adidas Ultraboost 22", sales: 189, revenue: 34020 },
    { name: "Dri-FIT Training Shirt", sales: 456, revenue: 20520 },
    { name: "Basketball Pro Jersey", sales: 178, revenue: 11570 },
    { name: "Running Shorts", sales: 312, revenue: 12168 },
]

const chartConfig = {
    sales: {
        label: "Sales",
        color: "hsl(var(--chart-1))",
    },
    orders: {
        label: "Orders",
        color: "hsl(var(--chart-2))",
    },
    visitors: {
        label: "Visitors",
        color: "hsl(var(--chart-3))",
    },
}

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = React.useState("year")

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Analytics</h1>
                    <p className="text-muted-foreground">
                        Track your sales performance, revenue trends, and customer behavior.
                    </p>
                </div>
                <div className="flex items-center gap-2">
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
                    <Button variant="outline">
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
                        <div className="text-2xl font-bold">$84,200</div>
                        <p className="text-xs text-muted-foreground">vs $74,800 last period</p>
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
                        <div className="text-2xl font-bold">2,285</div>
                        <p className="text-xs text-muted-foreground">vs 2,112 last period</p>
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
                        <div className="text-2xl font-bold">$36.85</div>
                        <p className="text-xs text-muted-foreground">vs $35.50 last period</p>
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
                        <p className="text-xs text-muted-foreground">vs 3.28% last period</p>
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
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
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
                        <CardTitle>Sales by Category</CardTitle>
                        <CardDescription>Revenue distribution across product categories</CardDescription>
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
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
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