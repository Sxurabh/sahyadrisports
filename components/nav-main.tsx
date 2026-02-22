// components/nav-main.tsx
"use client"

import * as React from "react"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { QuickCreateModal } from "./quick-create-modal" // Added QuickCreateModal import

export function NavMain({
  items,
  pathname,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
  }[]
  pathname: string
}) {
  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false) // Added state for QuickCreateModal

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground min-w-8 duration-300 ease-in-out"
              onClick={() => setQuickCreateOpen(true)}
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                >
                  <Link href={item.url} className={cn(isActive && "font-medium")}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
      <QuickCreateModal open={quickCreateOpen} onOpenChange={setQuickCreateOpen} />
    </SidebarGroup>
  )
}