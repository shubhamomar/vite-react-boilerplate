import React, { useState } from 'react';
import { useCSVParserStore } from '../stores/csvParserStore';
import { formatFileSize, formatNumber } from '../utils/helpers';

// Icons
import {
  XIcon,
  FileTextIcon,
  AlertTriangleIcon,
  LoaderIcon,
  DownloadIcon,
  CopyIcon
} from 'lucide-react';

const SheetTabs: React.FC = () => {
  const {
    sheets,
    activeSheetId,
    setActiveSheet,
    removeSheet,
    toggleExportPanel,
  } = useCSVParserStore();

  const [contextMenuSheet, setContextMenuSheet] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const sheetArray = Array.from(sheets.values());

  const handleTabClick = (sheetId: string) => {
    setActiveSheet(sheetId);
  };

  const handleTabClose = (e: React.MouseEvent, sheetId: string) => {
    e.stopPropagation();
    removeSheet(sheetId);
  };

  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenuSheet(sheetId);
    setShowContextMenu(true);

    // Close context menu when clicking elsewhere
    const handleClickOutside = () => {
      setShowContextMenu(false);
      setContextMenuSheet(null);
      document.removeEventListener('click', handleClickOutside);
    };

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
  };

  const handleExportSheet = (sheetId: string) => {
    setActiveSheet(sheetId);
    toggleExportPanel();
    setShowContextMenu(false);
    setContextMenuSheet(null);
  };

  const handleDuplicateSheet = (sheetId: string) => {
    // TODO: Implement sheet duplication
    console.log('Duplicate sheet:', sheetId);
    setShowContextMenu(false);
    setContextMenuSheet(null);
  };

  if (sheetArray.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Horizontal scroll container */}
      <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex space-x-1 py-3 min-w-max">
          {sheetArray.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            const hasWarnings = sheet.warnings.length > 0;
            const hasError = Boolean(sheet.error);

                        return (
              <div key={sheet.id} className="relative group">
                {/* Tab Container */}
                <div
                  className={`
                    relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    min-w-[200px] max-w-[300px] group cursor-pointer
                    ${isActive
                      ? 'bg-white text-m3-primary shadow-sm border border-gray-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                    }
                    ${hasError ? 'border-red-300 bg-red-50' : ''}
                  `}
                  onClick={() => handleTabClick(sheet.id)}
                  onContextMenu={(e) => handleContextMenu(e, sheet.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Sheet: ${sheet.name}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTabClick(sheet.id);
                    }
                  }}
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {sheet.isLoading ? (
                      <LoaderIcon className="h-4 w-4 animate-spin text-m3-primary" />
                    ) : (
                      <FileTextIcon className={`h-4 w-4 ${isActive ? 'text-m3-primary' : 'text-gray-500'}`} />
                    )}
                  </div>

                  {/* Sheet Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium truncate">
                        {sheet.name}
                      </span>

                      {/* Status Indicators */}
                      {hasWarnings && !hasError && (
                        <AlertTriangleIcon className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      )}
                      {hasError && (
                        <AlertTriangleIcon className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-xs text-gray-500 mt-0.5">
                      {sheet.isLoading ? (
                        <span>Processing {Math.round(sheet.parseProgress)}%...</span>
                      ) : sheet.error ? (
                        <span className="text-red-600">Error: {sheet.error}</span>
                      ) : (
                        <span>
                          {formatNumber(sheet.stats.rows)} rows • {formatFileSize(sheet.stats.fileSize)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={(e) => handleTabClose(e, sheet.id)}
                    className={`
                      flex-shrink-0 rounded-full p-1 transition-all duration-200
                      opacity-0 group-hover:opacity-100 hover:bg-gray-200
                      ${isActive ? 'opacity-100' : ''}
                    `}
                    aria-label="Close sheet"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>

                  {/* Loading Progress Bar */}
                  {sheet.isLoading && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-b-lg overflow-hidden">
                      <div
                        className="h-full bg-m3-primary transition-all duration-300"
                        style={{ width: `${sheet.parseProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Context Menu */}
                {showContextMenu && contextMenuSheet === sheet.id && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
                    <button
                      onClick={() => handleExportSheet(sheet.id)}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      <span>Export Sheet</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateSheet(sheet.id)}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <CopyIcon className="h-4 w-4" />
                      <span>Duplicate Sheet</span>
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={(e) => handleTabClose(e, sheet.id)}
                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <XIcon className="h-4 w-4" />
                      <span>Close Sheet</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Actions - Right Side */}
      <div className="absolute right-0 top-0 h-full flex items-center bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pl-6 pr-2">
        <button
          onClick={toggleExportPanel}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
          aria-label="Export options"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Mobile Tab Indicator */}
      <div className="sm:hidden flex justify-center pt-2">
        <div className="flex space-x-1">
          {sheetArray.map((sheet, index) => (
            <button
              key={sheet.id}
              onClick={() => handleTabClick(sheet.id)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                sheet.id === activeSheetId ? 'bg-m3-primary' : 'bg-gray-300'
              }`}
              aria-label={`Sheet ${index + 1}: ${sheet.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SheetTabs;
