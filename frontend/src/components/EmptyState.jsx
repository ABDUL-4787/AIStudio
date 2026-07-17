import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, UploadCloud } from 'lucide-react';

export default function EmptyState({
  title = 'No dataset loaded',
  description = 'You need to upload and select a CSV or Excel dataset to unlock this section.',
  actionText = 'Upload Dataset',
  actionPath = '/upload',
  icon: Icon = FileQuestion
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 shadow-xs flex flex-col items-center">
      <div className="bg-blue-50 border border-blue-100/50 p-4 rounded-full text-blue-600 mb-5 animate-pulse">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionText && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <UploadCloud className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
