import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatEndTime = (hours: number) => {
    const now = new Date();
    const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return endTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };