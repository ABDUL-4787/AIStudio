import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { SkeletonCard } from '../components/LoadingSkeleton';
import {
  Database,
  Cpu,
  Trophy,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function Dashboard() {
  const { activeDataset, setActiveDataset, showToast } = useApp();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalDatasets: 0,
    modelsTrained: 0,
    bestAccuracy: 0,
    reportsGenerated: 0
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch datasets
      const datasetsRes = await api.get('/datasets/list');
      const datasets = datasetsRes.data;
      setRecentUploads(datasets.slice(0, 5));

      // Fetch history for training metrics
      const historyRes = await api.get('/history/list?page=1&size=10');
      const history = historyRes.data.items;
      setRecentReports(history.filter(h => h.report_id).slice(0, 5));

      // Calculate aggregates
      const trainedCount = history.length;
      let maxAcc = 0;
      history.forEach(item => {
        if (item.accuracy > maxAcc) maxAcc = item.accuracy;
      });

      setMetrics({
        totalDatasets: datasets.length,
        modelsTrained: trainedCount,
        bestAccuracy: maxAcc,
        reportsGenerated: history.filter(h => h.report_id).length
      });

      // Prepare chart data (accuracy over time or by model)
      const chartItems = history.map((item, idx) => ({
        name: `Run ${idx + 1}`,
        accuracy: (item.accuracy * 100).toFixed(1),
        model: item.best_model_name,
      })).reverse();
      setChartData(chartItems);

      // Default active dataset if none selected and one exists
      if (!activeDataset && datasets.length > 0) {
        setActiveDataset(datasets[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      // Fail silently, metrics will default to 0 for a new user/environment
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectDataset = (dataset) => {
    setActiveDataset(dataset);
    showToast(`Switched active dataset to: ${dataset.name}`, 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
          <div className="h-[350px] bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Define colors for Pie charts and bars
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back to PredictIQ Studio
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Build and optimize ML models for your business data.
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Upload Dataset
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Datasets</span>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Database className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{metrics.totalDatasets}</span>
            {metrics.totalDatasets > 0 && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">CSV & Excel files uploaded</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Models Trained</span>
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <Cpu className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{metrics.modelsTrained}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Regression & Classification runs</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Best Accuracy</span>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
              <Trophy className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {metrics.bestAccuracy > 0 ? `${(metrics.bestAccuracy * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Highest model validation score</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports Generated</span>
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{metrics.reportsGenerated}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">PDF business summaries compiled</span>
        </div>
      </div>

      {/* Main Charts / Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Performance Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">AutoML Model History</h3>
            <p className="text-xs text-slate-400 mt-1">Accuracy / R² Score across recent evaluation runs</p>
          </div>
          <div className="h-[250px] w-full mt-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                  />
                  <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
                <div>
                  <span className="text-slate-400 text-sm font-medium">No training runs executed yet.</span>
                  <Link to="/automl" className="text-blue-600 hover:underline text-xs font-semibold block mt-2">
                    Train your first model →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dataset Distribution Pie Chart / Summary */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Active Dataset Preview</h3>
            <p className="text-xs text-slate-400 mt-1">Status of dataset currently loaded in workspace</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {activeDataset ? (
              <div className="w-full text-center space-y-4">
                <div className="mx-auto bg-blue-50 border border-blue-100 p-4 rounded-full text-blue-600 w-16 h-16 flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 truncate px-4">{activeDataset.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Uploaded {new Date(activeDataset.created_at).toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Rows</span>
                    <span className="text-lg font-bold text-slate-800">{activeDataset.row_count.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Columns</span>
                    <span className="text-lg font-bold text-slate-800">{activeDataset.col_count}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="text-slate-400 text-sm font-medium">No dataset loaded.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-3 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Upload Dataset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Uploads & Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 tracking-tight">Recent Datasets</h3>
              <p className="text-xs text-slate-400 mt-1">Quickly select or manage your uploaded datasets</p>
            </div>
            <Link to="/upload" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentUploads.length > 0 ? (
              recentUploads.map((ds) => (
                <div
                  key={ds.id}
                  onClick={() => handleSelectDataset(ds)}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    activeDataset?.id === ds.id ? 'bg-blue-50/40 hover:bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeDataset?.id === ds.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FileSpreadsheet className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{ds.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{(ds.size_bytes / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{ds.row_count.toLocaleString()} rows</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No datasets uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 tracking-tight">Recent ML Reports</h3>
              <p className="text-xs text-slate-400 mt-1">Access and download recently generated business summaries</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              View history
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 truncate max-w-[220px]">
                        {report.dataset_name} Analysis
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Target: {report.target_column}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">
                      {(report.accuracy * 100).toFixed(1)}% {report.task_type === 'classification' ? 'Acc' : 'R²'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{report.best_model_name}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No reports compiled yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
