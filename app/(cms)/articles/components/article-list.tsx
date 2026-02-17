"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { trpc } from "@/app/trpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react"

const PAGE_SIZE = 10
const DEBOUNCE_MS = 400

export function ArticleList() {
  const [inputValue, setInputValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Debounce the search input
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(inputValue)
      setPage(1)
    }, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [inputValue])

  const { data, isLoading, error } = trpc.article.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mis artículos</h1>
        <Button asChild>
          <Link href="/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo artículo
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, contenido o autor..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">
          Error al cargar artículos: {error.message}
        </p>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Portada</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Autor</TableHead>
              <TableHead className="hidden sm:table-cell w-28">Estado</TableHead>
              <TableHead className="hidden sm:table-cell w-36">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  {debouncedSearch
                    ? "No se encontraron artículos para esa búsqueda."
                    : "Aún no tienes artículos. ¡Crea el primero!"}
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <Image
                      src={article.coverUrl}
                      alt={article.title}
                      width={64}
                      height={40}
                      className="rounded-md object-cover h-16 w-16"
                      unoptimized
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-medium hover:underline"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground md:hidden">
                      {article.author.name}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {article.author.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={article.isPublished ? "default" : "secondary"}>
                      {article.isPublished ? "Publicado" : "Borrador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.page} de {data.totalPages} ({data.total} artículos)
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
