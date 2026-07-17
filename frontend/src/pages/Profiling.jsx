import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { profilingService } from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  FileSpreadsheet,
  AlertTriangle,
  Grid,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  Loader2,
  PieChart
} from 'lucide-react';

export default function Profiling() {
  const { activeDataset, showToast } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const fetchProfile = async () => {
    if (!activeDataset) return;
    try {
      setLoading(true);
      const res = await profilingService.get(activeDataset.id);
      setProfile(res.data);
      // Auto select first column for distribution preview
      if (res.data.columns_info && res.data.columns_info.length > 0) {
        setSelectedColumn(res.data.columns_info[0].name);
      }
    } catch (err) {
      showToast('Failed to generate profiling details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
        <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">No Active Dataset</h3>
        <p className="text-slate-400 text-sm mt-2">
          Please upload a CSV or Excel dataset first to visualize data profiling.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <span className="text-sm font-semibold text-slate-700">Profiling dataset in real-time...</span>
        <span className="text-xs text-slate-400 mt-1">Calculating correlations, outliers, and distribution bins...</span>
      </div>
    );
  }

  if (!profile) return null;

  // Format memory
  const getFormattedMemory = (bytes) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  // Get color for correlation value
  const getCorrBgColor = (val) => {
    const absVal = Math.abs(val);
    if (val === 1) return 'bg-blue-100 font-bold';
    if (absVal > 0.7) return 'bg-blue-50/70 font-semibold';
    if (absVal > 0.4) return 'bg-slate-50';
    return '';
  };

  // Get distribution chart data
  const getDistributionChartData = () => {
    if (!selectedColumn || !profile.distributions) return [];
    return profile.distributions[selectedColumn] || [];
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Aggregates row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Metric Cards */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dataset Size</span>
            <span className="text-2xl font-bold text-slate-800 block">
              {profile.row_count.toLocaleString()} <span className="text-sm text-slate-400 font-medium">Rows</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">Dense spreadsheet shape</span>
          </div>

          <div className="space-y-2 border-l border-slate-100 pl-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total columns</span>
            <span className="text-2xl font-bold text-slate-800 block">{profile.col_count}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Features + target variable</span>
          </div>

          <div className="space-y-2 border-l border-slate-100 pl-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Duplicates</span>
            <span className="text-2xl font-bold text-slate-800 block">{profile.duplicate_rows}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Identical rows flagged</span>
          </div>

          <div className="space-y-2 border-l border-slate-100 pl-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Memory usage</span>
            <span className="text-2xl font-bold text-slate-800 block">{getFormattedMemory(profile.memory_usage_bytes)}</span>
            <span className="text-[10px] text-slate-400 block font-medium">RAM size occupied</span>
          </div>
        </div>

        {/* Data Quality Score Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Data Quality</span>
          
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Simple circular percentage visual */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeDasharray={`${profile.data_quality_score}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-xl font-black text-slate-800">
              {profile.data_quality_score}%
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-2 block">Imputation recommended</span>
        </div>

      </div>

      {/* Main body split: Columns summary and selected distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left: Columns summary table */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between h-[450px]">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Column Schema Info</h3>
              <p className="text-slate-400 text-xs mt-1">Review data types, missing records, and card count per column.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 font-bold text-slate-600">
                  <tr>
                    <th className="p-3 pl-6">Column Name</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Missing Rate</th>
                    <th className="p-3 pr-6 text-right">Unique Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {profile.columns_info.map((col) => (
                    <tr 
                      key={col.name}
                      onClick={() => setSelectedColumn(col.name)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedColumn === col.name ? 'bg-blue-50/40 font-bold text-blue-700' : ''
                      }`}
                    >
                      <td className="p-3 pl-6 truncate max-w-[150px]">{col.name}</td>
                      <td className="p-3">
                        <span className="uppercase text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          {col.data_type.replace('object', 'text')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          col.missing_percentage > 30 
                            ? 'bg-rose-50 text-rose-600' 
                            : col.missing_percentage > 0 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {col.missing_percentage}%
                        </span>
                      </td>
                      <td className="p-3 pr-6 text-right font-bold text-slate-700">{col.unique_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Selected Column Distribution */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 flex flex-col justify-between h-[450px]">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Feature Distribution</h3>
              <p className="text-slate-400 text-xs mt-1">
                Visualizing frequency distribution for <span className="font-bold text-blue-600">{selectedColumn || 'selected feature'}</span>.
              </p>
            </div>

            <div className="flex-1 mt-6 w-full h-[280px]">
              {selectedColumn ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDistributionChartData()} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 11 }}
                      labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center text-slate-400 text-xs">
                  Select a column from the table to preview distribution
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Outlier and Descriptive Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Outlier detection panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Outlier Summary</h3>
            <p className="text-slate-400 text-xs mt-1">Features containing values outside the Interquartile Range (IQR).</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-2">
            {Object.keys(profile.outlier_summary).length > 0 ? (
              Object.entries(profile.outlier_summary).map(([col, info]) => (
                <div key={col} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{col}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-semibold">{info.outlier_count.toLocaleString()} outliers</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      info.outlier_percentage > 5 
                        ? 'bg-rose-50 text-rose-600' 
                        : info.outlier_percentage > 0 
                        ? 'bg-amber-50 text-amber-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {info.outlier_percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No numeric columns found for outlier scan
              </div>
            )}
          </div>
        </div>

        {/* Descriptive Statistics Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col h-[320px]">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Descriptive Statistics</h3>
            <p className="text-slate-400 text-xs mt-1">Overview of mean, median, min, and max for numeric properties.</p>
          </div>
          <div className="flex-1 overflow-auto min-h-0 border border-slate-100 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 sticky top-0">
                <tr>
                  <th className="p-2.5 pl-4">Column</th>
                  <th className="p-2.5">Mean</th>
                  <th className="p-2.5">Median</th>
                  <th className="p-2.5">Min</th>
                  <th className="p-2.5 pr-4 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                {Object.entries(profile.descriptive_statistics).map(([col, stats]) => (
                  <tr key={col} className="hover:bg-slate-50/50">
                    <td className="p-2.5 pl-4 truncate max-w-[120px] font-bold text-slate-800">{col}</td>
                    {stats.type === 'numeric' ? (
                      <>
                        <td className="p-2.5">{stats.mean.toFixed(2)}</td>
                        <td className="p-2.5">{stats.median.toFixed(2)}</td>
                        <td className="p-2.5">{stats.min.toFixed(2)}</td>
                        <td className="p-2.5 pr-4 text-right">{stats.max.toFixed(2)}</td>
                      </>
                    ) : (
                      <td colSpan={4} className="p-2.5 text-slate-400 italic font-medium">
                        Categorical &bull; {stats.unique} categories, Top: "{stats.top}" ({stats.freq} times)
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Correlation Matrix Heatmap */}
      {profile.correlation_matrix && profile.correlation_matrix.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Correlation Heatmap</h3>
            <p className="text-slate-400 text-xs mt-1">Matrix representing linear correlation factor between numerical properties.</p>
          </div>
          <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-xs">
            <div className="p-4 min-w-[500px]">
              {/* Build grid representation of the correlation matrix */}
              <div className="grid divide-y divide-slate-100">
                {/* Headers */}
                <div className="flex bg-slate-50 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-600 uppercase text-center items-center">
                  <div className="w-[120px] text-left pl-3 text-slate-600">Feature</div>
                  {/* Distinct columns list */}
                  {Array.from(new Set(profile.correlation_matrix.map(e => e.x))).map(col => (
                    <div key={col} className="flex-1 truncate px-1" title={col}>{col}</div>
                  ))}
                </div>
                {/* Rows */}
                {Array.from(new Set(profile.correlation_matrix.map(e => e.y))).map(rowName => {
                  const rowEntries = profile.correlation_matrix.filter(e => e.y === rowName);
                  return (
                    <div key={rowName} className="flex text-xs text-slate-600 font-semibold items-center py-2 hover:bg-slate-50/20">
                      <div className="w-[120px] font-bold text-slate-800 text-left pl-3 truncate" title={rowName}>{rowName}</div>
                      {rowEntries.map(entry => (
                        <div 
                          key={entry.x} 
                          className={`flex-1 text-center py-1 rounded px-0.5 ${getCorrBgColor(entry.value)}`}
                          title={`Correlation coefficient: ${entry.value}`}
                        >
                          {entry.value.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
