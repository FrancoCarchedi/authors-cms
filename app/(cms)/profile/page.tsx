"use client"

import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/app/trpc/client"
import { uploadImage } from "@/lib/upload.utils"
import { getInitials, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useImagePicker } from "@/hooks/use-image-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, X, Mail, CalendarDays } from "lucide-react"
import {
  ProfileFormSchema,
  type ProfileFormValues,
} from "@/app/(cms)/profile/schemas/profile-schema"

export default function ProfilePage() {
  const { data: profile, isLoading, error } = trpc.profile.get.useQuery()
  const utils = trpc.useUtils()
  const { setUser, user: storeUser } = useAuthStore()
  const avatar = useImagePicker()

  const updateProfile = trpc.profile.update.useMutation()

  const saveMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      let avatarUrl: string | undefined

      if (avatar.file) {
        avatarUrl = await uploadImage(avatar.file)
      }

      await updateProfile.mutateAsync({
        name: values.name,
        ...(avatarUrl ? { avatarUrl } : {}),
      })

      return { name: values.name, avatarUrl }
    },
    onSuccess: ({ name, avatarUrl }) => {
      avatar.clear()
      utils.profile.get.invalidate()
      utils.author.list.invalidate()
      utils.article.list.invalidate()

      if (storeUser) {
        setUser({ ...storeUser, name, ...(avatarUrl ? { avatarUrl } : {}) })
      }
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    values: profile ? { name: profile.name } : undefined,
  })

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

  const displayAvatar = avatar.preview ?? profile.avatarUrl

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

            <input {...avatar.inputProps} />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              onClick={avatar.pick}
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
        {avatar.preview && (
          <div className="flex items-center gap-3 rounded-md border border-dashed p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image
                src={avatar.preview}
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
              onClick={avatar.clear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {avatar.error && (
          <p className="text-sm text-destructive">{avatar.error}</p>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit((v) => saveMutation.mutate(v))}
          className="space-y-6"
        >
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
          {saveMutation.error && (
            <p className="text-sm text-destructive">
              {saveMutation.error.message}
            </p>
          )}
          {saveMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Perfil actualizado correctamente
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && (
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
