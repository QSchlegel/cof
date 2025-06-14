'use client'

import "@meshsdk/react/styles.css"
import { MeshProvider } from '@meshsdk/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MeshProvider>
      {children}
    </MeshProvider>
  )
} 