import React from 'react';
import { useCSVParserStore } from '../stores/csvParserStore';
import { AlertTriangleIcon, XIcon, InfoIcon, AlertCircleIcon } from 'lucide-react';

const WarningsPanel: React.FC = () => {
  const {
    activeSheetId,
    sheets,
    warningsPanelOpen,
    toggleWarningsPanel,
    removeWarning,
  } = useCSVParserStore();

  const activeSheet = activeSheetId ? sheets.get(activeSheetId) : null;
  const warnings = activeSheet?.warnings || [];

  if (!warningsPanelOpen || warnings.length === 0) {
    return null;
  }

  const getWarningIcon = (_type: string, severity: string) => {
    if (severity === 'high') {
      return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
    }
    if (severity === 'medium') {
      return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
    }
    return <InfoIcon className="h-5 w-5 text-blue-500" />;
  };

  const getWarningColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Parsing Warnings ({warnings.length})
            </h3>
          </div>
          <button
            onClick={toggleWarningsPanel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close warnings panel"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Warnings List */}
        <div className="py-4 max-h-60 overflow-y-auto">
          <div className="space-y-3">
            {warnings.map((warning) => (
              <div
                key={warning.id}
                className={`border rounded-lg p-4 ${getWarningColor(warning.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {getWarningIcon(warning.type, warning.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {warning.type.replace('-', ' ')}
                        </span>
                        {warning.rowNumber && (
                          <span className="text-xs text-gray-500">
                            Row {warning.rowNumber}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          warning.severity === 'high' ? 'bg-red-100 text-red-800' :
                          warning.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {warning.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {warning.message}
                      </p>
                      {warning.sample && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                          Sample: {warning.sample}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => activeSheetId && removeWarning(activeSheetId, warning.id)}
                    className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label="Dismiss warning"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="py-3 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            These warnings don't prevent data parsing but may indicate formatting issues.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarningsPanel;
