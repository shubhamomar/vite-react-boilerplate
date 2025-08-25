import React from 'react';
import { useCSVParserStore } from '../stores/csvParserStore';
import { FunnelIcon, SearchIcon, XIcon } from 'lucide-react';

const FiltersSidebar: React.FC = () => {
  const {
    activeSheetId,
    sheets,
    viewStates,
    globalSearch,
    setGlobalSearch,
    updateViewState,
    toggleSidebar,
  } = useCSVParserStore();

  const activeSheet = activeSheetId ? sheets.get(activeSheetId) : null;
  const viewState = activeSheetId ? viewStates.get(activeSheetId) : null;

  if (!activeSheet || !viewState) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <FunnelIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No sheet selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-m3-primary" />
          <span>Filters</span>
        </h3>
        <button
          onClick={toggleSidebar}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Collapse sidebar"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Global Search */}
        <div>
          <label htmlFor="global-search" className="block text-sm font-medium text-gray-700 mb-2">
            Search All Data
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="global-search"
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search across all columns..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-m3-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Sheet Search */}
        <div>
          <label htmlFor="sheet-search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Current Sheet
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="sheet-search"
              type="text"
              value={viewState.searchTerm}
              onChange={(e) => updateViewState(activeSheetId!, { searchTerm: e.target.value })}
              placeholder="Search in current sheet..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-m3-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Density Setting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Row Density
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'cozy', 'comfortable'] as const).map((density) => (
              <button
                key={density}
                onClick={() => updateViewState(activeSheetId!, { density })}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
                  viewState.density === density
                    ? 'bg-m3-primary text-white border-m3-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {density.charAt(0).toUpperCase() + density.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Column Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Column Filters</h4>
          <div className="space-y-3">
            {activeSheet.headers.map((header, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {header || `Column ${index + 1}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {viewState.filters[index]?.length || 0} filter(s)
                  </span>
                </div>
                <button className="w-full text-xs text-m3-primary hover:text-blue-700 text-left">
                  Add filter...
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {Object.keys(viewState.filters).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
            <div className="space-y-2">
              {Object.entries(viewState.filters).map(([columnIndex]) => (
                <div key={columnIndex} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-900">
                    {activeSheet.headers[parseInt(columnIndex)] || `Column ${parseInt(columnIndex) + 1}`}
                  </span>
                  <button
                    onClick={() => {
                      const newFilters = { ...viewState.filters };
                      delete newFilters[parseInt(columnIndex)];
                      updateViewState(activeSheetId!, { filters: newFilters });
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersSidebar;
