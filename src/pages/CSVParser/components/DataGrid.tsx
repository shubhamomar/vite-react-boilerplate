import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useCSVParserStore } from '../stores/csvParserStore';

// AG Grid CSS (you'll need to import these in your main CSS file)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

// Register all AG Grid community modules
ModuleRegistry.registerModules([AllCommunityModule]);

const DataGrid: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const {
    activeSheetId,
    sheets,
    patches,
    viewStates,
    updateCell,
    updateViewState,
    isPerformanceMode,
  } = useCSVParserStore();

  const activeSheet = activeSheetId ? sheets.get(activeSheetId) : null;
  const sheetPatches = activeSheetId ? patches.get(activeSheetId) : null;
  const viewState = activeSheetId ? viewStates.get(activeSheetId) : null;

  // Generate column definitions
  const columnDefs = useMemo((): ColDef[] => {
    if (!activeSheet || !activeSheet.headers.length) {
      return [];
    }

    return activeSheet.headers.map((header, index) => ({
      field: `col_${index}`,
      headerName: header || `Column ${index + 1}`,
      width: 150,
      minWidth: 100,
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      hide: activeSheet.hidden[index] || false,
      cellEditor: 'agTextCellEditor',
      cellClass: 'ag-cell-editable',
      headerClass: 'ag-header-material',
      // Custom cell renderer to show patches
      cellRenderer: (params: any) => {
        const rowId = params.node.rowIndex;
        const columnIndex = index;
        const patchedValue = sheetPatches?.get(rowId)?.get(columnIndex);

        if (patchedValue !== undefined) {
          return `<span class="text-blue-600 font-medium">${patchedValue}</span>`;
        }

        return params.value || '';
      },
      // Cell style for edited cells
      cellStyle: (params: any) => {
        const rowId = params.node.rowIndex;
        const columnIndex = index;
        const isPatch = sheetPatches?.get(rowId)?.has(columnIndex);

        if (isPatch) {
          return {
            backgroundColor: '#eff6ff',
            borderLeft: '3px solid #3b82f6',
          };
        }
        return null;
      },
    }));
  }, [activeSheet, sheetPatches]);

  // Mock row data (in real implementation, this would come from your data adapter)
  const rowData = useMemo(() => {
    if (!activeSheet) return [];

    // Generate mock data for demonstration
    const mockData = [];
    for (let i = 0; i < Math.min(1000, activeSheet.stats.rows); i++) {
      const row: any = {};
      activeSheet.headers.forEach((_, colIndex) => {
        const patchedValue = sheetPatches?.get(i)?.get(colIndex);
        if (patchedValue !== undefined) {
          row[`col_${colIndex}`] = patchedValue;
        } else {
          // Mock data based on column index
          row[`col_${colIndex}`] = `Row ${i + 1}, Col ${colIndex + 1}`;
        }
      });
      mockData.push(row);
    }
    return mockData;
  }, [activeSheet, sheetPatches]);

  // Grid options
  const defaultColDef = useMemo((): ColDef => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
  }), []);

  // Handle cell value changes
  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    if (!activeSheetId) return;

    const rowId = event.node.rowIndex!;
    const columnIndex = parseInt(event.colDef.field!.replace('col_', ''));
    const newValue = event.newValue;

    updateCell(activeSheetId, rowId, columnIndex, newValue);
  }, [activeSheetId, updateCell]);

  // Handle grid ready
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns on initial load
    params.api.sizeColumnsToFit();

    // Apply saved view state
    if (viewState) {
      // Apply sorts
      if (viewState.sorts.length > 0) {
        const sortModel = viewState.sorts.map(sort => ({
          colId: `col_${sort.col}`,
          sort: sort.dir,
        }));
        params.api.applyColumnState({
          state: sortModel,
          defaultState: { sort: null }
        });
      }

      // Apply filters
      if (Object.keys(viewState.filters).length > 0) {
        // TODO: Apply filters to grid
      }
    }
  }, [viewState]);

  // Handle sort changes
  const onSortChanged = useCallback(() => {
    if (!activeSheetId || !gridRef.current) return;

    const api = gridRef.current.api;
    const columnState = api.getColumnState();

    const sorts = columnState
      .filter(col => col.sort)
      .map(col => ({
        col: parseInt(col.colId!.replace('col_', '')),
        dir: col.sort as 'asc' | 'desc',
      }));

    updateViewState(activeSheetId, { sorts });
  }, [activeSheetId, updateViewState]);

  // Handle filter changes
  const onFilterChanged = useCallback(() => {
    if (!activeSheetId || !gridRef.current) return;

    // TODO: Extract filter model and update view state
    console.log('Filter changed');
  }, [activeSheetId]);

  // Apply search filter
  useEffect(() => {
    if (!gridRef.current || !viewState) return;

    const api = gridRef.current.api;
    if (viewState.searchTerm) {
      api.setGridOption('quickFilterText', viewState.searchTerm);
    } else {
      api.setGridOption('quickFilterText', '');
    }
  }, [viewState?.searchTerm]);

  // Loading state
  if (!activeSheet) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No sheet selected</div>
          <div className="text-sm text-gray-500">Select a sheet tab to view data</div>
        </div>
      </div>
    );
  }

  if (activeSheet.isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary mx-auto mb-4"></div>
          <div className="text-gray-700 font-medium">Processing CSV file...</div>
          <div className="text-sm text-gray-500 mt-1">
            {Math.round(activeSheet.parseProgress)}% complete
          </div>
        </div>
      </div>
    );
  }

  if (activeSheet.error) {
    return (
      <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">Error loading sheet</div>
          <div className="text-sm text-red-500">{activeSheet.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full">
      <div
        className={`ag-theme-material h-full w-full ${
          viewState?.density === 'compact' ? 'ag-theme-compact' :
          viewState?.density === 'comfortable' ? 'ag-theme-comfortable' :
          'ag-theme-cozy'
        }`}
        style={{
          '--ag-header-background-color': '#f8fafc',
          '--ag-header-foreground-color': '#1e293b',
          '--ag-border-color': '#e2e8f0',
          '--ag-row-hover-color': '#f1f5f9',
          '--ag-selected-row-background-color': '#dbeafe',
          '--ag-cell-horizontal-border': '1px solid #e2e8f0',
          '--ag-row-border-color': '#e2e8f0',
          '--ag-font-family': 'Inter, system-ui, sans-serif',
          '--ag-font-size': '14px',
        } as React.CSSProperties}
      >
        <AgGridReact
          ref={gridRef}
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}

          // Performance settings
          suppressCellFocus={false}
          enableCellTextSelection={true}
          animateRows={!isPerformanceMode}

          // Row selection (updated for v32.2+)
          rowSelection={{
            mode: 'multiRow',
            enableClickSelection: false, // Don't select on row click
          }}

          // Pagination (for large datasets)
          pagination={isPerformanceMode}
          paginationPageSize={isPerformanceMode ? 100 : undefined}

          // Note: Cell selection (cellSelection) requires Enterprise license
          // Using basic row selection available in Community edition

          // Accessibility
          // Note: accessibility handled by AG Grid internally

          // Loading overlay
          overlayLoadingTemplate="<span class='ag-overlay-loading-center'>Loading data...</span>"
          overlayNoRowsTemplate="<span class='ag-overlay-no-rows-center'>No data to display</span>"
        />
      </div>

      {/* Grid Controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            {activeSheet.stats.rows.toLocaleString()} rows × {activeSheet.stats.cols} columns
          </span>
          {Object.keys(viewState?.filters || {}).length > 0 && (
            <span className="text-m3-primary">
              {Object.keys(viewState?.filters || {}).length} filter(s) active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isPerformanceMode && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Performance Mode
            </span>
          )}
          {(sheetPatches?.size || 0) > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              {Array.from(sheetPatches?.values() || []).reduce((total, rowPatches) => total + rowPatches.size, 0)} edit(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
