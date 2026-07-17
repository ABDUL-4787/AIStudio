import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { visualizationService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  FileSpreadsheet,
  LineChart as LucideLineChart,
  BarChart3,
  Grid,
  AlertTriangle,
  Cpu,
  Loader2,
  PieChart
} from 'lucide-react';

export default function Visualizations() {
  const { activeDataset, activeModel, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('distribution');
  const [distributionData, setDistributionData] = useState({});
  const [selectedCol, setSelectedCol] = useState('');
  const [missingData, setMissingData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [modelResults, setModelResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDatasetCharts = async () => {
    if (!activeDataset) return;
    try {
      setLoading(true);
      // Fetch distribution
      const distRes = await visualizationService.getDistribution(activeDataset.id);
      setDistributionData(distRes.data);
      const columns = Object.keys(distRes.data);
      if (columns.length > 0) {
        setSelectedCol(columns[0]);
      }

      // Fetch missing values
      const missingRes = await visualizationService.getMissing(activeDataset.id);
      setMissingData(missingRes.data);

      // Fetch correlation
      const corrRes = await visualizationService.getCorrelation(activeDataset.id);
      setCorrelationData(corrRes.data);
    } catch (err) {
      showToast('Failed to load dataset visualizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadModelCharts = async () => {
    if (!activeModel) return;
    try {
      setLoading(true);
      const res = await visualizationService.getModelResults(activeModel.id);
      setModelResults(res.data);
    } catch (err) {
      showToast('Failed to load model results charts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasetCharts();
  }, [activeDataset]);

  useEffect(() => {
    if (activeModel) {
      loadModelCharts();
    } else {
      setModelResults(null);
    }
  }, [activeModel]);

  if (!activeDataset) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
        <LucideLineChart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Active Dataset</h3>
        <p className="text-slate-400 text-sm mt-2">
          Please upload or select a dataset first to generate interactive visualizations.
        </p>
      </div>
    );
  }

  const getCorrBgColor = (val) => {
    const absVal = Math.abs(val);
    if (val === 1) return 'bg-blue-100 font-bold';
    if (absVal > 0.7) return 'bg-blue-50/70 font-semibold';
    if (absVal > 0.4) return 'bg-slate-50';
    return '';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl shadow-xs gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveTab('distribution')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'distribution' 
              ? 'bg-blue-50 text-blue-600 shadow-xs border border-blue-100/50' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          Distributions
        </button>
        <button
          onClick={() => setActiveTab('missing')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'missing' 
              ? 'bg-blue-50 text-blue-600 shadow-xs border border-blue-100/50' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          Missing Values
        </button>
        <button
          onClick={() => setActiveTab('correlation')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'correlation' 
              ? 'bg-blue-50 text-blue-600 shadow-xs border border-blue-100/50' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          Correlation Heatmap
        </button>
        <button
          disabled={!activeModel}
          onClick={() => setActiveTab('model')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'model' 
              ? 'bg-blue-50 text-blue-600 shadow-xs border border-blue-100/50' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title={!activeModel ? "Train a model first to unlock performance charts" : ""}
        >
          Model Performance
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <span className="text-xs text-slate-400 font-semibold">Generating interactive charts...</span>
        </div>
      ) : (
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* 1. Distributions Tab */}
            {activeTab === 'distribution' && (
              <motion.div
                key="distribution"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
              >
                {/* Left side column selector list */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-h-[450px] overflow-y-auto">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Select Column</h3>
                  <div className="space-y-1">
                    {Object.keys(distributionData).map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedCol(col)}
                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                          selectedCol === col 
                            ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100/30' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side chart */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[450px]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Frequency Distribution</h3>
                    <p className="text-slate-400 text-xs mt-1">Representing bin ranges or occurrences count for {selectedCol}.</p>
                  </div>
                  <div className="flex-1 mt-6 w-full h-[300px]">
                    {selectedCol && distributionData[selectedCol] ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionData[selectedCol]} barSize={28}>
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
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs">No distribution data</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Missing Values Tab */}
            {activeTab === 'missing' && (
              <motion.div
                key="missing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[450px] flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Missing Values per Column</h3>
                  <p className="text-slate-400 text-xs mt-1">Review sparse columns and percentage of missing values.</p>
                </div>
                <div className="flex-1 mt-6 w-full h-[320px]">
                  {missingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={missingData} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="column" stroke="#94A3B8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 11 }}
                          formatter={(value, name, props) => [`${value} (${props.payload.missing_percentage}%)`, 'Missing Count']}
                        />
                        <Bar dataKey="missing_count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">No missing records</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. Correlation Heatmap */}
            {activeTab === 'correlation' && (
              <motion.div
                key="correlation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Features Correlation Matrix</h3>
                  <p className="text-slate-400 text-xs mt-1">Calculates Pearson correlation factors (range from -1 to 1).</p>
                </div>
                
                {correlationData.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <div className="p-4 min-w-[500px]">
                      <div className="grid divide-y divide-slate-100">
                        <div className="flex bg-slate-50 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-600 uppercase text-center items-center">
                          <div className="w-[120px] text-left pl-3 text-slate-600 font-bold">Feature</div>
                          {Array.from(new Set(correlationData.map(e => e.x))).map(col => (
                            <div key={col} className="flex-1 truncate px-1" title={col}>{col}</div>
                          ))}
                        </div>
                        {Array.from(new Set(correlationData.map(e => e.y))).map(rowName => {
                          const rowEntries = correlationData.filter(e => e.y === rowName);
                          return (
                            <div key={rowName} className="flex text-xs text-slate-600 font-semibold items-center py-2 hover:bg-slate-50/20">
                              <div className="w-[120px] font-bold text-slate-800 text-left pl-3 truncate" title={rowName}>{rowName}</div>
                              {rowEntries.map(entry => (
                                <div 
                                  key={entry.x} 
                                  className={`flex-1 text-center py-1 rounded px-0.5 ${getCorrBgColor(entry.value)}`}
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
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs">No numeric features to correlate.</div>
                )}
              </motion.div>
            )}

            {/* 4. Model Performance Tab */}
            {activeTab === 'model' && modelResults && (
              <motion.div
                key="model"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Feature Importance */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[400px] flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Feature Importance List</h3>
                      <p className="text-slate-400 text-xs mt-1">Relative predictive contribution for {modelResults.best_model_name}.</p>
                    </div>
                    <div className="flex-1 mt-6 w-full h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelResults.feature_importance.slice(0, 10)} layout="vertical" barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                          <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={90} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 11 }}
                            formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Contribution']}
                          />
                          <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Dynamic model specific visualization */}
                  {modelResults.task_type === 'classification' ? (
                    /* Confusion Matrix */
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[400px] flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Confusion Matrix</h3>
                        <p className="text-slate-400 text-xs mt-1">Review true positives, false positives, and classifications.</p>
                      </div>
                      <div className="flex-1 mt-6 flex flex-col items-center justify-center">
                        {modelResults.visualization_data.confusion_matrix ? (
                          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs max-w-sm w-full">
                            <div className="bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">Predicted Class</div>
                            <div className="grid grid-cols-2 divide-x divide-slate-100 text-center font-bold">
                              {modelResults.visualization_data.confusion_matrix.map((cell, idx) => (
                                <div key={idx} className="p-6 bg-slate-50/20 hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Act: {cell.actual} &bull; Pred: {cell.predicted}</span>
                                  <span className="text-2xl font-black text-slate-800 mt-1 block">{cell.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs">No confusion matrix data</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Regression actual vs predicted plot */
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[400px] flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Actual vs Predicted</h3>
                        <p className="text-slate-400 text-xs mt-1">Scatter plot mapping predicted targets against ground truth.</p>
                      </div>
                      <div className="flex-1 mt-6 w-full h-[260px]">
                        {modelResults.visualization_data.predictions ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis type="number" dataKey="actual" name="Actual" stroke="#94A3B8" fontSize={9} label={{ value: 'Actual', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748B' }} />
                              <YAxis type="number" dataKey="predicted" name="Predicted" stroke="#94A3B8" fontSize={9} label={{ value: 'Predicted', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748B' }} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter name="Data Points" data={modelResults.visualization_data.predictions} fill="#3B82F6" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 text-xs">No predictions data</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional detailed plots */}
                <div className="grid grid-cols-1 gap-8">
                  {modelResults.task_type === 'classification' && modelResults.visualization_data.roc_curve ? (
                    /* ROC Curve */
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[400px] flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">ROC Curve (Receiver Operating Characteristic)</h3>
                        <p className="text-slate-400 text-xs mt-1">True Positive Rate vs False Positive Rate for binary solver.</p>
                      </div>
                      <div className="flex-1 mt-6 w-full h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={modelResults.visualization_data.roc_curve}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#94A3B8" fontSize={9} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                            <YAxis type="number" domain={[0, 1]} stroke="#94A3B8" fontSize={9} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="tpr" stroke="#10B981" strokeWidth={2} dot={false} />
                            {/* Diagonal reference line */}
                            <Line type="monotone" dataKey="fpr" stroke="#E2E8F0" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : modelResults.task_type === 'regression' && modelResults.visualization_data.residuals ? (
                    /* Residuals plot */
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[400px] flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Residual Plot</h3>
                        <p className="text-slate-400 text-xs mt-1">Plots residual errors (actual - prediction) against prediction value.</p>
                      </div>
                      <div className="flex-1 mt-6 w-full h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis type="number" dataKey="predicted" name="Predicted" stroke="#94A3B8" fontSize={9} label={{ value: 'Predicted Value', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                            <YAxis type="number" dataKey="residual" name="Residual" stroke="#94A3B8" fontSize={9} label={{ value: 'Residual Error', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10 }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Error Points" data={modelResults.visualization_data.residuals} fill="#F59E0B" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
