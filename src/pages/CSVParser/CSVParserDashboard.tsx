import React, { useEffect, useRef } from 'react';
import { useCSVParserStore } from './stores/csvParserStore';
import type { WorkerMessage } from './stores/types';
import { checkBrowserSupport, generateFileHash } from './utils/helpers';

// Components
import FileUploader from './components/FileUploader';
import SheetTabs from './components/SheetTabs';
import FiltersSidebar from './components/FiltersSidebar';
import DataGrid from './components/DataGrid';
import StatusBar from './components/StatusBar';
import WarningsPanel from './components/WarningsPanel';
import ExportPanel from './components/ExportPanel';

// Icons
import { AlertTriangleIcon, InfoIcon } from 'lucide-react';

const CSVParserDashboard: React.FC = () => {
  const workerRef = useRef<Worker | null>(null);
  const {
    sheets,
    activeSheetId,
    sidebarCollapsed,
    warningsPanelOpen,
    exportPanelOpen,
    isPerformanceMode,
    handleParseProgress,
    handleParseComplete,
    handleParseError,
    setPerformanceMode,
    addSheet: addSheetToStore,
  } = useCSVParserStore();

  const activeSheet = activeSheetId ? sheets.get(activeSheetId) : null;
  const hasSheets = sheets.size > 0;

  // Enhanced addSheet function that triggers worker
  const addSheet = async (file: File) => {
    await addSheetToStore(file);

    // Get the sheet ID to send to worker
    const sheetId = await generateFileHash(file);

    // Start worker parsing after a small delay to ensure state is updated
    setTimeout(() => {
      if (workerRef.current) {
        const updatedSheets = useCSVParserStore.getState().sheets;
        const sheet = updatedSheets.get(sheetId);
        if (sheet) {
          console.log('Starting worker for sheet:', sheetId, sheet.parseOptions);
          workerRef.current.postMessage({
            type: 'PARSE_START',
            sheetId,
            file,
            options: sheet.parseOptions,
          });
        } else {
          console.error('Sheet not found after creation:', sheetId);
        }
      } else {
        console.error('Worker not initialized');
      }
    }, 100);
  };

  // Check browser support on mount
  useEffect(() => {
    const support = checkBrowserSupport();
    if (!support.supported) {
      console.error('Browser missing required features:', support.missing);
      // TODO: Show user-friendly error message
    }
  }, []);

  // Initialize worker
  useEffect(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL('./workers/csvParser.worker.ts', import.meta.url),
          { type: 'module' }
        );

                workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
          const message = event.data;

          switch (message.type) {
            case 'PARSE_PROGRESS':
              handleParseProgress(message.sheetId, {
                percentage: ((message as any).bytesProcessed / (message as any).totalBytes) * 100,
                rowsParsed: (message as any).rowsParsed,
                elapsedMs: (message as any).elapsedMs,
              });
              break;

            case 'PARSE_COMPLETE':
              handleParseComplete(message.sheetId, {
                headers: (message as any).headers,
                totalRows: (message as any).totalRows,
                warnings: (message as any).warnings,
                detectedOptions: (message as any).detectedOptions,
                data: (message as any).data, // Include the parsed data
              });
              break;

            case 'PARSE_ERROR':
              handleParseError(message.sheetId, (message as any).error || 'Unknown error');
              break;

            default:
              console.log('Worker message:', message);
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
        };

      } catch (error) {
        console.error('Failed to create worker:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [handleParseProgress, handleParseComplete, handleParseError]);

  // Auto-detect performance mode
  useEffect(() => {
    const shouldUsePerformanceMode = Array.from(sheets.values()).some(
      sheet => sheet.storage === 'indexeddb' || sheet.stats.rows > 100000
    );

    if (shouldUsePerformanceMode !== isPerformanceMode) {
      setPerformanceMode(shouldUsePerformanceMode);
    }
  }, [sheets, isPerformanceMode, setPerformanceMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Mesh Gradient */}
      <header
        className="relative overflow-hidden bg-gradient-to-br from-m3-primary to-blue-600 text-white shadow-lg"
        style={{
          background: `radial-gradient(circle at 25% 25%, #2196f3 0%, #1976d2 25%, #1565c0 50%, #0d47a1 75%, #1976d2 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 w-full px-fluid-sm md:px-fluid-md lg:px-fluid-lg xl:px-fluid-xl py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                CSV Parser & Editor
              </h1>
              <p className="text-lg text-white/90">
                Multi-sheet CSV viewer with inline editing, filtering, and export capabilities
              </p>
            </div>

            {/* Performance Mode Indicator */}
            {isPerformanceMode && (
              <div className="hidden lg:flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <InfoIcon className="h-5 w-5 text-white/80" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Performance Mode</div>
                  <div className="text-white/80">Large dataset optimization active</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </header>

      {/* Sheet Tabs */}
      {hasSheets && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="w-full px-fluid-sm md:px-fluid-md lg:px-fluid-lg xl:px-fluid-xl">
            <SheetTabs />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-fluid-sm md:px-fluid-md lg:px-fluid-lg xl:px-fluid-xl py-6">
        {!hasSheets ? (
          // Empty State - File Upload
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="max-w-2xl w-full">
              <FileUploader addSheet={addSheet} />
            </div>
          </div>
        ) : (
          // Main Interface
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            {!sidebarCollapsed && (
              <div className="lg:col-span-1">
                <FiltersSidebar />
              </div>
            )}

            {/* Data Grid */}
            <div className={`${sidebarCollapsed ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
              {activeSheet ? (
                <div className="space-y-6">
                  {/* Grid Container */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataGrid />
                  </div>

                  {/* Status Bar */}
                  <StatusBar />
                </div>
              ) : (
                // No Active Sheet
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <AlertTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Sheet Selected
                  </h3>
                  <p className="text-gray-600">
                    Select a sheet tab above or upload a new CSV file to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warnings Panel */}
      {warningsPanelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <WarningsPanel />
        </div>
      )}

      {/* Export Panel */}
      {exportPanelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <ExportPanel />
        </div>
      )}
    </div>
  );
};

export default CSVParserDashboard;
