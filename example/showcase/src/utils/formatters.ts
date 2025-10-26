/**
 * Property Value Formatters
 * Handles formatting of different property types for display
 */

import { PropertyType } from '../types';

/**
 * Format a property value based on its type
 * @param value - The raw value to format
 * @param type - The PropertyType enum indicating how to format
 * @returns Formatted string for display
 */
export function formatPropertyValue(value: any, type: PropertyType): string {
  // Handle null/undefined
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

/**
 * Format bytes to human-readable format (GB with 2 decimal places)
 * @param bytes - Number of bytes
 * @returns Formatted string like "8.00 GB"
 */
export function formatBytes(bytes: number | string): string {
  const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;

  if (isNaN(numBytes)) {
    return 'Invalid';
  }

  const gb = numBytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

/**
 * Format timestamp (milliseconds since epoch) to readable date/time
 * @param timestamp - Milliseconds since epoch
 * @returns Formatted date string
 */
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

/**
 * Format array values
 * @param arr - Array to format
 * @returns Comma-separated string or JSON for complex arrays
 */
export function formatArray(arr: any): string {
  if (!Array.isArray(arr)) {
    return String(arr);
  }

  if (arr.length === 0) {
    return '[]';
  }

  // For simple arrays (strings, numbers), join with commas
  if (arr.every((item) => typeof item === 'string' || typeof item === 'number')) {
    return arr.join(', ');
  }

  // For complex arrays, use JSON
  return JSON.stringify(arr, null, 2);
}

/**
 * Format object values
 * @param obj - Object to format
 * @returns Pretty-printed JSON
 */
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

/**
 * Format string values with truncation for very long strings
 * @param str - String to format
 * @returns Formatted string with ellipsis if too long
 */
export function formatString(str: any): string {
  const strValue = String(str);
  const MAX_LENGTH = 100;

  if (strValue.length <= MAX_LENGTH) {
    return strValue;
  }

  return strValue.substring(0, MAX_LENGTH) + '...';
}

/**
 * Get a short display name for a category
 * @param category - Full category name
 * @returns Shortened name for headers
 */
export function shortenCategoryName(category: string): string {
  // Remove common prefixes/suffixes
  return category
    .replace(' Information', '')
    .replace('Device ', '')
    .replace('Application ', 'App ')
    .trim();
}
