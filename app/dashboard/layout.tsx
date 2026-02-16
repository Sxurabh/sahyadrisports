import { cookies } from "next/headers"
import { AppSidebar } from '@/components/app-sidebar'
import {
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar'
import { getUser } from '@/lib/auth'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    const user = await getUser()

    return (
        <SidebarProvider
            defaultOpen={defaultOpen}
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" user={user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
