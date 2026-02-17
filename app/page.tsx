"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, LayoutDashboard, LogIn, UserPlus } from "lucide-react"

export default function Home() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-xl text-center space-y-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            CMS de Autores
          </h1>
          <p className="text-lg text-muted-foreground">
            Creá, editá y publicá artículos desde un solo lugar.
            <br />
            Gestión simple de contenidos para autores.
          </p>
        </div>

        {isPending ? (
          <div className="flex justify-center gap-4">
            <Skeleton className="h-11 w-40 rounded-md" />
          </div>
        ) : session?.user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Ir al dashboard
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/sign-up">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear cuenta
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-muted-foreground">
        Wortise Challenge &middot; Next.js &middot; MongoDB &middot; tRPC
      </p>
    </div>
  )
}
