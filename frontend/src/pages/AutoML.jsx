import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { automlService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
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
  BrainCircuit,
  Target,
  Trophy,
  Loader2,
  ListOrdered,
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart3,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AutoML() {
  const { activeDataset, setActiveModel, showToast } = useApp();
  const [columns, setColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState(null);

  const fetchColumns = async () => {
    if (!activeDataset) return;
    try {
      setColumnsLoading(true);
      const res = await automlService.getColumns(activeDataset.id);
      setColumns(res.data);
      if (res.data.length > 0) {
        setTargetColumn(res.data[res.data.length - 1]); // default to last column
      }
    } catch (err) {
      showToast('Failed to load columns', 'error');
    } finally {
      setColumnsLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
    setResults(null);
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
        <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Active Dataset</h3>
        <p className="text-slate-400 text-sm mt-2">
          Please upload or select a dataset first to train AutoML models.
        </p>
      </div>
    );
  }

  const handleTrain = async () => {
    if (!targetColumn) {
      showToast('Please select a target column to predict.', 'info');
      return;
    }

    try {
      setTraining(true);
      setResults(null);
      const res = await automlService.train(activeDataset.id, targetColumn);
      setResults(res.data);
      
      // Save active model in AppContext
      setActiveModel({
        id: res.data.training_id,
        name: res.data.best_model_name,
        target: targetColumn,
        task_type: res.data.task_type,
        metrics: res.data.metrics,
        leaderboard: res.data.leaderboard,
        feature_importance: res.data.feature_importance,
        visualization_data: res.data.visualization_data
      });
      showToast(`AutoML completed! Best model: ${res.data.best_model_name}`, 'success');
    } catch (err) {
      showToast('AutoML training failed. Check data distribution.', 'error');
    } finally {
      setTraining(false);
    }
  };

  // Convert feature importance dict to list for Recharts
  const getFeatureImportanceData = () => {
    if (!results || !results.feature_importance) return [];
    return Object.entries(results.feature_importance).map(([key, val]) => ({
      name: key,
      importance: parseFloat((val * 100).toFixed(2))
    })).sort((a, b) => b.importance - a.importance);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Target config panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-600 animate-pulse" />
              Configure AutoML Engine
            </h2>
            <p className="text-slate-400 text-xs">Specify the target variable. The system will auto-detect classification or regression.</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Predict Target:</label>
              {columnsLoading ? (
                <div className="h-9 w-40 bg-slate-50 border border-slate-100 rounded-xl animate-pulse"></div>
              ) : (
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer min-w-[160px]"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleTrain}
              disabled={training}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {training ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Training models...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Run AutoML
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay for training */}
      {training && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">AutoML Training in Progress</h3>
            <p className="text-slate-400 text-xs mt-1">Split-validating Random Forest, Gradient Boosting, XGBoost, and linear solvers...</p>
          </div>
        </div>
      )}

      {/* Results output */}
      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            
            {/* Top Best model spotlight */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs md:col-span-2 flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-full border border-blue-100 shadow-xs flex-shrink-0">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Best Model</span>
                  <h3 className="text-lg font-bold text-slate-800 truncate">{results.best_model_name}</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {results.task_type}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Validation Score</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {results.task_type === 'classification' 
                    ? `${(results.metrics.accuracy * 100).toFixed(1)}%` 
                    : `${(results.metrics.r2 * 100).toFixed(1)}%`}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {results.task_type === 'classification' ? 'Accuracy metric' : 'R² coefficient'}
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">CV Score</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {(results.metrics.cv_score * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">5-fold cross validation mean</span>
              </div>

            </div>

            {/* Split layout: Leaderboard vs Feature Importance */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Leaderboard */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-[420px] flex flex-col justify-between">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <ListOrdered className="h-5 w-5 text-blue-600" />
                      Model Leaderboard
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Ranking algorithms based on validation performance metrics.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 sticky top-0">
                        {results.task_type === 'classification' ? (
                          <tr>
                            <th className="p-3 pl-6">Model</th>
                            <th className="p-3">Accuracy</th>
                            <th className="p-3">F1 Score</th>
                            <th className="p-3">CV Score</th>
                            <th className="p-3 pr-6 text-right">Time</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="p-3 pl-6">Model</th>
                            <th className="p-3">R² Score</th>
                            <th className="p-3">MAE</th>
                            <th className="p-3">CV Score</th>
                            <th className="p-3 pr-6 text-right">Time</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        {results.leaderboard.map((item, idx) => (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-50/30 ${
                              idx === 0 ? 'bg-blue-50/20 font-bold text-blue-700' : ''
                            }`}
                          >
                            <td className="p-3 pl-6 truncate font-bold text-slate-800">{item.model_name}</td>
                            {results.task_type === 'classification' ? (
                              <>
                                <td className="p-3">{(item.accuracy * 100).toFixed(1)}%</td>
                                <td className="p-3">{(item.f1 * 100).toFixed(1)}%</td>
                                <td className="p-3">{(item.cv_score * 100).toFixed(1)}%</td>
                              </>
                            ) : (
                              <>
                                <td className="p-3">{(item.r2 * 100).toFixed(1)}%</td>
                                <td className="p-3">{item.mae.toFixed(4)}</td>
                                <td className="p-3">{(item.cv_score * 100).toFixed(1)}%</td>
                              </>
                            )}
                            <td className="p-3 pr-6 text-right text-slate-500">{item.training_time.toFixed(3)}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Feature Importance Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-[420px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Feature Importance
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Relative predictive contribution (%) per feature column.</p>
                  </div>

                  <div className="flex-1 mt-6 w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getFeatureImportanceData().slice(0, 7)} layout="vertical" barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={90} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 11 }}
                          formatter={(value) => [`${value}%`, 'Importance']}
                        />
                        <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
