'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const BottomSheet = DialogPrimitive.Root
const BottomSheetTrigger = DialogPrimitive.Trigger
const BottomSheetClose = DialogPrimitive.Close

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 max-h-[88vh] translate-y-full overflow-y-auto rounded-t-3xl bg-pub-surface p-5 pb-8 shadow-2xl transition-transform duration-300 ease-out data-[state=open]:translate-y-0',
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-pub-line" />
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
BottomSheetContent.displayName = 'BottomSheetContent'

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('mb-4 font-display text-lg font-bold text-pub-ink', className)}
    {...props}
  />
))
BottomSheetTitle.displayName = 'BottomSheetTitle'

export { BottomSheet, BottomSheetTrigger, BottomSheetClose, BottomSheetContent, BottomSheetTitle }
