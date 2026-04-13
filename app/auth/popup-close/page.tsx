"use client"

import { useEffect } from "react"

export default function PopupClosePage(): null {
  useEffect(() => {
    window.close()
  }, [])

  return null
}
