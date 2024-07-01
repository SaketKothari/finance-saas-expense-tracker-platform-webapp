import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

// Need this whenever we want to dynamically add tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertAmountFromMilliUnits(amount: number) {
  return amount / 1000;
}

export function convertAmountToMilliUnits(amount: number) {
  return Math.round(amount * 1000);
}
