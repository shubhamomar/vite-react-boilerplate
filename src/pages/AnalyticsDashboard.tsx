import React, { useState, useEffect } from 'react';
import { ChartBarIcon, TableCellsIcon, FunnelIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

// Mock data interfaces
interface ChartData {
  name: string;
  value: number;
  change: number;
}

interface TableRow {
  id: string;
  name: string;
  value: number;
  status: 'success' | 'warning' | 'error';
  date: string;
}

interface TabData {
  id: string;
  title: string;
  summary: {
    totalValue: number;
    change: number;
    trend: 'up' | 'down';
  };
  charts: ChartData[];
  tableData: TableRow[];
}

// Mock data for different workflow steps
const mockTabsData: TabData[] = [
  {
    id: 'leads',
    title: 'Lead Generation',
    summary: { totalValue: 1247, change: 12.5, trend: 'up' },
    charts: [
      { name: 'Organic', value: 425, change: 8.2 },
      { name: 'Paid Ads', value: 312, change: -2.1 },
      { name: 'Social', value: 287, change: 15.6 },
      { name: 'Email', value: 223, change: 5.4 },
    ],
    tableData: [
      { id: '1', name: 'Google Ads Campaign', value: 156, status: 'success', date: '2024-01-15' },
      { id: '2', name: 'Facebook Campaign', value: 89, status: 'warning', date: '2024-01-14' },
      { id: '3', name: 'LinkedIn Outreach', value: 67, status: 'success', date: '2024-01-13' },
    ]
  },
  {
    id: 'qualification',
    title: 'Lead Qualification',
    summary: { totalValue: 892, change: -3.2, trend: 'down' },
    charts: [
      { name: 'Qualified', value: 534, change: 12.1 },
      { name: 'Unqualified', value: 358, change: -8.5 },
    ],
    tableData: [
      { id: '1', name: 'Enterprise Prospects', value: 234, status: 'success', date: '2024-01-15' },
      { id: '2', name: 'SMB Prospects', value: 187, status: 'warning', date: '2024-01-14' },
      { id: '3', name: 'Cold Leads', value: 113, status: 'error', date: '2024-01-13' },
    ]
  },
  {
    id: 'conversion',
    title: 'Conversion',
    summary: { totalValue: 456, change: 18.7, trend: 'up' },
    charts: [
      { name: 'Demo Booked', value: 178, change: 22.3 },
      { name: 'Proposal Sent', value: 143, change: 15.2 },
      { name: 'Closed Won', value: 135, change: 28.1 },
    ],
    tableData: [
      { id: '1', name: 'Enterprise Deals', value: 87, status: 'success', date: '2024-01-15' },
      { id: '2', name: 'Mid-Market', value: 48, status: 'success', date: '2024-01-14' },
    ]
  }
];

// Tab content component
const TabContent: React.FC<{ data: TabData; searchTerm: string }> = ({ data, searchTerm }) => {
  const filteredTableData = data.tableData.filter(row =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-m3-primary to-blue-600 rounded-xl p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <ChartBarIcon className="h-6 w-6 mr-2 text-white/90" />
                <h2 className="text-lg font-medium text-white/90">{data.title} Overview</h2>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{data.summary.totalValue.toLocaleString()}</span>
                <span className="text-lg text-white/80 ml-2">Total</span>
              </div>
              <div className="flex items-center">
                {data.summary.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-300 mr-2" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-300 mr-2" />
                )}
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  data.summary.trend === 'up'
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                }`}>
                  {data.summary.change > 0 ? '+' : ''}{data.summary.change}% from last period
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ChartBarIcon className="h-12 w-12 text-white/80" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

            {/* Enhanced Charts Section */}
      <div className="bg-m3-surface border border-m3-outline rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-m3-onSurface flex items-center">
            <div className="p-2 bg-m3-primary/10 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-m3-primary" />
            </div>
            Key Performance Metrics
          </h3>
          <div className="text-sm text-m3-onSurface/60">Real-time data</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 hd:grid-cols-6 fhd:grid-cols-7 qhd:grid-cols-8 gap-4">
          {data.charts.map((chart, index) => {
            const isPositive = chart.change > 0;
            const gradientColors = [
              'from-blue-500 to-blue-600',
              'from-emerald-500 to-emerald-600',
              'from-purple-500 to-purple-600',
              'from-orange-500 to-orange-600'
            ];

            return (
              <div
                key={index}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2 hover:-translate-y-1"
                tabIndex={0}
                role="button"
                aria-label={`${chart.name} metric: ${chart.value}`}
              >
                {/* Background gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-600">{chart.name}</div>
                    <div className={`p-1.5 rounded-lg ${gradientColors[index % gradientColors.length]} bg-gradient-to-br`}>
                      <ChartBarIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {chart.value.toLocaleString()}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${gradientColors[index % gradientColors.length]} transition-all duration-500`}
                        style={{ width: `${Math.min((chart.value / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                      isPositive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isPositive ? (
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(chart.change)}%
                    </div>
                    <div className="text-xs text-gray-500">vs last period</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

            {/* Enhanced Table Section */}
      <div className="bg-m3-surface border border-m3-outline rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-m3-outline bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-xl font-semibold text-m3-onSurface flex items-center">
            <div className="p-2 bg-m3-primary/10 rounded-lg mr-3">
              <TableCellsIcon className="h-5 w-5 text-m3-primary" />
            </div>
            Detailed Performance Data
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" role="table">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Campaign Name
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Performance Value
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTableData.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        row.status === 'success' ? 'bg-emerald-400' :
                        row.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                      }`}></div>
                      <div className="text-sm font-medium text-gray-900">{row.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-lg font-bold text-gray-900 font-mono">
                      {row.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                      row.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : row.status === 'warning'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        row.status === 'success' ? 'bg-emerald-400' :
                        row.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                      }`}></div>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(row.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTableData.length === 0 && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matching results</h3>
              <p className="text-gray-500">No data matches your current search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(mockTabsData[0]?.id ?? 'leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate data loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchTerm(''); // Reset search when switching tabs
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const activeTabData = mockTabsData.find(tab => tab.id === activeTab);

  if (error) {
    return (
      <div className="min-h-screen bg-m3-surface p-4 flex items-center justify-center">
        <div className="bg-m3-surfaceContainer border border-m3-outline rounded-lg p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-m3-onSurface mb-2">Failed to Load Data</h2>
          <p className="text-m3-onSurface mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-m3-primary text-m3-onPrimary px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with Gradient */}
        <header className="bg-gradient-to-r from-white to-blue-50 border-b border-gray-200 shadow-sm" role="banner">
          <div className="w-full px-fluid-sm md:px-fluid-md lg:px-fluid-lg xl:px-fluid-xl py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-lg text-gray-600">Monitor workflow performance across all stages with real-time insights</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Last updated</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Enhanced Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 shadow-sm" role="tablist" aria-label="Analytics sections">
        <div className="w-full px-fluid-sm md:px-fluid-md lg:px-fluid-lg xl:px-fluid-xl">
          {/* Mobile dropdown for smaller screens */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select analytics section"
            >
              {mockTabsData.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.title}</option>
              ))}
            </select>
          </div>

          {/* Desktop horizontal tabs */}
          <div className="hidden sm:flex space-x-1">
            {mockTabsData.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-6 py-4 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <span className="relative z-10">{tab.title}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-t-lg"></div>
                )}
                {/* Step indicator */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <div className={`w-6 h-1 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Filters Sidebar and Main Content */}
      <div className="w-full px-fluid-sm md:px-fluid-md lg:px-fluid-lg xl:px-fluid-xl py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Enhanced Filters Sidebar */}
          <aside className="lg:col-span-1 mb-6 lg:mb-0" role="complementary" aria-label="Filters">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <FunnelIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-3">
                    Search Campaigns
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by campaign name..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="h-4 w-4 text-gray-400">
                        🔍
                      </div>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-xs text-gray-500">
                      Filtering results for "{searchTerm}"
                    </div>
                  )}
                </div>

                {/* Additional filter options placeholder */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
                    Quick Filters
                  </div>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                      🟢 Successful campaigns
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                      🟡 Campaigns needing attention
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                      🔴 Underperforming campaigns
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3" role="main">
            <div
              id={`tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              className={isLoading ? 'opacity-50 pointer-events-none' : ''}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary" role="status" aria-label="Loading">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : activeTabData ? (
                <TabContent data={activeTabData} searchTerm={searchTerm} />
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
