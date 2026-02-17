"use client"

import { authClient } from "@/lib/auth-client"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorList } from "./components/author-list"

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {isPending ? (
          <Skeleton className="mt-1 h-4 w-48" />
        ) : (
          <p className="text-muted-foreground">
            Bienvenido, {session?.user?.name ?? "usuario"}
          </p>
        )}
      </div>

      <AuthorList />
    </div>
  )
}