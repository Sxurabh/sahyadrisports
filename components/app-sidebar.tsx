"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

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
  user: {
    name: "Admin User",
    email: "admin@sportshop.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Sales Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Orders",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Customers",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Inventory",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Low Stock Alert",
          url: "#",
        },
        {
          title: "Stock Levels",
          url: "#",
        },
      ],
    },
    {
      title: "Marketing",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Campaigns",
          url: "#",
        },
        {
          title: "Promotions",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Sales Reports",
          url: "#",
        },
        {
          title: "Performance",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Inventory Management",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Sales Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Documentation",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">SportsPro Shop</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
