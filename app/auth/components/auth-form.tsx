'use client'

import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/hooks/use-auth-store"
import {
  LoginSchema,
  RegisterSchema,
  type RegisterInput,
} from "../schemas/auth-schema"
import { useRouter, useSearchParams } from "next/navigation"
import { GoogleIcon } from "./GoogleIcon"

interface AuthProps {
  typeForm?: "login" | "register"
  className?: string
}

function setUserFromResponse(
  setUser: (user: { id: string; name: string; email: string; avatarUrl?: string | null }) => void,
  user: { id: string; name: string; email: string; image?: string | null | undefined } & Record<string, unknown>,
) {
  setUser({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.image,
  })
}

export function AuthForm({ className, typeForm = "login", ...props }: AuthProps) {
  const setUser = useAuthStore((s) => s.setUser)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const isRegister = typeForm === "register"
  const schema = isRegister ? RegisterSchema : LoginSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(schema) as unknown as Resolver<RegisterInput>,
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  const handleGooglePopup = async () => {
    setGoogleLoading(true)
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth/popup-close",
        disableRedirect: true,
      })

      const authUrl = res.data?.url
      if (!authUrl) return

      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(
        authUrl,
        "google-auth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
      )

      const timer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(timer)
          const session = await authClient.getSession()
          if (session.data?.user) {
            const u = session.data.user
            setUser({
              id: u.id,
              name: u.name,
              email: u.email ?? "",
              avatarUrl: u.image,
            })
            router.push(callbackUrl)
          } else {
            setGoogleLoading(false)
          }
        }
      }, 500)
    } catch {
      setGoogleLoading(false)
    }
  }

  const authMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      if (isRegister) {
        const { name, email, password } = data

        const res = await authClient.signUp.email({
          email, password, name,
        })

        if (res.error) throw new Error("Error al registrar")

        const user = res.data!.user
        setUserFromResponse(setUser, user as typeof user & Record<string, unknown>)
      } else {
        const { email, password } = data

        const res = await authClient.signIn.email({ email, password })

        if (res.error) throw new Error("Credenciales inválidas")

        const user = res.data!.user
        setUserFromResponse(setUser, user as typeof user & Record<string, unknown>)
      }
    },
    onSuccess: () => {
      router.push(callbackUrl)
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{isRegister ? "Registrar tu cuenta" : "Iniciar sesión"}</CardTitle>
          <CardDescription>
            {isRegister
              ? "Ingresa tus datos para registrar tu cuenta"
              : "Ingresa tus credenciales para iniciar sesión"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => authMutation.mutate(data))}>
            <FieldGroup className="gap-4">
              {isRegister && (
                <Field className="gap-2">
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Franco Carchedi"
                    {...register("name")}
                  />
                  <FieldError errors={[errors.name]} />
                </Field>
              )}
              <Field className="gap-2">
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="franco@example.com"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              {authMutation.error && (
                <p className="text-destructive text-sm text-center">
                  {authMutation.error.message}
                </p>
              )}

              <Field className="gap-2">
                <Button type="submit" className="cursor-pointer" disabled={authMutation.isPending}>
                  {authMutation.isPending
                    ? "Cargando..."
                    : isRegister
                      ? "Registrar"
                      : "Iniciar sesión"}
                </Button>
                
              </Field>
            </FieldGroup>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o continuar con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer mb-3"
            disabled={googleLoading}
            onClick={handleGooglePopup}
          >
            {/* <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              />
            </svg> */}
            <GoogleIcon />
            {googleLoading ? "Cargando..." : "Google"}
          </Button>

          <FieldDescription className="text-center">
            {isRegister
              ? "¿Ya tienes una cuenta? "
              : "¿No tienes una cuenta? "}
            <a href={isRegister ? "/auth/sign-in" : "/auth/sign-up"}>
              {isRegister ? "Inicia sesión" : "Regístrate"}
            </a>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
