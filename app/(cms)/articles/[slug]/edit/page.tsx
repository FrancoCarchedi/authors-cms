"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/app/trpc/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArticleForm,
  type ArticleSubmitPayload,
} from "../../components/article-form"
import { uploadImage } from "@/lib/upload.utils"
import { ArrowLeft } from "lucide-react"

export default function EditArticlePage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const utils = trpc.useUtils()
  const [submitting, setSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { data: article, isLoading, error } = trpc.article.getBySlug.useQuery(
    { slug: params.slug },
    { enabled: !!params.slug },
  )

  const updateMutation = trpc.article.update.useMutation({
    onSuccess: (result) => {
      utils.article.list.invalidate()
      utils.article.getBySlug.invalidate({ slug: result.slug })
      router.push(`/articles/${result.slug}`)
    },
  })

  const handleSubmit = async ({ values, coverFile }: ArticleSubmitPayload) => {
    setUploadError(null)
    setSubmitting(true)

    try {
      let coverUrl = values.coverUrl ?? article?.coverUrl ?? ""

      if (coverFile) {
        coverUrl = await uploadImage(coverFile)
      }

      updateMutation.mutate({ slug: params.slug, ...values, coverUrl })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/articles/${article.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar artículo</h1>
      </div>

      <ArticleForm
        defaultValues={{
          title: article.title,
          text: article.text,
          coverUrl: article.coverUrl,
          isPublished: article.isPublished,
        }}
        onSubmit={handleSubmit}
        isPending={submitting || updateMutation.isPending}
        submitLabel="Guardar cambios"
        serverError={uploadError ?? updateMutation.error?.message ?? null}
      />
    </div>
  )
}
