import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  CSVParserState,
  SheetId,
  SheetMeta,
  RowId,
  Cell,
  FilterClause,
  ExportOptions,
  ViewState,
  UndoRedoState,
  EditPatch,
  MemoryEstimate,
  ExportProgress,
  Warning
} from './types';
import { PERFORMANCE_THRESHOLDS } from './types';
import { generateFileHash, createInitialViewState, createInitialUndoRedoState } from '../utils/helpers';

interface CSVParserActions {
  // Sheet Management
  addSheet: (file: File) => Promise<void>;
  removeSheet: (sheetId: SheetId) => void;
  setActiveSheet: (sheetId: SheetId) => void;
  updateSheetMeta: (sheetId: SheetId, updates: Partial<SheetMeta>) => void;

  // Data Operations
  updateCell: (sheetId: SheetId, rowId: RowId, columnIndex: number, newValue: Cell) => void;
  undo: (sheetId: SheetId) => void;
  redo: (sheetId: SheetId) => void;

  // View State Management
  updateViewState: (sheetId: SheetId, updates: Partial<ViewState>) => void;
  applyFilter: (sheetId: SheetId, columnIndex: number, filter: FilterClause[]) => void;
  applySort: (sheetId: SheetId, sorts: Array<{ col: number; dir: 'asc' | 'desc' }>) => void;
  updateColumnOrder: (sheetId: SheetId, newOrder: number[]) => void;
  updateColumnVisibility: (sheetId: SheetId, columnIndex: number, visible: boolean) => void;
  setGlobalSearch: (searchTerm: string) => void;

  // Export Operations
  exportSheet: (sheetId: SheetId, options: ExportOptions) => Promise<void>;
  exportAll: (options: ExportOptions) => Promise<void>;
  setExportProgress: (progress: ExportProgress | null) => void;

  // UI State
  toggleSidebar: () => void;
  toggleWarningsPanel: () => void;
  toggleExportPanel: () => void;
  setPerformanceMode: (enabled: boolean) => void;
  updateMemoryEstimate: (estimate: MemoryEstimate) => void;

  // Utility Actions
  clearAllSheets: () => void;
  addWarning: (sheetId: SheetId, warning: Warning) => void;
  removeWarning: (sheetId: SheetId, warningId: string) => void;

  // Worker Integration
  handleParseProgress: (sheetId: SheetId, progress: any) => void;
  handleParseComplete: (sheetId: SheetId, result: any) => void;
  handleParseError: (sheetId: SheetId, error: string) => void;
}

type CSVParserStore = CSVParserState & CSVParserActions;

const initialState: CSVParserState = {
  sheets: new Map(),
  activeSheetId: null,
  patches: new Map(),
  undoRedo: new Map(),
  viewStates: new Map(),
  globalSearch: '',
  isPerformanceMode: false,
  memoryEstimate: {
    totalMB: 0,
    gridDataMB: 0,
    patchesMB: 0,
    undoRedoMB: 0,
    cacheMB: 0,
  },
  exportProgress: null,
  sidebarCollapsed: false,
  warningsPanelOpen: false,
  exportPanelOpen: false,

  // Placeholder functions (will be overridden by actions)
  addSheet: async () => {},
  removeSheet: () => {},
  setActiveSheet: () => {},
  updateCell: () => {},
  undo: () => {},
  redo: () => {},
  applyFilter: () => {},
  applySort: () => {},
  updateColumnOrder: () => {},
  exportSheet: async () => {},
  exportAll: async () => {},
};

export const useCSVParserStore = create<CSVParserStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Sheet Management Actions
        addSheet: async (file: File) => {
          const sheetId = await generateFileHash(file);

          // Check if sheet already exists
          const existingSheet = get().sheets.get(sheetId);
          if (existingSheet) {
            set(state => ({
              ...state,
              activeSheetId: sheetId
            }));
            return;
          }

          const sheetMeta: SheetMeta = {
            id: sheetId,
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            file: file,
            headers: [],
            columnOrder: [],
            hidden: [],
            stats: {
              rows: 0,
              cols: 0,
              fileSize: file.size
            },
            warnings: [],
            storage: file.size > PERFORMANCE_THRESHOLDS.LARGE_FILE_SIZE_MB * 1024 * 1024 ? 'indexeddb' : 'memory',
            parseOptions: {
              headerRowIndex: 1,
              skipEmptyLines: true,
              autoDetect: true,
            },
            isLoading: true,
            parseProgress: 0,
          };

          set(state => {
            const newSheets = new Map(state.sheets);
            newSheets.set(sheetId, sheetMeta);

            return {
              ...state,
              sheets: newSheets,
              activeSheetId: sheetId,
              patches: new Map(state.patches.set(sheetId, new Map())),
              undoRedo: new Map(state.undoRedo.set(sheetId, createInitialUndoRedoState())),
              viewStates: new Map(state.viewStates.set(sheetId, createInitialViewState())),
            };
          });

          // Worker will be started from the dashboard component
        },

        removeSheet: (sheetId: SheetId) => {
          set(state => {
            const newSheets = new Map(state.sheets);
            newSheets.delete(sheetId);

            const newPatches = new Map(state.patches);
            newPatches.delete(sheetId);

            const newUndoRedo = new Map(state.undoRedo);
            newUndoRedo.delete(sheetId);

            const newViewStates = new Map(state.viewStates);
            newViewStates.delete(sheetId);

            // If removing active sheet, select another or null
            let newActiveSheetId = state.activeSheetId;
            if (state.activeSheetId === sheetId) {
              const remainingSheets = Array.from(newSheets.keys());
              newActiveSheetId = remainingSheets.length > 0 ? remainingSheets[0]! : null;
            }

            return {
              ...state,
              sheets: newSheets,
              patches: newPatches,
              undoRedo: newUndoRedo,
              viewStates: newViewStates,
              activeSheetId: newActiveSheetId,
            };
          });
        },

        setActiveSheet: (sheetId: SheetId) => {
          set(state => ({
            ...state,
            activeSheetId: sheetId
          }));
        },

        updateSheetMeta: (sheetId: SheetId, updates: Partial<SheetMeta>) => {
          set(state => {
            const sheet = state.sheets.get(sheetId);
            if (!sheet) return state;

            const newSheets = new Map(state.sheets);
            newSheets.set(sheetId, { ...sheet, ...updates });

            return {
              ...state,
              sheets: newSheets,
            };
          });
        },

        // Data Operations
        updateCell: (sheetId: SheetId, rowId: RowId, columnIndex: number, newValue: Cell) => {
          set(state => {
            const patches = state.patches.get(sheetId) || new Map();
            const undoRedo = state.undoRedo.get(sheetId) || createInitialUndoRedoState();

            // Get current value (from patches or original data)
            const currentValue = patches.get(rowId)?.get(columnIndex) || ''; // TODO: Get from data adapter

            // Create edit patch
            const editPatch: EditPatch = {
              rowId,
              columnIndex,
              oldValue: currentValue,
              newValue,
              timestamp: Date.now(),
            };

            // Update patches
            const newPatches = new Map(patches);
            if (!newPatches.has(rowId)) {
              newPatches.set(rowId, new Map());
            }
            newPatches.get(rowId)!.set(columnIndex, newValue);

            // Update undo/redo stacks
            const newUndoRedo: UndoRedoState = {
              ...undoRedo,
              undoStack: [...undoRedo.undoStack, editPatch].slice(-undoRedo.maxStackSize),
              redoStack: [], // Clear redo stack on new edit
            };

            return {
              ...state,
              patches: new Map(state.patches.set(sheetId, newPatches)),
              undoRedo: new Map(state.undoRedo.set(sheetId, newUndoRedo)),
            };
          });
        },

        undo: (sheetId: SheetId) => {
          set(state => {
            const undoRedo = state.undoRedo.get(sheetId);
            const patches = state.patches.get(sheetId);
            if (!undoRedo || !patches || undoRedo.undoStack.length === 0) return state;

            const lastPatch = undoRedo.undoStack[undoRedo.undoStack.length - 1]!;

            // Restore old value
            const newPatches = new Map(patches);
            const rowPatches = newPatches.get(lastPatch.rowId);
            if (rowPatches) {
              if (lastPatch.oldValue === '') {
                rowPatches.delete(lastPatch.columnIndex);
                if (rowPatches.size === 0) {
                  newPatches.delete(lastPatch.rowId);
                }
              } else {
                rowPatches.set(lastPatch.columnIndex, lastPatch.oldValue);
              }
            }

            // Update undo/redo stacks
            const newUndoRedo: UndoRedoState = {
              ...undoRedo,
              undoStack: undoRedo.undoStack.slice(0, -1),
              redoStack: [...undoRedo.redoStack, lastPatch],
            };

            return {
              ...state,
              patches: new Map(state.patches.set(sheetId, newPatches)),
              undoRedo: new Map(state.undoRedo.set(sheetId, newUndoRedo)),
            };
          });
        },

        redo: (sheetId: SheetId) => {
          set(state => {
            const undoRedo = state.undoRedo.get(sheetId);
            const patches = state.patches.get(sheetId);
            if (!undoRedo || !patches || undoRedo.redoStack.length === 0) return state;

            const redoPatch = undoRedo.redoStack[undoRedo.redoStack.length - 1]!;

            // Apply new value
            const newPatches = new Map(patches);
            if (!newPatches.has(redoPatch.rowId)) {
              newPatches.set(redoPatch.rowId, new Map());
            }
            newPatches.get(redoPatch.rowId)!.set(redoPatch.columnIndex, redoPatch.newValue);

            // Update undo/redo stacks
            const newUndoRedo: UndoRedoState = {
              ...undoRedo,
              undoStack: [...undoRedo.undoStack, redoPatch],
              redoStack: undoRedo.redoStack.slice(0, -1),
            };

            return {
              ...state,
              patches: new Map(state.patches.set(sheetId, newPatches)),
              undoRedo: new Map(state.undoRedo.set(sheetId, newUndoRedo)),
            };
          });
        },

        // View State Management
        updateViewState: (sheetId: SheetId, updates: Partial<ViewState>) => {
          set(state => {
            const currentViewState = state.viewStates.get(sheetId) || createInitialViewState();
            const newViewState = { ...currentViewState, ...updates };

            return {
              ...state,
              viewStates: new Map(state.viewStates.set(sheetId, newViewState)),
            };
          });
        },

        applyFilter: (sheetId: SheetId, columnIndex: number, filter: FilterClause[]) => {
          set(state => {
            const viewState = state.viewStates.get(sheetId) || createInitialViewState();
            const newFilters = { ...viewState.filters };

            if (filter.length === 0) {
              delete newFilters[columnIndex];
            } else {
              newFilters[columnIndex] = filter;
            }

            const newViewState = { ...viewState, filters: newFilters };

            return {
              ...state,
              viewStates: new Map(state.viewStates.set(sheetId, newViewState)),
            };
          });
        },

        applySort: (sheetId: SheetId, sorts: Array<{ col: number; dir: 'asc' | 'desc' }>) => {
          set(state => {
            const viewState = state.viewStates.get(sheetId) || createInitialViewState();
            const newViewState = { ...viewState, sorts };

            return {
              ...state,
              viewStates: new Map(state.viewStates.set(sheetId, newViewState)),
            };
          });
        },

        updateColumnOrder: (sheetId: SheetId, newOrder: number[]) => {
          set(state => {
            const sheet = state.sheets.get(sheetId);
            if (!sheet) return state;

            const newSheets = new Map(state.sheets);
            newSheets.set(sheetId, { ...sheet, columnOrder: newOrder });

            return {
              ...state,
              sheets: newSheets,
            };
          });
        },

        updateColumnVisibility: (sheetId: SheetId, columnIndex: number, visible: boolean) => {
          set(state => {
            const sheet = state.sheets.get(sheetId);
            if (!sheet) return state;

            const newHidden = [...sheet.hidden];
            newHidden[columnIndex] = !visible;

            const newSheets = new Map(state.sheets);
            newSheets.set(sheetId, { ...sheet, hidden: newHidden });

            return {
              ...state,
              sheets: newSheets,
            };
          });
        },

        setGlobalSearch: (searchTerm: string) => {
          set(state => ({
            ...state,
            globalSearch: searchTerm
          }));
        },

        // Export Operations (Placeholder implementations)
        exportSheet: async (sheetId: SheetId, options: ExportOptions) => {
          // TODO: Implement export functionality
          console.log('Export sheet:', sheetId, options);
        },

        exportAll: async (options: ExportOptions) => {
          // TODO: Implement export all functionality
          console.log('Export all:', options);
        },

        setExportProgress: (progress: ExportProgress | null) => {
          set(state => ({
            ...state,
            exportProgress: progress
          }));
        },

        // UI State
        toggleSidebar: () => {
          set(state => ({
            ...state,
            sidebarCollapsed: !state.sidebarCollapsed
          }));
        },

        toggleWarningsPanel: () => {
          set(state => ({
            ...state,
            warningsPanelOpen: !state.warningsPanelOpen
          }));
        },

        toggleExportPanel: () => {
          set(state => ({
            ...state,
            exportPanelOpen: !state.exportPanelOpen
          }));
        },

        setPerformanceMode: (enabled: boolean) => {
          set(state => ({
            ...state,
            isPerformanceMode: enabled
          }));
        },

        updateMemoryEstimate: (estimate: MemoryEstimate) => {
          set(state => ({
            ...state,
            memoryEstimate: estimate
          }));
        },

        // Utility Actions
        clearAllSheets: () => {
          set(state => ({
            ...state,
            sheets: new Map(),
            patches: new Map(),
            undoRedo: new Map(),
            viewStates: new Map(),
            activeSheetId: null,
          }));
        },

        addWarning: (sheetId: SheetId, warning: Warning) => {
          set(state => {
            const sheet = state.sheets.get(sheetId);
            if (!sheet) return state;

            const newSheets = new Map(state.sheets);
            newSheets.set(sheetId, {
              ...sheet,
              warnings: [...sheet.warnings, warning]
            });

            return {
              ...state,
              sheets: newSheets,
            };
          });
        },

        removeWarning: (sheetId: SheetId, warningId: string) => {
          set(state => {
            const sheet = state.sheets.get(sheetId);
            if (!sheet) return state;

            const newSheets = new Map(state.sheets);
            newSheets.set(sheetId, {
              ...sheet,
              warnings: sheet.warnings.filter(w => w.id !== warningId)
            });

            return {
              ...state,
              sheets: newSheets,
            };
          });
        },

        // Worker Integration (Placeholder implementations)
        handleParseProgress: (sheetId: SheetId, progress: any) => {
          get().updateSheetMeta(sheetId, {
            parseProgress: progress.percentage || 0
          });
        },

        handleParseComplete: (sheetId: SheetId, result: any) => {
          get().updateSheetMeta(sheetId, {
            isLoading: false,
            parseProgress: 100,
            headers: result.headers || [],
            stats: {
              rows: result.totalRows || 0,
              cols: result.headers?.length || 0,
              fileSize: get().sheets.get(sheetId)?.stats.fileSize || 0,
            },
            warnings: result.warnings || [],
          });
        },

        handleParseError: (sheetId: SheetId, error: string) => {
          get().updateSheetMeta(sheetId, {
            isLoading: false,
            error
          });
        },
      }),
      {
        name: 'csv-parser-store',
        // Only persist UI preferences, not the actual data
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          warningsPanelOpen: state.warningsPanelOpen,
          exportPanelOpen: state.exportPanelOpen,
          globalSearch: state.globalSearch,
        }),
      }
    ),
    {
      name: 'csv-parser-store',
    }
  )
);
