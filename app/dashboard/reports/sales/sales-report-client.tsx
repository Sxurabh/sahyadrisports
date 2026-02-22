// app/dashboard/reports/sales/sales-report-client.tsx
"use client"

import * as React from "react"
import { IconDownload, IconTrendingUp, IconTrendingDown, IconCalendar } from "@tabler/icons-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function SalesReportClient({ data }: { data: any }) {
    const { totalRevenue, totalOrders, avgOrderValue, returnRate, dailySales, topProducts } = data;

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
                        Last 7 Days
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
                        <CardTitle className="text-sm font-medium">Total Revenue (All Time)</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +--%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +--%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingUp className="mr-1 h-3 w-3" />
                            +--%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{avgOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                        <Badge variant="outline" className="text-green-600">
                            <IconTrendingDown className="mr-1 h-3 w-3" />
                            --%
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{returnRate}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
                        <CardDescription>Revenue by day</CardDescription>
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
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip formatter={(value) => [`₹${value}`, "Sales"]} />
                                <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>Best sellers by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProducts.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">No grossing products to display yet.</div>
                        ) : (
                            topProducts.map((product: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium line-clamp-1">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                                        </div>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="font-medium">₹{product.revenue.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
