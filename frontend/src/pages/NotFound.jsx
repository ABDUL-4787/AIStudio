import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md w-full shadow-xs flex flex-col items-center">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-full text-blue-600 mb-6">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
        <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-2">Page Not Found</h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to another section.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xs hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
