"use client"

import { useRef, useState } from "react"
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/upload.utils"

export interface UseImagePickerOptions {
  initialPreview?: string | null
}

export interface UseImagePickerReturn {
  file: File | null
  preview: string | null
  error: string | null
  setError: (msg: string | null) => void
  inputProps: {
    ref: React.RefObject<HTMLInputElement | null>
    type: "file"
    accept: string
    className: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  }
  pick: () => void
  clear: () => void
}

export function useImagePicker(
  options?: UseImagePickerOptions,
): UseImagePickerReturn {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(
    options?.initialPreview ?? null,
  )
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    e.target.value = ""

    const validationError = validateImageFile(selected)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setFile(selected)

    const url = URL.createObjectURL(selected)
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return url
    })
  }

  const clear = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setPreview(null)
    setFile(null)
    setError(null)
  }

  const pick = () => inputRef.current?.click()

  return {
    file,
    preview,
    error,
    setError,
    inputProps: {
      ref: inputRef,
      type: "file",
      accept: ACCEPTED_IMAGE_TYPES.join(","),
      className: "hidden",
      onChange: handleChange,
    },
    pick,
    clear,
  }
}
