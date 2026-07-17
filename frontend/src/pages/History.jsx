import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { historyService, reportsService, datasetService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History as LucideHistory,
  Search,
  Download,
  Trash2,
  Play,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Database
} from 'lucide-react';

export default function History() {
  const { activeDataset, setActiveDataset, setActiveModel, showToast } = useApp();
  const [historyItems, setHistoryItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await historyService.list(page, 10);
      setHistoryItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      showToast('Failed to load history runs list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this training run? This will remove associated reports.')) {
      return;
    }
    try {
      await historyService.delete(id);
      showToast('Training run deleted successfully', 'success');
      fetchHistory();
    } catch (err) {
      showToast('Failed to delete training run', 'error');
    }
  };

  const handleDownloadPDF = (reportId) => {
    if (!reportId) return;
    const url = reportsService.downloadUrl(reportId);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PredictIQ_Report_${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadWorkspace = async (item) => {
    try {
      showToast(`Loading analysis run into workspace...`, 'info');
      // Set the active dataset
      const datasetsRes = await datasetService.list();
      const matchDataset = datasetsRes.data.find(d => d.name === item.dataset_name);
      
      if (matchDataset) {
        setActiveDataset(matchDataset);
      } else {
        showToast('Original dataset file could not be located in workspace.', 'warning');
      }

      // Reconstruct the active model run
      // Since it's saved in the database, let's load it
      setActiveModel({
        id: item.id,
        name: item.best_model_name,
        target: item.target_column,
        task_type: item.task_type,
        leaderboard: [],
        metrics: {}
      });
      showToast(`Active workspace loaded with run details!`, 'success');
    } catch (err) {
      showToast('Failed to reconstruct workspace details', 'error');
    }
  };

  // Filter items based on client-side search query
  const filteredItems = historyItems.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.dataset_name.toLowerCase().includes(term) ||
      item.best_model_name.toLowerCase().includes(term) ||
      item.target_column.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header filter options */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LucideHistory className="h-5 w-5 text-blue-600" />
            AutoML Training History
          </h2>
          <p className="text-slate-400 text-xs mt-1">Review previously executed model training runs and download generated PDFs.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by dataset or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500 w-[240px]"
          />
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
              <span className="text-xs text-slate-400 font-semibold">Retrieving history runs...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Dataset Name</th>
                  <th className="p-4">Target Column</th>
                  <th className="p-4">Task Type</th>
                  <th className="p-4">Best Model</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Run Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <span className="truncate max-w-[150px] font-bold text-slate-800" title={item.dataset_name}>
                          {item.dataset_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 truncate max-w-[120px]" title={item.target_column}>{item.target_column}</td>
                    <td className="p-4 uppercase font-bold text-[9px]">
                      <span className={`px-2 py-0.5 rounded-md ${
                        item.task_type === 'classification' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.task_type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800">{item.best_model_name}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {(item.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="p-4 text-slate-400 font-medium">
                      {new Date(item.trained_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleLoadWorkspace(item)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        title="Load into workspace"
                      >
                        <Play className="h-3.5 w-3.5 fill-blue-600" />
                        Load
                      </button>

                      {item.report_id && (
                        <button
                          onClick={() => handleDownloadPDF(item.report_id)}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-600 p-1.5 rounded-lg cursor-pointer"
                          title="Download PDF report"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-all"
                        title="Delete run"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <LucideHistory className="h-8 w-8 text-slate-200 mb-2" />
              <span className="font-semibold text-slate-700">No History Items Found</span>
              <p className="text-slate-400 px-8 mt-1">Configure an AutoML training session to populate history list runs.</p>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Showing page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
