import { PropertyType } from '../types';

export function formatPropertyValue(value: any, type: PropertyType): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  switch (type) {
    case PropertyType.BOOLEAN:
      return value ? '✓ Yes' : '✗ No';

    case PropertyType.NUMBER:
      return String(value);

    case PropertyType.BYTES:
      return formatBytes(value);

    case PropertyType.TIMESTAMP:
      return formatTimestamp(value);

    case PropertyType.ARRAY:
      return formatArray(value);

    case PropertyType.OBJECT:
      return formatObject(value);

    case PropertyType.STRING:
    default:
      return formatString(value);
  }
}

export function formatBytes(bytes: number | string): string {
  const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;

  if (isNaN(numBytes)) {
    return 'Invalid';
  }

  const gb = numBytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

export function formatTimestamp(timestamp: number | string): string {
  const numTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  if (isNaN(numTimestamp)) {
    return 'Invalid timestamp';
  }

  try {
    const date = new Date(numTimestamp);
    return date.toLocaleString();
  } catch {
    return 'Invalid timestamp';
  }
}

export function formatArray(arr: any): string {
  if (!Array.isArray(arr)) {
    return String(arr);
  }

  if (arr.length === 0) {
    return '[]';
  }

  if (arr.every((item) => typeof item === 'string' || typeof item === 'number')) {
    return arr.join(', ');
  }

  return JSON.stringify(arr, null, 2);
}

export function formatObject(obj: any): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }

  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '[Complex Object]';
  }
}

export function formatString(str: any): string {
  const strValue = String(str);
  const MAX_LENGTH = 100;

  if (strValue.length <= MAX_LENGTH) {
    return strValue;
  }

  return strValue.substring(0, MAX_LENGTH) + '...';
}

export function shortenCategoryName(category: string): string {
  return category
    .replace(' Information', '')
    .replace('Device ', '')
    .replace('Application ', 'App ')
    .trim();
}
