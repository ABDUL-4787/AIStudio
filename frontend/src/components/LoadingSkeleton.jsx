import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 bg-slate-200 rounded-full w-8"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1"></div>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-slate-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs animate-pulse flex flex-col justify-between h-[300px]">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="flex-1 flex items-end gap-3 px-4">
        <div className="bg-slate-100 w-full h-[60%] rounded-t-lg"></div>
        <div className="bg-slate-100 w-full h-[85%] rounded-t-lg"></div>
        <div className="bg-slate-100 w-full h-[40%] rounded-t-lg"></div>
        <div className="bg-slate-100 w-full h-[95%] rounded-t-lg"></div>
        <div className="bg-slate-100 w-full h-[70%] rounded-t-lg"></div>
      </div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mt-4 mx-auto"></div>
    </div>
  );
}
