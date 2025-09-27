'use client'

import * as React from "react"
import { motion, type MotionProps } from "framer-motion"
import { useReducedMotion } from "@/lib/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

interface MotionCardProps extends MotionProps {
  children: React.ReactNode
  className?: string
}

export function MotionCard({ children, className, ...props }: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={cn("animate-fade-in", className)}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface MotionListProps extends MotionProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function MotionList({ 
  children, 
  className, 
  staggerDelay = 0.1,
  ...props 
}: MotionListProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={cn("animate-fade-in", className)}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.3,
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface MotionItemProps extends MotionProps {
  children: React.ReactNode
  className?: string
}

export function MotionItem({ children, className, ...props }: MotionItemProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Standard transition presets
export const transitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  }
} as const
