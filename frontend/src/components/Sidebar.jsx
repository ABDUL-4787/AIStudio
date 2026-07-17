import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Wand2,
  BrainCircuit,
  LineChart,
  FileText,
  History,
  Settings,
  Database,
  Building
} from 'lucide-react';

export default function Sidebar() {
  const { activeDataset, settings } = useApp();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Dataset', icon: UploadCloud },
    { to: '/profiling', label: 'Data Profiling', icon: BarChart3, requiresDataset: true },
    { to: '/cleaning', label: 'Data Cleaning', icon: Wand2, requiresDataset: true },
    { to: '/automl', label: 'AutoML', icon: BrainCircuit, requiresDataset: true },
    { to: '/visualizations', label: 'Visualizations', icon: LineChart, requiresDataset: true },
    { to: '/reports', label: 'AI Insights & Reports', icon: FileText, requiresDataset: true },
    { to: '/history', label: 'Analysis History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <Database className="h-5 w-5" />
        </div>
        <span className="font-semibold text-slate-800 tracking-tight text-lg">PredictIQ Studio</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = item.requiresDataset && !activeDataset;

          if (isDisabled) {
            return (
              <div
                key={item.to}
                title="Please upload or select a dataset first"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 opacity-50 cursor-not-allowed text-sm font-medium"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Corporate Info Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center gap-2.5">
          <div className="bg-slate-200 p-1.5 rounded-lg text-slate-600 flex-shrink-0">
            <Building className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 truncate" title={settings?.company_name}>
              {settings?.company_name || 'PredictIQ Workspace'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Enterprise License</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
