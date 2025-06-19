import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBackendUrl(): string {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8000'
  }
  
  // In production, use environment variable or fallback
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
}