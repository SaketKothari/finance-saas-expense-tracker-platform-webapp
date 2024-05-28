import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Need this whenever we want to dynamically add tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
