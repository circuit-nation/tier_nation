import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: "${dateString}"`);
  }

  const diffMs = date.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(absMs / (1000 * 60));
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const format = (value: number, unit: string): string => {
    const label = `${value} ${unit}${value !== 1 ? 's' : ''}`;
    return isPast ? `${label} ago` : `${label} left`;
  };

  if (seconds < 10) return 'just now';
  if (seconds < 60) return isPast ? 'moments ago' : 'moments left';
  if (minutes < 60) return format(minutes, 'minute');
  if (hours < 24) return format(hours, 'hour');
  if (days < 7) return format(days, 'day');
  if (weeks < 5) return format(weeks, 'week');
  if (months < 12) return format(months, 'month');
  return format(years, 'year');
}
