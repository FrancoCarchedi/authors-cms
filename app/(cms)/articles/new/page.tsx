"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/app/trpc/client"
import { Button } from "@/components/ui/button"
import {
  ArticleForm,
  type ArticleSubmitPayload,
} from "../components/article-form"
import { uploadImage } from "@/lib/upload.utils"
import { ArrowLeft } from "lucide-react"

export default function NewArticlePage() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = trpc.article.create.useMutation({
    onSuccess: (result) => {
      utils.article.list.invalidate()
      router.push(`/articles/${result.slug}`)
    },
  })

  const handleSubmit = async ({ values, coverFile }: ArticleSubmitPayload) => {
    setError(null)
    setSubmitting(true)

    try {
      let coverUrl = values.coverUrl ?? ""

      if (coverFile) {
        coverUrl = await uploadImage(coverFile)
      }

      createMutation.mutate({ ...values, coverUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nuevo artículo</h1>
      </div>

      <ArticleForm
        onSubmit={handleSubmit}
        isPending={submitting || createMutation.isPending}
        submitLabel="Crear artículo"
        serverError={error ?? createMutation.error?.message ?? null}
      />
    </div>
  )
}
