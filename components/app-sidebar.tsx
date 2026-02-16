// components/app-sidebar.tsx
"use client"

import * as React from "react"
import {
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconPackage,
  IconReport,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react"
import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/dashboard/inventory",
      icon: IconPackage,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Sales Analytics",
      url: "/dashboard/analytics",
      icon: IconTrendingUp,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Inventory Report",
      url: "/dashboard/reports/inventory",
      icon: IconDatabase,
    },
    {
      name: "Sales Reports",
      url: "/dashboard/reports/sales",
      icon: IconReport,
    },
    {
      name: "Documentation",
      url: "/dashboard/docs",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User | null }) {
  const pathname = usePathname()
  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Sahyadri Sports</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
        <NavDocuments items={data.documents} pathname={pathname} />
        <NavSecondary items={data.navSecondary} pathname={pathname} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}