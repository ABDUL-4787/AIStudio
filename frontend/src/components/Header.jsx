import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Database, FileCode } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const { activeDataset } = useApp();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/upload':
        return 'Upload Dataset';
      case '/profiling':
        return 'Data Profiling';
      case '/cleaning':
        return 'Data Cleaning';
      case '/automl':
        return 'AutoML Engine';
      case '/visualizations':
        return 'Visualizations';
      case '/reports':
        return 'AI Insights & Reports';
      case '/history':
        return 'Analysis History';
      case '/settings':
        return 'Settings';
      default:
        return 'PredictIQ Studio';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800 tracking-tight">{getPageTitle()}</h1>
        
        {/* Active Dataset Indicator Badge */}
        {activeDataset && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700 animate-pulse">
            <FileCode className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px] font-semibold">{activeDataset.name}</span>
            <span className="opacity-75">
              ({activeDataset.row_count.toLocaleString()} rows, {activeDataset.col_count} cols)
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-medium">AutoML Platform v1.0.0</span>
      </div>
    </header>
  );
}
