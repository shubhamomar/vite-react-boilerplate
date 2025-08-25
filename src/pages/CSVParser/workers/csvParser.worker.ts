// CSV Parser Web Worker using Papa Parse
import Papa from 'papaparse';
import type {
  WorkerMessage,
  ParseStartMessage,
  ParseProgressMessage,
  ParseCompleteMessage,
  ParseErrorMessage,
  ParseOptions,
  Warning,
  SheetId
} from '../stores/types';
import {
  createWarning,
  detectDelimiter,
  detectEncoding
} from '../utils/helpers';

// Worker state
let currentParseOperation: {
  sheetId: SheetId;
  file: File;
  options: ParseOptions;
  startTime: number;
  totalBytes: number;
  bytesProcessed: number;
  rowsProcessed: number;
  warnings: Warning[];
  headers: string[];
  detectedOptions: Partial<ParseOptions>;
  parser?: Papa.Parser;
} | null = null;

let parser: Papa.Parser | null = null;

// Message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case 'PARSE_START':
        await handleParseStart(message as ParseStartMessage);
        break;

      case 'CANCEL':
        handleCancel(message.sheetId);
        break;

      default:
        postErrorMessage(message.sheetId, `Unknown message type: ${message.type}`);
    }
  } catch (error) {
    postErrorMessage(message.sheetId, `Worker error: ${error}`);
  }
};

/**
 * Handle parse start message
 */
async function handleParseStart(message: ParseStartMessage): Promise<void> {
  const { sheetId, file, options } = message;

  // Cancel any existing parse operation
  if (currentParseOperation) {
    handleCancel(currentParseOperation.sheetId);
  }

  // Initialize parse operation state
  currentParseOperation = {
    sheetId,
    file,
    options,
    startTime: Date.now(),
    totalBytes: file.size,
    bytesProcessed: 0,
    rowsProcessed: 0,
    warnings: [],
    headers: [],
    detectedOptions: {},
  };

  try {
    // Pre-process file for delimiter and encoding detection if auto-detect is enabled
    if (options.autoDetect) {
      await performAutoDetection();
    }

    // Start parsing with Papa Parse
    await startParsing();

  } catch (error) {
    postErrorMessage(sheetId, `Parse initialization failed: ${error}`);
    currentParseOperation = null;
  }
}

/**
 * Perform auto-detection of delimiter and encoding
 */
async function performAutoDetection(): Promise<void> {
  if (!currentParseOperation) return;

  const { file } = currentParseOperation;

  try {
    // Read first 64KB for detection
    const sampleSize = Math.min(64 * 1024, file.size);
    const sampleFile = file.slice(0, sampleSize);

    // Detect encoding from buffer
    const buffer = await sampleFile.arrayBuffer();
    const encoding = detectEncoding(buffer);

    // Convert to text for delimiter detection
    const decoder = new TextDecoder(encoding);
    const sampleText = decoder.decode(buffer);

    // Detect delimiter
    const delimiter = detectDelimiter(sampleText);

    // Update detected options
    currentParseOperation.detectedOptions = {
      delimiter,
      encoding,
    };

    // Add info to warnings if different from defaults
    if (delimiter !== ',') {
      currentParseOperation.warnings.push(
        createWarning(
          'delimiter',
          `Auto-detected delimiter: "${delimiter === '\t' ? '\\t' : delimiter}"`,
          { severity: 'low' }
        )
      );
    }

    if (encoding !== 'UTF-8') {
      currentParseOperation.warnings.push(
        createWarning(
          'encoding',
          `Auto-detected encoding: ${encoding}`,
          { severity: 'low' }
        )
      );
    }

  } catch (error) {
    currentParseOperation.warnings.push(
      createWarning(
        'delimiter',
        `Auto-detection failed, using defaults: ${error}`,
        { severity: 'medium' }
      )
    );
  }
}

/**
 * Start the main parsing process
 */
async function startParsing(): Promise<void> {
  if (!currentParseOperation) return;

  const { file, options } = currentParseOperation;

  // Merge detected options with user options
  const parseOptions = {
    ...options,
    ...currentParseOperation.detectedOptions,
    // Override with user-specified options if provided
    delimiter: options.delimiter || currentParseOperation.detectedOptions.delimiter,
    encoding: options.encoding || currentParseOperation.detectedOptions.encoding,
  };

  // Papa Parse configuration
  const papaConfig: Papa.ParseConfig = {
    header: false, // We'll handle headers manually
    skipEmptyLines: parseOptions.skipEmptyLines,
    delimiter: parseOptions.delimiter || '',
    // Note: Commenting out step for now to test basic parsing
    // step: handleStep,
    complete: handleComplete,
    error: (error: any) => {
      console.error('Papa Parse error:', error);
      if (currentParseOperation) {
        postErrorMessage(currentParseOperation.sheetId, `Parse error: ${error.message || error}`);
      }
    },
    worker: false, // Ensure we're not using a nested worker
    download: false, // We already have the file
  };

  // Start parsing
  Papa.parse(file as any, papaConfig);
}

/**
 * Handle each parsing step
 */
function handleStep(results: Papa.ParseStepResult<string[]>, parser: Papa.Parser): void {
  if (!currentParseOperation) return;

  // Store reference to parser for cancellation
  if (!currentParseOperation.parser) {
    currentParseOperation.parser = parser;
  }

  // Update headers if not already set and we have data
  if (currentParseOperation.headers.length === 0 && results.data && results.data.length > 0) {
    const headerRowIndex = Math.max(0, currentParseOperation.options.headerRowIndex - 1);
    if (currentParseOperation.rowsProcessed === headerRowIndex) {
      for (let i = 0; i < results.data.length; i++) {
        currentParseOperation.headers.push(results.data[i] || `Column ${i + 1}`);
      }
    }
  }

  // Increment row count
  currentParseOperation.rowsProcessed++;

  // Process any errors in this step
  if (results.errors && results.errors.length > 0) {
    for (const error of results.errors) {
      const warning = createWarning(
        'parse-error',
        error.message,
        {
          rowNumber: currentParseOperation.rowsProcessed,
          severity: 'medium',
        }
      );
      currentParseOperation.warnings.push(warning);
    }
  }

  // Update bytes processed estimate (rough calculation)
  if (results.data && results.data.length > 0) {
    const rowSize = results.data.join(',').length + 2; // Rough estimate including newline
    currentParseOperation.bytesProcessed += rowSize;
  }

  // Post progress updates periodically
  if (currentParseOperation.rowsProcessed % 1000 === 0) {
    postProgressMessage();
  }
}

/**
 * Handle parsing completion
 */
function handleComplete(results: Papa.ParseResult<string[]>): void {
  if (!currentParseOperation) return;

  const { sheetId } = currentParseOperation;

  try {
    const elapsedMs = Date.now() - currentParseOperation.startTime;
    const rows = results.data || [];
    const errors = results.errors || [];

    console.log('Papa Parse complete:', {
      totalRows: rows.length,
      hasErrors: errors.length > 0,
      errors: errors.slice(0, 3), // First 3 errors for debugging
      firstRow: rows[0],
      meta: results.meta,
    });

    // Process errors into warnings
    for (const error of errors) {
      const warning = createWarning(
        'quote-error',
        error.message,
        {
          rowNumber: error.row,
          severity: 'medium',
        }
      );
      currentParseOperation.warnings.push(warning);
    }

    // Extract headers if not already done and we have data
    if (currentParseOperation.headers.length === 0 && rows.length > 0) {
      const headerRowIndex = Math.max(0, currentParseOperation.options.headerRowIndex - 1);
      if (rows.length > headerRowIndex && rows[headerRowIndex]) {
        const headerRow = rows[headerRowIndex];
        for (let i = 0; i < headerRow.length; i++) {
          currentParseOperation.headers.push(headerRow[i] || `Column ${i + 1}`);
        }
      }
    }

    // Count data rows (excluding header)
    const headerRowIndex = Math.max(0, currentParseOperation.options.headerRowIndex - 1);
    const dataRows = rows.length > headerRowIndex ? rows.slice(headerRowIndex + 1) : rows;
    currentParseOperation.rowsProcessed = dataRows.length;

    // Final progress update
    postProgressMessage();

    // Send completion message with actual data
    const completeMessage: ParseCompleteMessage = {
      type: 'PARSE_COMPLETE',
      sheetId,
      totalRows: currentParseOperation.rowsProcessed,
      headers: currentParseOperation.headers,
      warnings: currentParseOperation.warnings,
      data: dataRows, // Include the actual parsed data rows
      detectedOptions: {
        ...currentParseOperation.detectedOptions,
        headerRowIndex: currentParseOperation.options.headerRowIndex,
        skipEmptyLines: currentParseOperation.options.skipEmptyLines,
        autoDetect: currentParseOperation.options.autoDetect,
      },
    };
    postMessage(completeMessage);

    console.log(`Parse completed: ${currentParseOperation.rowsProcessed} rows in ${elapsedMs}ms`);

  } catch (error) {
    postErrorMessage(sheetId, `Completion handling error: ${error}`);
  } finally {
    // Clean up
    currentParseOperation = null;
    parser = null;
  }
}

// Error handling simplified for now

/**
 * Handle cancellation
 */
function handleCancel(sheetId: SheetId): void {
  if (currentParseOperation && currentParseOperation.sheetId === sheetId) {
    if (currentParseOperation.parser) {
      currentParseOperation.parser.abort();
    }
    if (parser) {
      parser.abort();
    }
    currentParseOperation = null;
    parser = null;

    console.log(`Parse cancelled for sheet: ${sheetId}`);
  }
}

// Helper functions simplified for initial implementation

/**
 * Send progress message to main thread
 */
function postProgressMessage(): void {
  if (!currentParseOperation) return;

  const elapsedMs = Date.now() - currentParseOperation.startTime;

  const progressMessage: ParseProgressMessage = {
    type: 'PARSE_PROGRESS',
    sheetId: currentParseOperation.sheetId,
    rowsParsed: currentParseOperation.rowsProcessed,
    elapsedMs,
    bytesProcessed: currentParseOperation.bytesProcessed,
    totalBytes: currentParseOperation.totalBytes,
  };

  postMessage(progressMessage);
}

/**
 * Send error message to main thread
 */
function postErrorMessage(sheetId: SheetId, error: string): void {
  const errorMessage: ParseErrorMessage = {
    type: 'PARSE_ERROR',
    sheetId,
    error,
  };
  postMessage(errorMessage);
}

// Export worker for TypeScript
export {};
