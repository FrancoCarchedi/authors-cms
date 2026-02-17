"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImagePlus, Loader2, X } from "lucide-react"
import {
  ACCEPTED_IMAGE_TYPES,
  validateImageFile,
} from "@/lib/upload.utils"

// ─── Schema ─────────────────────────────────────────────

const articleFormSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título es demasiado largo (máx. 200)"),
  text: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(50000, "El contenido es demasiado largo"),
  coverUrl: z.string().optional(),
  isPublished: z.boolean(),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>

/** What the form emits on submit — includes the pending file if any */
export interface ArticleSubmitPayload {
  values: ArticleFormValues
  coverFile: File | null
}

// ─── Props ──────────────────────────────────────────────

interface ArticleFormProps {
  defaultValues?: Partial<ArticleFormValues>
  onSubmit: (payload: ArticleSubmitPayload) => void | Promise<void>
  isPending?: boolean
  submitLabel?: string
  serverError?: string | null
}

// ─── Component ──────────────────────────────────────────

export function ArticleForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Guardar",
  serverError,
}: ArticleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(defaultValues?.coverUrl ?? null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      text: "",
      coverUrl: "",
      isPublished: false,
      ...defaultValues,
    },
  })

  const isPublished = watch("isPublished")

  // ── File handler ─────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""

    const validationError = validateImageFile(file)
    if (validationError) {
      setFileError(validationError)
      return
    }

    setFileError(null)
    setCoverFile(file)

    // Local preview only — no upload yet
    const localUrl = URL.createObjectURL(file)
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return localUrl
    })
    // Clear the existing URL so we know a file upload is pending
    setValue("coverUrl", "", { shouldValidate: false })
  }

  const clearCover = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setPreview(null)
    setCoverFile(null)
    setValue("coverUrl", "", { shouldValidate: false })
    setFileError(null)
  }

  // ── Submit ───────────────────────────────────────────

  const internalSubmit = (values: ArticleFormValues) => {
    // Require either an existing coverUrl or a pending file
    if (!values.coverUrl && !coverFile) {
      setFileError("Debes seleccionar una imagen de portada.")
      return
    }
    onSubmit({ values, coverFile })
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Título del artículo"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <Label>Imagen de portada</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
        <input type="hidden" {...register("coverUrl")} />

        {preview ? (
          <div className="relative w-full overflow-hidden rounded-lg border">
            <div className="relative aspect-video">
              <Image
                src={preview}
                alt="Portada"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={clearCover}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-12 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">
              Haz clic para seleccionar una imagen
            </span>
            <span className="text-xs">JPG, PNG, WebP o GIF (máx. 5 MB)</span>
          </button>
        )}
        {fileError && (
          <p className="text-sm text-destructive">{fileError}</p>
        )}
      </div>

      {/* Text */}
      <div className="space-y-2">
        <Label htmlFor="text">Contenido</Label>
        <Textarea
          id="text"
          rows={12}
          placeholder="Escribe el contenido del artículo..."
          {...register("text")}
        />
        {errors.text && (
          <p className="text-sm text-destructive">{errors.text.message}</p>
        )}
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="isPublished"
          checked={isPublished}
          onCheckedChange={(checked) => setValue("isPublished", checked)}
        />
        <Label htmlFor="isPublished" className="cursor-pointer">
          {isPublished ? "Publicado" : "Borrador"}
        </Label>
      </div>

      {/* Server error */}
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
