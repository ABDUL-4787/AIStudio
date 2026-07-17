import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { settingsService } from '../services/api';
import {
  Settings as LucideSettings,
  Key,
  Building,
  FileText,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Database,
  Info,
  Sparkles
} from 'lucide-react';

export default function Settings() {
  const { settings, setSettings, fetchSettings, showToast } = useApp();
  
  const [apiKey, setApiKey] = useState(settings?.gemini_api_key || '');
  const [companyName, setCompanyName] = useState(settings?.company_name || 'PredictIQ Enterprise User');
  const [reportTitle, setReportTitle] = useState(settings?.default_report_title || 'Automated Machine Learning Summary');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state if settings changed asynchronously
  React.useEffect(() => {
    if (settings) {
      setApiKey(settings.gemini_api_key || '');
      setCompanyName(settings.company_name || 'PredictIQ Enterprise User');
      setReportTitle(settings.default_report_title || 'Automated Machine Learning Summary');
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        gemini_api_key: apiKey,
        company_name: companyName,
        default_report_title: reportTitle
      };
      
      const res = await settingsService.update(payload);
      setSettings(res.data);
      showToast('Settings saved successfully!', 'success');
      // Trigger sidebar reload of company name
      fetchSettings();
    } catch (err) {
      showToast('Failed to update application settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LucideSettings className="h-5 w-5 text-blue-600" />
            Workspace & Platform Settings
          </h2>
          <p className="text-slate-400 text-xs mt-1">Configure company profiles, report layouts, and AI API keys.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold text-slate-600">
          
          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="font-bold text-slate-500 uppercase tracking-wider block">Gemini API Key:</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <Key className="h-4 w-4" />
              </span>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIStudio / Gemini API key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-slate-700 focus:ring-1 focus:ring-blue-500 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Optional. If not set, the platform will automatically fallback to a rule-based statistical insights generator.
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="font-bold text-slate-500 uppercase tracking-wider block">Company / Organization Name:</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <Building className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Enterprise name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-700 focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          {/* Default Report Title */}
          <div className="space-y-2">
            <label className="font-bold text-slate-500 uppercase tracking-wider block">Default Report Title:</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <FileText className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Automated Machine Learning Summary"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-700 focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>

      {/* About PredictIQ Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            About PredictIQ Studio
          </h3>
          <p className="text-slate-400 text-xs mt-1">PredictIQ Studio is an enterprise-grade automated machine learning (AutoML) platform.</p>
        </div>
        
        <div className="text-xs text-slate-600 space-y-3 font-semibold">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Product Version</span>
              <span className="text-slate-800 font-bold block mt-0.5">v1.0.0 (Production Build)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Backend Services</span>
              <span className="text-slate-800 font-bold block mt-0.5">FastAPI & SQLAlchemy</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Machine Learning</span>
              <span className="text-slate-800 font-bold block mt-0.5">Scikit-learn & XGBoost</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Report Compilation</span>
              <span className="text-slate-800 font-bold block mt-0.5">ReportLab PDF Engine</span>
            </div>
          </div>
          <p className="leading-relaxed font-medium">
            Designed for data analysts and business intelligence developers. Automated preprocessing, imputations, standard scaling, outlier rejection, model training, and AI executive summaries compiled directly into downloadable presentation-ready files.
          </p>
        </div>
      </div>

    </div>
  );
}
