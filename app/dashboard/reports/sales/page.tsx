// app/dashboard/reports/sales/page.tsx
"use client"

import * as React from "react"
import { IconDownload, IconTrendingUp, IconTrendingDown, IconCalendar } from "@tabler/icons-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const dailySales = [
    { date: "Mon", sales: 4200, orders: 45 },
    { date: "Tue", sales: 5100, orders: 52 },
    { date: "Wed", sales: 4800, orders: 48 },
    { date: "Thu", sales: 6200, orders: 65 },
    { date: "Fri", sales: 7500, orders: 78 },
    { date: "Sat", sales: 8900, orders: 92 },
    { date: "Sun", sales: 7200, orders: 74 },
]

const monthlyTrend = [
    { month: "Aug", sales: 65000, target: 60000 },
    { month: "Sep", sales: 72000, target: 70000 },
    { month: "Oct", sales: 81000, target: 75000 },
    { month: "Nov", sales: 95000, target: 90000 },
    { month: "Dec", sales: 118000, target: 110000 },
    { month: "Jan", sales: 84200, target: 85000 },
]

export default function SalesReportPage() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Report</h1>
                    <p className="text-muted-foreground">
                        Detailed analysis of your sales performance and revenue trends.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <IconCalendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button onClick={() => toast.success("Report downloaded")}>
                        <IconDownload className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid gap-4 md:grid-cols-4">
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
                        <p className="text-xs text-muted-foreground">vs $74,800 last month</p>
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
                        <p className="text-xs text-muted-foreground">vs 2,112 last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +3.8%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$36.85</div>
                        <p className="text-xs text-muted-foreground">vs $35.50 last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingDown className="mr-1 h-3 w-3" />
                            -2.1%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.2%</div>
                        <p className="text-xs text-muted-foreground">vs 5.3% last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Sales (This Week)</CardTitle>
                        <CardDescription>Revenue and order count by day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailySales}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                                <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sales vs Target</CardTitle>
                        <CardDescription>Monthly performance against targets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip formatter={(value) => [`$${value}`, ""]} />
                                <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Actual Sales" />
                                <Line type="monotone" dataKey="target" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>Best sellers by revenue this month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { name: "Nike Air Max 90", revenue: 12450, units: 104, growth: "+15%" },
                            { name: "Adidas Ultraboost 22", revenue: 10800, units: 60, growth: "+8%" },
                            { name: "Dri-FIT Training Shirt", revenue: 9200, units: 205, growth: "+22%" },
                            { name: "Basketball Pro Jersey", revenue: 7800, units: 120, growth: "+5%" },
                            { name: "Running Shorts", revenue: 6500, units: 167, growth: "+12%" },
                        ].map((product, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">${product.revenue.toLocaleString()}</p>
                                    <Badge variant="outline" className="text-green-600 text-xs">
                                        {product.growth}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}