import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { insightsService, reportsService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Download,
  AlertTriangle,
  Cpu,
  Brain,
  Building,
  CheckCircle,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

export default function Reports() {
  const { activeDataset, activeModel, settings, showToast } = useApp();
  const [insights, setInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [compilingReport, setCompilingReport] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState(null);

  // Settings defaults
  const [companyName, setCompanyName] = useState(settings?.company_name || 'PredictIQ Enterprise User');
  const [reportTitle, setReportTitle] = useState(settings?.default_report_title || 'Automated Machine Learning Summary');

  if (!activeDataset || !activeModel) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Model Required</h3>
        <p className="text-slate-400 text-sm mt-2">
          Please upload a dataset and train an AutoML model before generating AI Insights or compiling reports.
        </p>
      </div>
    );
  }

  const handleGenerateInsights = async () => {
    try {
      setGeneratingInsights(true);
      setGeneratedReportId(null);
      const res = await insightsService.generate(activeDataset.id, activeModel.id);
      setInsights(res.data);
      showToast('AI insights generated successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate business insights', 'error');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const handleCompileReport = async () => {
    if (!insights) {
      showToast('Please generate AI Insights first before compiling the PDF report.', 'info');
      return;
    }

    try {
      setCompilingReport(true);
      setGeneratedReportId(null);
      
      // Pass the leaderboard list to reportsService to show it in the PDF
      const leaderboard = activeModel.leaderboard || [];
      
      const res = await reportsService.build(
        activeDataset.id,
        activeModel.id,
        insights,
        leaderboard
      );
      
      setGeneratedReportId(res.data.report_id);
      showToast('PDF report compiled successfully!', 'success');
    } catch (err) {
      showToast('Failed to compile PDF report', 'error');
    } finally {
      setCompilingReport(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedReportId) return;
    const downloadUrl = reportsService.downloadUrl(generatedReportId);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `PredictIQ_Report_${generatedReportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Overview Status Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Workspace Model Details</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Active: <span className="font-bold text-slate-700">{activeModel.name}</span> &bull; Target: <span className="font-bold text-slate-700">{activeModel.target}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {settings?.gemini_api_key ? (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Gemini LLM Connected
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1" title="App falls back to static rules">
              <AlertTriangle className="h-3 w-3" />
              Rule-based Fallback Active
            </span>
          )}
        </div>
      </div>

      {/* Main Dual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left: AI Insights Dashboard */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Business Insights
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Generate deep executive recommendations and SWOT profiles.</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {generatingInsights ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                    <span className="text-xs text-slate-400 font-semibold">Running LLM business analysis...</span>
                  </div>
                ) : insights ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 mt-4 text-xs max-h-[350px] overflow-y-auto pr-2"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Executive Summary</span>
                      <p className="text-slate-600 leading-relaxed font-semibold">{insights.executive_summary}</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-50 pt-3">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Data Quality Review</span>
                      <p className="text-slate-600 leading-relaxed font-medium">{insights.data_quality_review}</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-50 pt-3">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Business Drivers (Feature Importance)</span>
                      <p className="text-slate-600 leading-relaxed font-medium">{insights.feature_importance_summary}</p>
                    </div>

                    <div className="space-y-2 border-t border-slate-50 pt-3">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Recommendations</span>
                      <div className="space-y-1">
                        {insights.business_recommendations.map((rec, i) => (
                          <div key={i} className="text-slate-600 font-medium flex items-start gap-1.5 leading-relaxed">
                            <span className="text-blue-600 mt-0.5">&bull;</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                    <Sparkles className="h-8 w-8 text-blue-300 mb-2" />
                    <span className="font-semibold text-slate-700">No Insights Generated</span>
                    <p className="text-slate-400 px-8 mt-1">Click the button below to analyze features and output recommendations.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {!generatingInsights && (
              <div className="mt-8 border-t border-slate-100 pt-4 flex justify-end">
                <button
                  onClick={handleGenerateInsights}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Insights
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: PDF Compiler Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[460px] flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  PDF Report Builder
                </h3>
                <p className="text-slate-400 text-xs mt-1">Configure cover details and compile report.</p>
              </div>

              {/* Form details */}
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Company Name:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Building className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-700 focus:ring-1 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Report Title:</label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8 border-t border-slate-100 pt-6">
              {compilingReport ? (
                <div className="flex items-center gap-2 justify-center py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs text-slate-500 font-semibold">Compiling PDF graphics layout...</span>
                </div>
              ) : generatedReportId ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span>Report compiled! Click download below to save the PDF.</span>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCompileReport}
                  disabled={!insights}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  title={!insights ? "Generate AI Insights first to compile PDF" : ""}
                >
                  <FileText className="h-4 w-4" />
                  Compile PDF Report
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
