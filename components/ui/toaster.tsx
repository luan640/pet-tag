'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

type ToastVariant = 'success' | 'error'

type ToastItem = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type ToastInput = Omit<ToastItem, 'id'>

type ToastContextValue = {
  toast: (input: ToastInput) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextIdRef = useRef(1)

  const removeToast = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const id = nextIdRef.current++
    setItems((current) => [...current, { ...input, id }])
    window.setTimeout(() => removeToast(id), 4500)
  }, [removeToast])

  const value = useMemo<ToastContextValue>(() => ({
    toast,
    success: (title, description) => toast({ title, description, variant: 'success' }),
    error: (title, description) => toast({ title, description, variant: 'error' }),
  }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col gap-2.5 sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm">
        {items.map((item) => {
          const isSuccess = item.variant === 'success'

          return (
            <div
              key={item.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-lg ${
                isSuccess ? 'border-fern-soft bg-surface' : 'border-red-200 bg-surface'
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isSuccess ? 'bg-fern-soft text-fern' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {isSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  {item.description && <p className="mt-1 text-sm text-ink-soft">{item.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="rounded-full p-1 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="Fechar notificacao"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
