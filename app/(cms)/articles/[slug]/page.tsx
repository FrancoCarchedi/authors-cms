"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { trpc } from "@/app/trpc/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteArticleDialog } from "../components/delete-article-dialog"
import { ArrowLeft, Pencil, Calendar, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()

  const { data: article, isLoading, error } = trpc.article.getBySlug.useQuery(
    { slug: params.slug },
    { enabled: !!params.slug },
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-destructive">
          {error?.message ?? "Artículo no encontrado."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/articles/${article.slug}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteArticleDialog
            slug={article.slug}
            title={article.title}
            onDeleted={() => router.push("/articles")}
          />
        </div>
      </div>

      {/* Cover image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
        <Image
          src={article.coverUrl}
          alt={article.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Title + meta */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={article.isPublished ? "default" : "secondary"}>
            {article.isPublished ? "Publicado" : "Borrador"}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Avatar className="h-8 w- rounded-full">
              <AvatarImage src={article.author.avatarUrl ?? undefined} alt={article.author.name} className="object-cover"/>
              <AvatarFallback className="rounded-full">
                FC
              </AvatarFallback>
            </Avatar>
            {article.author.name}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(article.createdAt).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Body text */}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        {article.text.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>
    </div>
  )
}
