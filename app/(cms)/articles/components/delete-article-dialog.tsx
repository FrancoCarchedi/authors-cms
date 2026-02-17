"use client"

import { useState } from "react"
import { trpc } from "@/app/trpc/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2 } from "lucide-react"

interface DeleteArticleDialogProps {
  slug: string
  title: string
  onDeleted?: () => void
}

export function DeleteArticleDialog({
  slug,
  title,
  onDeleted,
}: DeleteArticleDialogProps) {
  const [open, setOpen] = useState(false)
  const utils = trpc.useUtils()

  const deleteMutation = trpc.article.delete.useMutation({
    onSuccess: () => {
      utils.article.list.invalidate()
      setOpen(false)
      onDeleted?.()
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar <strong>&ldquo;{title}&rdquo;</strong>.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate({ slug })}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
        {deleteMutation.error && (
          <p className="text-sm text-destructive px-6 pb-4">
            {deleteMutation.error.message}
          </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
