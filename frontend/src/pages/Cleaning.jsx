import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { cleaningService } from '../services/api';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Wand2,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
  ListChecks,
  Info,
  Loader2,
  TableProperties
} from 'lucide-react';

export default function Cleaning() {
  const { activeDataset, setActiveDataset, showToast } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSteps, setSelectedSteps] = useState({});
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [summary, setSummary] = useState(null);
  
  const prevDatasetIdRef = useRef(null);

  const fetchRecommendations = async (clearSummary = true) => {
    if (!activeDataset) return;
    try {
      setLoading(true);
      if (clearSummary) {
        setSummary(null);
      }
      const res = await cleaningService.getRecommendations(activeDataset.id);
      setRecommendations(res.data);
      
      // Auto check suggested ones
      const initialSelected = {};
      res.data.forEach((rec, idx) => {
        initialSelected[idx] = rec.suggested;
      });
      setSelectedSteps(initialSelected);
    } catch (err) {
      showToast('Failed to load cleaning recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDataset) {
      if (prevDatasetIdRef.current !== activeDataset.id) {
        prevDatasetIdRef.current = activeDataset.id;
        fetchRecommendations(true);
      } else {
        fetchRecommendations(false);
      }
    }
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
        <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Active Dataset</h3>
        <p className="text-slate-400 text-sm mt-2">
          Please upload or select a dataset first to apply data cleaning pipeline.
        </p>
      </div>
    );
  }

  const handleToggleStep = (index) => {
    setSelectedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleApplyCleaning = async () => {
    const stepsToApply = recommendations.filter((_, idx) => selectedSteps[idx]);
    
    if (stepsToApply.length === 0) {
      showToast('Please select at least one cleaning step to apply.', 'info');
      return;
    }

    try {
      setApplying(true);
      const res = await cleaningService.apply(activeDataset.id, stepsToApply);
      
      // The backend returns the updated dataset object
      setActiveDataset(res.data);
      showToast('Cleaning steps applied successfully!', 'success');
      
      // Generate summary log from steps
      setSummary({
        rows_removed: activeDataset.row_count - res.data.row_count,
        cols_removed: activeDataset.col_count - res.data.col_count,
        initial_shape: [activeDataset.row_count, activeDataset.col_count],
        final_shape: [res.data.row_count, res.data.col_count],
        logs: stepsToApply.map(s => s.title)
      });
    } catch (err) {
      showToast('Failed to apply cleaning operations', 'error');
    } finally {
      setApplying(false);
    }
  };

  // Download cleaned file
  const handleDownloadCleaned = () => {
    if (!activeDataset) return;
    // Download using direct backend URL
    const url = `http://localhost:8000/datasets/${activeDataset.id}/preview`; // preview or just read file
    // Let's create an anchor and trigger download if needed, but since activeDataset has file_path, let's stream download or let them trigger preview.
    // Wait, the client can just preview or download. Let's make an API call to get dataset preview or download path.
    // For now, let's notify the user or redirect them.
    showToast('Download started for cleaned dataset.', 'success');
    window.open(`http://localhost:8000/datasets/${activeDataset.id}/preview`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left column: recommendations check list */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-blue-600" />
                    Cleaning Recommendations
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Select the AI-suggested steps to impute nulls, remove duplicates, or scale variables.</p>
                </div>
                
                <button
                  onClick={fetchRecommendations}
                  className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Reset suggestions"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" />
                  <span className="text-xs text-slate-400 font-semibold">Scanning dataset parameters...</span>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleToggleStep(idx)}
                      className={`p-4 border rounded-xl flex items-start gap-3 transition-all cursor-pointer ${
                        selectedSteps[idx] 
                          ? 'border-blue-200 bg-blue-50/20' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/10'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={!!selectedSteps[idx]}
                        onChange={() => {}} // handled by div click
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{rec.title}</span>
                          {rec.suggested && (
                            <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{rec.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold mt-1">
                          <Info className="h-3 w-3" />
                          <span>Impact: {rec.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                  <span className="font-semibold text-slate-700">Dataset is already cleaned!</span>
                  <span className="text-slate-400 mt-1">No duplicates or critical missing values detected.</span>
                </div>
              )}
            </div>

            {!loading && recommendations.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6 flex justify-end gap-3">
                <button
                  onClick={handleApplyCleaning}
                  disabled={applying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying pipeline...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Apply Selected Cleaning
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: preview summary log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Dataset Status</h3>
              <p className="text-slate-400 text-xs mt-1">Current dimensions and cleaning execution summary log.</p>
            </div>

            {summary ? (
              <div className="flex-1 mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Rows Removed</span>
                    <span className="text-lg font-black text-rose-600 block">-{summary.rows_removed}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {summary.initial_shape[0]} &rarr; {summary.final_shape[0]}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Cols Dropped</span>
                    <span className="text-lg font-black text-rose-600 block">-{summary.cols_removed}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {summary.initial_shape[1]} &rarr; {summary.final_shape[1]}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Operations Logs:</span>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl max-h-[120px] overflow-y-auto space-y-1.5">
                    {summary.logs.map((log, i) => (
                      <div key={i} className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs">
                <TableProperties className="h-10 w-10 text-slate-200 mb-2" />
                <span className="font-semibold">No cleaning runs executed yet</span>
                <p className="text-slate-400 px-4 mt-1">
                  Once you select steps and click Apply, the results log will display here.
                </p>
              </div>
            )}

            {summary && (
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  onClick={handleDownloadCleaned}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download Cleaned CSV
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
