import React, { useState } from 'react';
import { useCSVParserStore } from '../stores/csvParserStore';
import type { ExportOptions } from '../stores/types';
import {
  DownloadIcon,
  XIcon,
  FileTextIcon,
  ArchiveIcon,
  CheckIcon
} from 'lucide-react';

const ExportPanel: React.FC = () => {
  const {
    activeSheetId,
    sheets,
    exportPanelOpen,
    exportProgress,
    toggleExportPanel,
    exportSheet,
    exportAll,
  } = useCSVParserStore();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeHeaders: true,
    lineEnding: '\n',
    delimiter: ',',
    quoteStrings: true,
    visibleColumnsOnly: false,
  });

  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');

  const activeSheet = activeSheetId ? sheets.get(activeSheetId) : null;
  const hasMultipleSheets = sheets.size > 1;

  if (!exportPanelOpen) {
    return null;
  }

  const handleExport = async () => {
    try {
      if (exportScope === 'current' && activeSheetId) {
        await exportSheet(activeSheetId, exportOptions);
      } else {
        await exportAll(exportOptions);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DownloadIcon className="h-5 w-5 text-m3-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
          </div>
          <button
            onClick={toggleExportPanel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close export panel"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Scope */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Scope</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    value="current"
                    checked={exportScope === 'current'}
                    onChange={(e) => setExportScope(e.target.value as 'current')}
                    className="text-m3-primary focus:ring-m3-primary"
                  />
                  <div className="flex items-center space-x-2">
                    <FileTextIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Current Sheet ({activeSheet?.name || 'Unknown'})
                    </span>
                  </div>
                </label>

                {hasMultipleSheets && (
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      value="all"
                      checked={exportScope === 'all'}
                      onChange={(e) => setExportScope(e.target.value as 'all')}
                      className="text-m3-primary focus:ring-m3-primary"
                    />
                    <div className="flex items-center space-x-2">
                      <ArchiveIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        All Sheets ({sheets.size} total)
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Format Options */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Format Options</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">File Format</label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => updateExportOptions({ format: e.target.value as 'csv' | 'zip' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-m3-primary focus:border-transparent"
                  >
                    <option value="csv">CSV (.csv)</option>
                    {(exportScope === 'all' || hasMultipleSheets) && (
                      <option value="zip">ZIP Archive (.zip)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Delimiter</label>
                  <select
                    value={exportOptions.delimiter}
                    onChange={(e) => updateExportOptions({ delimiter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-m3-primary focus:border-transparent"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab (\t)</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Line Ending</label>
                  <select
                    value={exportOptions.lineEnding}
                    onChange={(e) => updateExportOptions({ lineEnding: e.target.value as '\n' | '\r\n' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-m3-primary focus:border-transparent"
                  >
                    <option value="\n">Unix (LF)</option>
                    <option value="\r\n">Windows (CRLF)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHeaders}
                    onChange={(e) => updateExportOptions({ includeHeaders: e.target.checked })}
                    className="text-m3-primary focus:ring-m3-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Include headers</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.quoteStrings}
                    onChange={(e) => updateExportOptions({ quoteStrings: e.target.checked })}
                    className="text-m3-primary focus:ring-m3-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Quote text fields</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.visibleColumnsOnly}
                    onChange={(e) => updateExportOptions({ visibleColumnsOnly: e.target.checked })}
                    className="text-m3-primary focus:ring-m3-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Visible columns only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {exportProgress && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Exporting {exportProgress.currentSheet || 'data'}...
                </span>
                <span className="text-sm text-blue-700">
                  {exportProgress.sheetsProcessed} / {exportProgress.totalSheets}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(exportProgress.sheetsProcessed / exportProgress.totalSheets) * 100}%`
                  }}
                />
              </div>
              {exportProgress.isComplete && exportProgress.downloadUrl && (
                <div className="mt-3 flex items-center space-x-2">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Export complete!</span>
                  <a
                    href={exportProgress.downloadUrl}
                    download={exportProgress.fileName}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Download file
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {exportScope === 'current' && activeSheet && (
                <span>
                  {activeSheet.stats.rows.toLocaleString()} rows × {activeSheet.stats.cols} columns
                </span>
              )}
              {exportScope === 'all' && (
                <span>
                  {Array.from(sheets.values()).reduce((total, sheet) => total + sheet.stats.rows, 0).toLocaleString()} total rows across {sheets.size} sheets
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleExportPanel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!activeSheet || exportProgress?.isComplete === false}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  !activeSheet || exportProgress?.isComplete === false
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-m3-primary text-white hover:bg-blue-700 focus:ring-2 focus:ring-m3-primary focus:ring-offset-2'
                }`}
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Export {exportScope === 'current' ? 'Sheet' : 'All'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
