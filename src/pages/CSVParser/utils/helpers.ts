import type {
  SheetId,
  ViewState,
  UndoRedoState,
  Warning,
  ParseOptions
} from '../stores/types';
import { PERFORMANCE_THRESHOLDS } from '../stores/types';

/**
 * Generate a unique hash for a file based on name, size, and last modified date
 */
export async function generateFileHash(file: File): Promise<SheetId> {
  const data = `${file.name}-${file.size}-${file.lastModified}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16); // Truncate for readability
}

/**
 * Create initial view state for a new sheet
 */
export function createInitialViewState(): ViewState {
  return {
    sorts: [],
    filters: {},
    density: 'cozy',
    searchTerm: '',
  };
}

/**
 * Create initial undo/redo state for a new sheet
 */
export function createInitialUndoRedoState(): UndoRedoState {
  return {
    undoStack: [],
    redoStack: [],
    maxStackSize: PERFORMANCE_THRESHOLDS.MAX_UNDO_STEPS,
  };
}

/**
 * Create a unique warning ID
 */
export function createWarningId(): string {
  return `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format duration in human readable format
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Detect if a file is likely to be a large file requiring performance mode
 */
export function shouldUsePerformanceMode(file: File): boolean {
  return file.size > PERFORMANCE_THRESHOLDS.LARGE_FILE_SIZE_MB * 1024 * 1024;
}

/**
 * Estimate memory usage for a dataset
 */
export function estimateMemoryUsage(rowCount: number, columnCount: number): number {
  // Rough estimation: each cell is ~20 bytes on average
  const cellSize = 20;
  const memoryMB = (rowCount * columnCount * cellSize) / (1024 * 1024);
  return Math.ceil(memoryMB);
}

/**
 * Validate CSV file type
 */
export function isValidCSVFile(file: File): boolean {
  const validTypes = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.ms-excel', // Sometimes CSV files have this MIME type
  ];

  const validExtensions = ['.csv', '.txt', '.tsv'];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  return hasValidType || hasValidExtension;
}

/**
 * Create a warning object
 */
export function createWarning(
  type: Warning['type'],
  message: string,
  options: {
    rowNumber?: number;
    sample?: string;
    severity?: Warning['severity'];
  } = {}
): Warning {
  return {
    id: createWarningId(),
    type,
    message,
    rowNumber: options.rowNumber,
    sample: options.sample,
    severity: options.severity || 'medium',
  };
}

/**
 * Detect delimiter from CSV content sample
 */
export function detectDelimiter(content: string, maxLines: number = 5): string {
  const lines = content.split('\n').slice(0, maxLines);
  const delimiters = [',', ';', '\t', '|', ' '];
  const scores: Record<string, number> = {};

  for (const delimiter of delimiters) {
    let totalFields = 0;
    let consistency = 0;
    let fieldCounts: number[] = [];

    for (const line of lines) {
      if (line.trim()) {
        const fieldCount = line.split(delimiter).length;
        fieldCounts.push(fieldCount);
        totalFields += fieldCount;
      }
    }

    if (fieldCounts.length > 0) {
      const avgFields = totalFields / fieldCounts.length;
      const variance = fieldCounts.reduce((sum, count) =>
        sum + Math.pow(count - avgFields, 2), 0) / fieldCounts.length;

      // Lower variance = more consistent = better delimiter
      consistency = 1 / (1 + variance);
      scores[delimiter] = avgFields * consistency;
    }
  }

  // Return delimiter with highest score, default to comma
  const bestDelimiter = Object.entries(scores).reduce((best, [delimiter, score]) =>
    score > best.score ? { delimiter, score } : best,
    { delimiter: ',', score: 0 }
  );

  return bestDelimiter.delimiter;
}

/**
 * Detect encoding from file content
 */
export function detectEncoding(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);

  // Check for BOM
  if (uint8Array.length >= 3) {
    if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
      return 'UTF-8';
    }
  }

  if (uint8Array.length >= 2) {
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
      return 'UTF-16LE';
    }
    if (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
      return 'UTF-16BE';
    }
  }

  // Default to UTF-8
  return 'UTF-8';
}

/**
 * Sanitize filename for export
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Generate export filename
 */
export function generateExportFilename(
  originalName: string,
  format: 'csv' | 'zip',
  suffix: string = ''
): string {
  const baseName = sanitizeFilename(originalName.replace(/\.[^/.]+$/, ''));
  const timestamp = new Date().toISOString().split('T')[0];
  const fullSuffix = suffix ? `_${suffix}` : '';

  return `${baseName}${fullSuffix}_${timestamp}.${format}`;
}

/**
 * Debounce function for search and other operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance-critical operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Parse CSV header row to extract column names
 */
export function parseHeaderRow(headerRow: string[]): string[] {
  if (!headerRow || headerRow.length === 0) {
    return [];
  }

  // Deduplicate header names while preserving original display
  const headers: string[] = [];
  const seen = new Set<string>();

  for (const header of headerRow) {
    const cleanHeader = header.trim();
    let uniqueHeader = cleanHeader;
    let counter = 2;

    while (seen.has(uniqueHeader)) {
      uniqueHeader = `${cleanHeader}__${counter}`;
      counter++;
    }

    seen.add(uniqueHeader);
    headers.push(uniqueHeader);
  }

  return headers;
}

/**
 * Calculate parse progress percentage
 */
export function calculateParseProgress(
  bytesProcessed: number,
  totalBytes: number
): number {
  if (totalBytes === 0) return 0;

  const byteProgress = (bytesProcessed / totalBytes) * 100;
  return Math.min(Math.max(byteProgress, 0), 100);
}

/**
 * Create default parse options
 */
export function createDefaultParseOptions(): ParseOptions {
  return {
    headerRowIndex: 1,
    skipEmptyLines: true,
    autoDetect: true,
  };
}

/**
 * Validate parse options
 */
export function validateParseOptions(options: Partial<ParseOptions>): ParseOptions {
  return {
    headerRowIndex: Math.max(1, options.headerRowIndex || 1),
    delimiter: options.delimiter || undefined,
    encoding: options.encoding || undefined,
    skipEmptyLines: options.skipEmptyLines !== false,
    autoDetect: options.autoDetect !== false,
  };
}

/**
 * Format performance stats for display
 */
export function formatPerformanceStats(stats: {
  parseTimeMs: number;
  rowsPerSecond: number;
  memoryUsageMB: number;
}): string {
  const parseTime = formatDuration(stats.parseTimeMs);
  const rowsPerSec = formatNumber(Math.round(stats.rowsPerSecond));
  const memoryUsage = stats.memoryUsageMB.toFixed(1);

  return `Parsed in ${parseTime} at ${rowsPerSec} rows/sec (${memoryUsage} MB)`;
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): {
  supported: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!window.Worker) {
    missing.push('Web Workers');
  }

  if (!window.indexedDB) {
    missing.push('IndexedDB');
  }

  if (!window.crypto?.subtle) {
    missing.push('Web Crypto API');
  }

  if (!window.File || !window.FileReader) {
    missing.push('File API');
  }

  return {
    supported: missing.length === 0,
    missing,
  };
}

/**
 * Generate column letter (A, B, C, ..., AA, AB, ...)
 */
export function getColumnLetter(index: number): string {
  let result = '';
  let num = index;

  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  }

  return result;
}

/**
 * Create download link for blob data
 */
export function createDownloadLink(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  return url;
}

/**
 * Trigger download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = createDownloadLink(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
