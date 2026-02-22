// app/dashboard/reports/inventory/inventory-report-client.tsx
"use client"

import * as React from "react"
import { IconDownload, IconPackage, IconAlertTriangle, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function InventoryReportClient({ data }: { data: any }) {
    const { totalSKUs, inStock, lowStock, outOfStock, stockData, categoryDistribution, lowStockAlerts } = data;

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Report</h1>
                    <p className="text-muted-foreground">
                        Comprehensive overview of your stock levels and inventory health.
                    </p>
                </div>
                <Button onClick={() => toast.success("Report downloaded")}>
                    <IconDownload className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
                        <IconPackage className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSKUs}</div>
                        <p className="text-xs text-muted-foreground">Active products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                        <IconTrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inStock}</div>
                        <p className="text-xs text-muted-foreground">{totalSKUs > 0 ? ((inStock / totalSKUs) * 100).toFixed(1) : 0}% of inventory</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStock}</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <IconTrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outOfStock}</div>
                        <p className="text-xs text-muted-foreground">Urgent restock needed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Status by Category</CardTitle>
                        <CardDescription>Breakdown of inventory health across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stockData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="inStock" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="In Stock" />
                                <Bar dataKey="lowStock" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Low Stock" />
                                <Bar dataKey="outOfStock" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Out of Stock" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Product count by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {categoryDistribution.map((cat: any) => (
                                <div key={cat.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span>{cat.name}</span>
                                    </div>
                                    <span className="font-medium">{totalSKUs > 0 ? ((cat.value / totalSKUs) * 100).toFixed(1) : 0}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
                        Low Stock Alerts
                    </CardTitle>
                    <CardDescription>Products that need immediate restocking</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {lowStockAlerts.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">No low stock alerts right now.</div>
                        ) : (
                            lowStockAlerts.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.category}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-medium text-red-600">{item.stock} units</p>
                                            <p className="text-xs text-muted-foreground">Min: {item.threshold}</p>
                                        </div>
                                        <Button size="sm">Restock</Button>
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
