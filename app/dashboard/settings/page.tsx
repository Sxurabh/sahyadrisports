// app/dashboard/settings/page.tsx
"use client"

import * as React from "react"
import { IconBell, IconBuildingStore, IconCreditCard, IconLock, IconMail, IconPalette, IconUser, IconShield, IconDeviceMobile } from "@tabler/icons-react"

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your store settings, preferences, and account details.
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconBuildingStore className="h-5 w-5" />
                                Store Information
                            </CardTitle>
                            <CardDescription>
                                Update your store details and contact information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="store-name">Store Name</Label>
                                    <Input id="store-name" defaultValue="Sahyadri Sports" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="store-email">Store Email</Label>
                                    <Input id="store-email" type="email" defaultValue="contact@sahyadrisports.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store-address">Store Address</Label>
                                <Input id="store-address" defaultValue="123 Sports Lane, Mumbai, Maharashtra 400001" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="store-phone">Phone Number</Label>
                                    <Input id="store-phone" defaultValue="+91 22 1234 5678" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="store-currency">Currency</Label>
                                    <Input id="store-currency" defaultValue="INR (₹)" disabled />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => toast.success("Store information updated")}>
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconPalette className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize the look and feel of your admin dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">Enable dark mode for the dashboard</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Compact Mode</Label>
                                    <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Sidebar Icons Only</Label>
                                    <p className="text-sm text-muted-foreground">Show only icons in the sidebar</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconBell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Choose how you want to be notified about store activities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New Orders</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Low Stock Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Customer Reviews</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about new customer reviews</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive email summaries of daily activities</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconLock className="h-5 w-5" />
                                Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => toast.success("Password updated successfully")}>
                                    Update Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconShield className="h-5 w-5" />
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>
                                Add an extra layer of security to your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable 2FA</Label>
                                    <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconCreditCard className="h-5 w-5" />
                                Payment Methods
                            </CardTitle>
                            <CardDescription>
                                Manage your payment methods and billing information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center text-xs font-medium">
                                            VISA
                                        </div>
                                        <div>
                                            <p className="font-medium">Visa ending in 4242</p>
                                            <p className="text-sm text-muted-foreground">Expires 12/25</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>Default</Badge>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                <IconCreditCard className="mr-2 h-4 w-4" />
                                Add Payment Method
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconDeviceMobile className="h-5 w-5" />
                                Billing History
                            </CardTitle>
                            <CardDescription>
                                View your past invoices and payment history.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { date: "Jan 1, 2024", amount: "₹2,999", status: "Paid", desc: "Pro Plan - Monthly" },
                                    { date: "Dec 1, 2023", amount: "₹2,999", status: "Paid", desc: "Pro Plan - Monthly" },
                                    { date: "Nov 1, 2023", amount: "₹2,999", status: "Paid", desc: "Pro Plan - Monthly" },
                                ].map((invoice, i) => (
                                    <div key={i} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="font-medium">{invoice.desc}</p>
                                            <p className="text-sm text-muted-foreground">{invoice.date}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">{invoice.amount}</span>
                                            <Badge variant="outline">{invoice.status}</Badge>
                                            <Button variant="ghost" size="sm">Download</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}