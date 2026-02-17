"use client"

import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useImagePicker } from "@/hooks/use-image-picker"
import {
  ArticleFormSchema,
  type ArticleFormValues,
} from "@/app/(cms)/articles/schemas/article-schema"

export interface ArticleSubmitPayload {
  values: ArticleFormValues
  coverFile: File | null
}

interface ArticleFormProps {
  defaultValues?: Partial<ArticleFormValues>
  onSubmit: (payload: ArticleSubmitPayload) => void | Promise<void>
  isPending?: boolean
  submitLabel?: string
  serverError?: string | null
}

export function ArticleForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Guardar",
  serverError,
}: ArticleFormProps) {
  const cover = useImagePicker({ initialPreview: defaultValues?.coverUrl })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      title: "",
      text: "",
      coverUrl: "",
      isPublished: false,
      ...defaultValues,
    },
  })

  const isPublished = watch("isPublished")

  const clearCover = () => {
    cover.clear()
    setValue("coverUrl", "", { shouldValidate: false })
  }

  const internalSubmit = (values: ArticleFormValues) => {
    if (!values.coverUrl && !cover.file) {
      cover.setError("Debes seleccionar una imagen de portada.")
      return
    }
    onSubmit({ values, coverFile: cover.file })
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
        <input {...cover.inputProps} />
        <input type="hidden" {...register("coverUrl")} />

        {cover.preview ? (
          <div className="relative w-full overflow-hidden rounded-lg border">
            <div className="relative aspect-video">
              <Image
                src={cover.preview}
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
            onClick={cover.pick}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-12 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">
              Haz clic para seleccionar una imagen
            </span>
            <span className="text-xs">JPG, PNG, o WebP (máx. 5 MB)</span>
          </button>
        )}
        {cover.error && (
          <p className="text-sm text-destructive">{cover.error}</p>
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
