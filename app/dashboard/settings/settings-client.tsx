// app/dashboard/settings/settings-client.tsx
"use client"

import * as React from "react"
import { IconBell, IconBuildingStore, IconCreditCard, IconLock, IconMail, IconPalette, IconUser, IconShield, IconDeviceMobile } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { useSidebar } from "@/components/ui/sidebar"
import { flushSync } from "react-dom"

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
import { updateAppSetting, updatePassword } from "@/app/actions"

export function SettingsClient({ settings }: { settings: Record<string, any> }) {
    const { theme, setTheme } = useTheme()
    const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar()
    const isSidebarCollapsed = sidebarState === "collapsed"

    // Fallback store info in case settings.store_info is missing initially
    const storeInfo = settings?.store_info || {
        name: "Sahyadri Sports",
        email: "contact@sahyadrisports.com",
        address: "123 Sports Lane, Mumbai, Maharashtra 400001",
        phone: "+91 22 1234 5678",
        currency: "INR (₹)"
    }

    const handleSaveStoreInfo = async (formData: FormData) => {
        try {
            const newStoreInfo = {
                name: formData.get('name'),
                email: formData.get('email'),
                address: formData.get('address'),
                phone: formData.get('phone'),
                currency: formData.get('currency'),
            }
            await updateAppSetting('store_info', newStoreInfo)
            toast.success("Store information updated successfully")
        } catch (e: any) {
            toast.error(e.message || "Failed to update store info")
        }
    }

    const handleUpdatePassword = async (formData: FormData) => {
        const newPassword = formData.get('new-password') as string
        const confirmPassword = formData.get('confirm-password') as string

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            await updatePassword(newPassword)
            toast.success("Password updated successfully. You may need to log in again on other devices.")
            // Reset form
            const form = document.getElementById("passwordForm") as HTMLFormElement
            if (form) form.reset()
        } catch (e: any) {
            toast.error(e.message || "Failed to update password")
        }
    }

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
                        <CardContent>
                            <form action={handleSaveStoreInfo} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="store-name">Store Name</Label>
                                        <Input id="store-name" name="name" defaultValue={storeInfo.name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="store-email">Store Email</Label>
                                        <Input id="store-email" name="email" type="email" defaultValue={storeInfo.email} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="store-address">Store Address</Label>
                                    <Input id="store-address" name="address" defaultValue={storeInfo.address} required />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="store-phone">Phone Number</Label>
                                        <Input id="store-phone" name="phone" defaultValue={storeInfo.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="store-currency">Currency</Label>
                                        <Input id="store-currency" name="currency" defaultValue={storeInfo.currency} readOnly className="bg-muted cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
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
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => {
                                        if (!document.startViewTransition) {
                                            setTheme(checked ? 'dark' : 'light')
                                            return
                                        }
                                        document.startViewTransition(() => {
                                            flushSync(() => {
                                                setTheme(checked ? 'dark' : 'light')
                                            })
                                        })
                                    }}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Sidebar Icons Only</Label>
                                    <p className="text-sm text-muted-foreground">Collapse sidebar to show only icons</p>
                                </div>
                                <Switch
                                    checked={isSidebarCollapsed}
                                    onCheckedChange={(checked) => setSidebarOpen(!checked)}
                                />
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
                                Choose how you want to be notified about store activities. (Placeholder)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 opacity-70">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New Orders</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                                </div>
                                <Switch defaultChecked disabled />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Low Stock Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                                </div>
                                <Switch defaultChecked disabled />
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
                        <CardContent>
                            <form id="passwordForm" action={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password (optional)</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" name="new-password" type="password" required minLength={6} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" name="confirm-password" type="password" required minLength={6} />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">
                                        Update Password
                                    </Button>
                                </div>
                            </form>
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
                        <CardContent className="space-y-4 opacity-70">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable 2FA</Label>
                                    <p className="text-sm text-muted-foreground">Require a verification code when logging in (Configured via Supabase Console limits)</p>
                                </div>
                                <Switch disabled />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconCreditCard className="h-5 w-5" />
                                Billing & Payments
                            </CardTitle>
                            <CardDescription>
                                Billing integration coming soon.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 opacity-70">
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <p className="text-center text-sm">Payment gateway integration is currently inactive.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
