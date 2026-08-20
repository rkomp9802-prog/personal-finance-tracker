import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Склеивает списки классов и убирает конфликты.
// Например, если передать 'p-2' и 'p-6', останется только 'p-6'.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}