import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { PageBlockPublic, ProcedureTypePublic } from '@/lib/api/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pass-through — encoding is enforced at the DB connection level (SET NAMES utf8mb4).
export function repairHumanText(value?: string | null) {
  return value ?? '';
}

export function repairApiPayload<T>(input: T): T {
  return input;
}

export function formatDate(value?: string | Date | null, opts: Intl.DateTimeFormatOptions = {}) {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit', month: 'long', year: 'numeric', ...opts,
  }).format(d);
}

export function formatDateTime(value?: string | Date | null) {
  return formatDate(value, { hour: '2-digit', minute: '2-digit' });
}

// Pass-throughs — corrupted data has been fixed at the database level.
export function sanitizePageBlocks(blocks: PageBlockPublic[]) {
  return blocks;
}

export function sanitizeProcedureTypes(items: ProcedureTypePublic[]) {
  return items;
}
