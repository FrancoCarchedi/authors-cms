'use client'

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
import { trpc } from "@/app/trpc/client"
import {
  LoginSchema,
  RegisterSchema,
  type RegisterInput,
} from "../schemas/auth-schema"
import { useRouter, useSearchParams } from "next/navigation"

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
  const createAuthor = trpc.author.create.useMutation()
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

        await createAuthor.mutateAsync({
          userId: user.id,
          name: user.name,
          avatarUrl: user.image,
        })
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
                <FieldDescription className="text-center">
                  {isRegister
                    ? "¿Ya tienes una cuenta? "
                    : "¿No tienes una cuenta? "}
                  <a href={isRegister ? "/auth/sign-in" : "/auth/sign-up"}>
                    {isRegister ? "Inicia sesión" : "Regístrate"}
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
