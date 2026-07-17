import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { datasetService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowRight,
  Loader2,
  FileCheck
} from 'lucide-react';

export default function Upload() {
  const { activeDataset, setActiveDataset, showToast } = useApp();
  const [datasets, setDatasets] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await datasetService.list();
      setDatasets(res.data);
      if (res.data.length > 0 && !activeDataset) {
        // Auto-select latest
        setActiveDataset(res.data[0]);
      }
    } catch (err) {
      showToast('Failed to load datasets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // Fetch preview when active dataset changes
  useEffect(() => {
    if (activeDataset) {
      loadPreview(activeDataset.id);
    } else {
      setPreviewData(null);
    }
  }, [activeDataset]);

  const loadPreview = async (id) => {
    try {
      setPreviewLoading(true);
      const res = await datasetService.preview(id);
      setPreviewData(res.data);
    } catch (err) {
      showToast('Failed to load preview', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      showToast('Please upload a valid CSV or Excel file.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await datasetService.upload(file, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });
      showToast(`Dataset "${file.name}" uploaded successfully!`, 'success');
      setActiveDataset(res.data);
      fetchDatasets();
    } catch (err) {
      const msg = err.response?.data?.detail || 'File upload failed.';
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this dataset? This will also remove any trained models associated with it.')) {
      return;
    }
    try {
      await datasetService.delete(id);
      showToast('Dataset deleted', 'success');
      if (activeDataset?.id === id) {
        setActiveDataset(null);
      }
      fetchDatasets();
    } catch (err) {
      showToast('Failed to delete dataset', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Upload area & Datasets list split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left pane: Upload Dropzone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Upload Dataset</h2>
              <p className="text-slate-400 text-xs mt-1">Upload CSV or Excel files to profile and train AutoML models.</p>
            </div>

            {/* Dropzone */}
            <form 
              onDragEnter={handleDrag} 
              onDragOver={handleDrag} 
              onDragLeave={handleDrag} 
              onDrop={handleDrop}
              className={`flex-1 mt-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/20' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input 
                id="file-input" 
                type="file" 
                className="hidden" 
                accept=".csv, .xlsx, .xls"
                onChange={handleChange}
              />
              
              {isUploading ? (
                <div className="w-full space-y-4 px-4">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Uploading dataset...</span>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{uploadProgress}% uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto bg-blue-50 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center border border-blue-100/50 shadow-xs">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Drag & drop files here</span>
                    <span className="text-xs text-slate-400 block mt-1">or click to browse your files</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">Supports CSV, XLS, XLSX up to 50MB</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right pane: Uploaded Datasets Table */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-[360px] flex flex-col justify-between">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Available Datasets</h2>
              <p className="text-slate-400 text-xs mt-1">Select a dataset to load it as active in the workspace.</p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
              {loading ? (
                <div className="h-full flex items-center justify-center py-12">
                  <Loader2 className="h-7 w-7 text-slate-400 animate-spin" />
                </div>
              ) : datasets.length > 0 ? (
                datasets.map((ds) => (
                  <div
                    key={ds.id}
                    onClick={() => setActiveDataset(ds)}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeDataset?.id === ds.id ? 'bg-blue-50/40 border-l-4 border-blue-600' : 'pl-[18px]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeDataset?.id === ds.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <FileSpreadsheet className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={ds.name}>{ds.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Uploaded {new Date(ds.created_at).toLocaleDateString()} &bull; {(ds.size_bytes / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800 block">{ds.row_count.toLocaleString()} rows</span>
                        <span className="text-[10px] text-slate-500 font-medium">{ds.col_count} columns</span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, ds.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                        title="Delete dataset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <Database className="h-8 w-8 text-slate-300 mb-2" />
                  <span className="text-sm font-semibold text-slate-400">No datasets uploaded yet</span>
                  <span className="text-xs text-slate-400 mt-0.5">Upload a CSV or Excel to get started</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Dataset Preview Section */}
      <AnimatePresence mode="wait">
        {activeDataset && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  Workspace Preview: {activeDataset.name}
                </h3>
                <p className="text-slate-400 text-xs mt-1">Showing first 50 rows of data types and columns.</p>
              </div>
            </div>

            <div className="p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" />
                  <span className="text-xs text-slate-400">Loading dataset sample...</span>
                </div>
              ) : previewData ? (
                <div className="space-y-6">
                  {/* Column Metadata Banners */}
                  <div className="flex flex-wrap gap-2.5">
                    {previewData.columns.map((col) => (
                      <div key={col} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{col}</span>
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100/50 px-1.5 py-0.5 rounded-md uppercase">
                          {previewData.dtypes[col]?.replace('object', 'text') || 'unknown'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Scrollable table preview */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                          <tr>
                            {previewData.columns.map((col) => (
                              <th key={col} className="p-3 font-bold text-slate-600 uppercase tracking-wider min-w-[120px]">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              {previewData.columns.map((col) => (
                                <td key={col} className="p-3 text-slate-600 font-medium truncate max-w-[200px]">
                                  {row[col] === null || row[col] === undefined ? (
                                    <span className="text-slate-400 italic">null</span>
                                  ) : (
                                    String(row[col])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Failed to render dataset preview
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
