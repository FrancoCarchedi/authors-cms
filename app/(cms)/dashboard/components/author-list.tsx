"use client"

import { useState, useEffect, useRef } from "react"
import { trpc } from "@/app/trpc/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Users, Loader2 } from "lucide-react"
import { getInitials } from "@/lib/utils"

const PAGE_SIZE = 5
const DEBOUNCE_MS = 400

// ─── Component ───────────────────────────────────────────

export function AuthorList() {
  const [inputValue, setInputValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Debounce search input
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(inputValue)
      setPage(1)
    }, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [inputValue])

  const { data, isLoading, error } = trpc.author.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Autores</h2>
          {data && (
            <span className="text-sm text-muted-foreground">({data.total})</span>
          )}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar autores: {error.message}
        </p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12.5">Avatar</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-35 text-right">Publicados</TableHead>
              <TableHead className="w-35 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {debouncedSearch
                    ? "No se encontraron autores."
                    : "Aún no hay autores registrados."}
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author.avatarUrl ?? undefined} alt={author.name} className="object-cover"/>
                      <AvatarFallback className="text-xs">
                        {getInitials(author.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="text-right">{author.publishedArticles}</TableCell>
                  <TableCell className="text-right">{author.totalArticles}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.page} de {data.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={data.page >= data.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
