"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/app/trpc/client"
import { uploadImage, ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/upload.utils"
import { getInitials, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/hooks/use-auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, X, Mail, CalendarDays } from "lucide-react"

// ─── Schema ─────────────────────────────────────────────

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// ─── Component ──────────────────────────────────────────

// ─── Component ──────────────────────────────────────────

export default function ProfilePage() {
  const { data: profile, isLoading, error } = trpc.profile.get.useQuery()
  const utils = trpc.useUtils()
  const { setUser, user: storeUser } = useAuthStore()

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate()
      utils.author.list.invalidate()
      utils.article.list.invalidate()
      setSuccessMsg("Perfil actualizado correctamente")
      setTimeout(() => setSuccessMsg(null), 3000)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: profile ? { name: profile.name } : undefined,
  })

  // ── File handler ──────────────────────────────────────

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
    setAvatarFile(file)

    const localUrl = URL.createObjectURL(file)
    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return localUrl
    })
  }

  const clearAvatar = () => {
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
    setAvatarPreview(null)
    setAvatarFile(null)
    setFileError(null)
  }

  // ── Submit ────────────────────────────────────────────

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null)
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      let avatarUrl: string | null | undefined = undefined

      // Upload new avatar if one was selected
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile)
        setAvatarFile(null)
        setAvatarPreview(null)
      }

      await updateMutation.mutateAsync({
        name: values.name,
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      })

      // Sync the auth store so the sidebar reflects the change
      if (storeUser) {
        setUser({
          ...storeUser,
          name: values.name,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        })
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Error al actualizar el perfil",
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading state ─────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-lg border p-6 space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-destructive">
          Error al cargar el perfil: {error.message}
        </p>
      </div>
    )
  }

  if (!profile) return null

  const displayAvatar = avatarPreview ?? profile.avatarUrl

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <div className="rounded-lg border bg-card p-6 space-y-8">
        {/* Avatar section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 text-lg">
              <AvatarImage
                src={displayAvatar ?? undefined}
                alt={profile.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <p className="text-lg font-semibold">{profile.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {profile.email}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Miembro desde {formatDate(profile.createdAt)}
            </div>
          </div>
        </div>

        {/* Avatar preview feedback */}
        {avatarPreview && (
          <div className="flex items-center gap-3 rounded-md border border-dashed p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image
                src={avatarPreview}
                alt="Nueva foto"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              Nueva imagen seleccionada. Guarda los cambios para aplicarla.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearAvatar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {fileError && (
          <p className="text-sm text-destructive">{fileError}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Tu nombre completo"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {profile.email}
            </div>
            <p className="text-xs text-muted-foreground">
              El email no puede ser modificado.
            </p>
          </div>

          {/* Server feedback */}
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          {successMsg && (
            <p className="text-sm text-green-600">{successMsg}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
