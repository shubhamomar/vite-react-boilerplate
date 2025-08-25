import React from 'react';
import { useCSVParserStore } from '../stores/csvParserStore';
import { formatNumber, formatFileSize } from '../utils/helpers';
import {
  UndoIcon,
  RedoIcon,
  SaveIcon,
  AlertTriangleIcon,
  InfoIcon,
  ClockIcon,
  DatabaseIcon
} from 'lucide-react';

const StatusBar: React.FC = () => {
  const {
    activeSheetId,
    sheets,
    patches,
    undoRedo,
    viewStates,
    memoryEstimate,
    undo,
    redo,
    toggleWarningsPanel,
  } = useCSVParserStore();

  const activeSheet = activeSheetId ? sheets.get(activeSheetId) : null;
  const sheetPatches = activeSheetId ? patches.get(activeSheetId) : null;
  const undoRedoState = activeSheetId ? undoRedo.get(activeSheetId) : null;
  const viewState = activeSheetId ? viewStates.get(activeSheetId) : null;

  if (!activeSheet) {
    return null;
  }

  const totalEdits = sheetPatches ? Array.from(sheetPatches.values()).reduce(
    (total, rowPatches) => total + rowPatches.size, 0
  ) : 0;

  const canUndo = (undoRedoState?.undoStack.length || 0) > 0;
  const canRedo = (undoRedoState?.redoStack.length || 0) > 0;
  const hasWarnings = activeSheet.warnings.length > 0;
  const activeFilters = Object.keys(viewState?.filters || {}).length;

  const handleUndo = () => {
    if (activeSheetId && canUndo) {
      undo(activeSheetId);
    }
  };

  const handleRedo = () => {
    if (activeSheetId && canRedo) {
      redo(activeSheetId);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Sheet Stats */}
          <div className="flex items-center space-x-6">
            {/* Row/Column Count */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DatabaseIcon className="h-4 w-4" />
              <span className="font-medium">
                {formatNumber(activeSheet.stats.rows)} rows × {activeSheet.stats.cols} columns
              </span>
            </div>

            {/* File Size */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <InfoIcon className="h-4 w-4" />
              <span>{formatFileSize(activeSheet.stats.fileSize)}</span>
            </div>

            {/* Memory Usage */}
            {memoryEstimate.totalMB > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Memory: {memoryEstimate.totalMB.toFixed(1)} MB</span>
              </div>
            )}

            {/* Storage Type */}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                activeSheet.storage === 'indexeddb'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {activeSheet.storage === 'indexeddb' ? 'Disk' : 'Memory'}
              </span>
            </div>
          </div>

          {/* Center Section - Edit Actions */}
          <div className="flex items-center space-x-3">
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canUndo
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Undo last edit"
                title={`Undo (${undoRedoState?.undoStack.length || 0} available)`}
              >
                <UndoIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canRedo
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Redo last undone edit"
                title={`Redo (${undoRedoState?.redoStack.length || 0} available)`}
              >
                <RedoIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Edit Count */}
            {totalEdits > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                <SaveIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {totalEdits} unsaved edit{totalEdits !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Right Section - Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Active Filters */}
            {activeFilters > 0 && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <span className="font-medium">
                  {activeFilters} filter{activeFilters !== 1 ? 's' : ''} active
                </span>
              </div>
            )}

            {/* Search Term */}
            {viewState?.searchTerm && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <span className="font-medium">
                  Searching: "{viewState.searchTerm}"
                </span>
              </div>
            )}

            {/* Warnings */}
            {hasWarnings && (
              <button
                onClick={toggleWarningsPanel}
                className="flex items-center space-x-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-200"
              >
                <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  {activeSheet.warnings.length} warning{activeSheet.warnings.length !== 1 ? 's' : ''}
                </span>
              </button>
            )}

            {/* Parse Time */}
            {!activeSheet.isLoading && activeSheet.stats.rows > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>Loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading Progress Bar */}
        {activeSheet.isLoading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Processing CSV file...</span>
              <span>{Math.round(activeSheet.parseProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-m3-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeSheet.parseProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
