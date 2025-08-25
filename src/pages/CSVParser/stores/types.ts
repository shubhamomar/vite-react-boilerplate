// CSV Parser Types and Interfaces

export type SheetId = string; // hash(name,size,lastModified)
export type RowId = number;   // 0..N-1 stable
export type Cell = string;    // keep raw strings

export interface ChartData {
  name: string;
  value: number;
  change: number;
}

export interface Summary {
  totalValue: number;
  change: number;
  trend: 'up' | 'down';
}

export interface TableRow {
  id: string;
  name: string;
  value: number;
  status: 'success' | 'warning' | 'error';
  date: string;
}

export interface SheetMeta {
  id: SheetId;
  name: string;                 // file name sans ext
  file: File;                   // original file reference
  headers: string[];            // as in file
  columnOrder: number[];        // permutation indices
  hidden: boolean[];            // per-column visibility
  stats: { rows: number; cols: number; fileSize: number; };
  warnings: Warning[];          // non-blocking issues
  storage: 'memory' | 'indexeddb';
  parseOptions: ParseOptions;
  isLoading: boolean;
  parseProgress: number;
  error?: string;
}

export interface ParseOptions {
  headerRowIndex: number;
  delimiter?: string;
  encoding?: string;
  skipEmptyLines: boolean;
  autoDetect: boolean;
}

export interface Warning {
  id: string;
  type: 'delimiter' | 'encoding' | 'ragged-row' | 'empty-line' | 'quote-error';
  message: string;
  rowNumber?: number;
  sample?: string;
  severity: 'low' | 'medium' | 'high';
}

export type PatchMap = Map<RowId, Map<number, Cell>>; // rowId -> (colIdx -> value)

export interface ViewState {    // persisted in localStorage per SheetId
  sorts: Array<{ col: number; dir: 'asc' | 'desc' }>;
  filters: Record<number, FilterClause[]>; // colIdx -> clauses
  density: 'compact' | 'cozy' | 'comfortable';
  searchTerm: string;
}

export interface FilterClause {
  type: 'text' | 'numeric';
  operator: 'contains' | 'equals' | 'starts-with' | '>' | '>=' | '<' | '<=' | '!=' | 'between';
  value: string | number;
  value2?: string | number; // for 'between' operator
  caseSensitive?: boolean;
}

export interface EditPatch {
  rowId: RowId;
  columnIndex: number;
  oldValue: Cell;
  newValue: Cell;
  timestamp: number;
}

export interface UndoRedoState {
  undoStack: EditPatch[];
  redoStack: EditPatch[];
  maxStackSize: number;
}

// Worker Message Types
export interface WorkerMessage {
  type: 'PARSE_START' | 'PARSE_PROGRESS' | 'PARSE_CHUNK' | 'PARSE_COMPLETE' | 'PARSE_ERROR' | 'CANCEL';
  sheetId: SheetId;
  payload?: any;
}

export interface ParseStartMessage extends WorkerMessage {
  type: 'PARSE_START';
  file: File;
  options: ParseOptions;
}

export interface ParseProgressMessage extends WorkerMessage {
  type: 'PARSE_PROGRESS';
  rowsParsed: number;
  totalRows?: number;
  elapsedMs: number;
  bytesProcessed: number;
  totalBytes: number;
}

export interface ParseChunkMessage extends WorkerMessage {
  type: 'PARSE_CHUNK';
  rows: string[][];
  startRowId: number;
  headers?: string[];
  detectedOptions?: Partial<ParseOptions>;
}

export interface ParseCompleteMessage extends WorkerMessage {
  type: 'PARSE_COMPLETE';
  totalRows: number;
  headers: string[];
  warnings: Warning[];
  detectedOptions: ParseOptions;
}

export interface ParseErrorMessage extends WorkerMessage {
  type: 'PARSE_ERROR';
  error: string;
  details?: any;
}

// AG Grid Integration Types
export interface AGGridColumn {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filter?: boolean | string;
  editable?: boolean;
  cellRenderer?: string;
  cellEditor?: string;
  pinned?: 'left' | 'right' | null;
  hide?: boolean;
  resizable?: boolean;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  cellStyle?: any;
  cellClass?: any;
}

export interface GridState {
  columnState: any[];
  filterModel: any;
  sortModel: any[];
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'zip';
  includeHeaders: boolean;
  lineEnding: '\n' | '\r\n';
  delimiter: string;
  quoteStrings: boolean;
  selectedSheets?: SheetId[];
  columnOrder?: number[];
  visibleColumnsOnly?: boolean;
}

export interface ExportProgress {
  sheetsProcessed: number;
  totalSheets: number;
  currentSheet?: string;
  rowsProcessed?: number;
  totalRows?: number;
  isComplete: boolean;
  downloadUrl?: string;
  fileName?: string;
}

// IndexedDB Storage Types
export interface StoredSheet {
  id: SheetId;
  name: string;
  headers: string[];
  rowCount: number;
  colCount: number;
  fileSize: number;
  createdAt: number;
  lastAccessed: number;
}

export interface StoredBlock {
  sheetId: SheetId;
  blockIndex: number;
  rows: string[][];
  rowCount: number;
}

// Performance and Memory Types
export interface PerformanceStats {
  parseTimeMs: number;
  memoryUsageMB: number;
  rowsPerSecond: number;
  renderTimeMs: number;
  scrollPerformanceFPS: number;
}

export interface MemoryEstimate {
  totalMB: number;
  gridDataMB: number;
  patchesMB: number;
  undoRedoMB: number;
  cacheMB: number;
}

// Application State Types
export interface CSVParserState {
  sheets: Map<SheetId, SheetMeta>;
  activeSheetId: SheetId | null;
  patches: Map<SheetId, PatchMap>;
  undoRedo: Map<SheetId, UndoRedoState>;
  viewStates: Map<SheetId, ViewState>;
  globalSearch: string;
  isPerformanceMode: boolean;
  memoryEstimate: MemoryEstimate;
  exportProgress: ExportProgress | null;

  // UI State
  sidebarCollapsed: boolean;
  warningsPanelOpen: boolean;
  exportPanelOpen: boolean;

  // Actions (will be implemented in store)
  addSheet: (file: File) => Promise<void>;
  removeSheet: (sheetId: SheetId) => void;
  setActiveSheet: (sheetId: SheetId) => void;
  updateCell: (sheetId: SheetId, rowId: RowId, columnIndex: number, newValue: Cell) => void;
  undo: (sheetId: SheetId) => void;
  redo: (sheetId: SheetId) => void;
  applyFilter: (sheetId: SheetId, columnIndex: number, filter: FilterClause[]) => void;
  applySort: (sheetId: SheetId, sorts: Array<{ col: number; dir: 'asc' | 'desc' }>) => void;
  updateColumnOrder: (sheetId: SheetId, newOrder: number[]) => void;
  exportSheet: (sheetId: SheetId, options: ExportOptions) => Promise<void>;
  exportAll: (options: ExportOptions) => Promise<void>;
}

// Utility Types
export type FileHash = string;
export type ThemeMode = 'light' | 'dark' | 'auto';
export type GridDensity = 'compact' | 'cozy' | 'comfortable';
export type SortDirection = 'asc' | 'desc' | null;

// Constants
export const PERFORMANCE_THRESHOLDS = {
  LARGE_FILE_ROWS: 2_000_000,
  LARGE_FILE_SIZE_MB: 200,
  MEMORY_LIMIT_MB: 1500,
  CHUNK_SIZE: 5000,
  CACHE_BLOCKS: 30,
  MAX_PREVIEW_ROWS: 50000,
  MAX_UNDO_STEPS: 100,
} as const;

export const SUPPORTED_FILE_TYPES = [
  'text/csv',
  'application/csv',
  'text/plain',
] as const;

export const DELIMITER_OPTIONS = [
  { value: ',', label: 'Comma (,)', auto: true },
  { value: ';', label: 'Semicolon (;)', auto: true },
  { value: '\t', label: 'Tab (\\t)', auto: true },
  { value: '|', label: 'Pipe (|)', auto: true },
  { value: ' ', label: 'Space', auto: false },
] as const;

export const ENCODING_OPTIONS = [
  { value: 'UTF-8', label: 'UTF-8', auto: true },
  { value: 'UTF-16', label: 'UTF-16', auto: false },
  { value: 'ISO-8859-1', label: 'ISO-8859-1 (Latin-1)', auto: false },
  { value: 'Windows-1252', label: 'Windows-1252', auto: false },
] as const;
