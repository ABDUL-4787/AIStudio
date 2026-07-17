import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from './Toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Page Container */}
        <main className="flex-grow p-8 max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Global Notifications */}
      <Toast />
    </div>
  );
}
