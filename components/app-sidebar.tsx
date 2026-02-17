"use client"

import { useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/app/(cms)/components/sidebar-nav"
import {
  SidebarUserMenu,
  SidebarUserMenuSkeleton,
} from "@/app/(cms)/components/sidebar-user-menu"
import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/hooks/use-auth-store"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession()
  const { user, setUser } = useAuthStore()

  // Sync session → Zustand on mount / session change
  useEffect(() => {
    if (session?.user && !user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      })
    }
  }, [session, user, setUser])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            W
          </div>
          <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Wortise CMS
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter>
        {isPending ? (
          <SidebarUserMenuSkeleton />
        ) : user ? (
          <SidebarUserMenu user={user} />
        ) : (
          <SidebarUserMenuSkeleton />
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}