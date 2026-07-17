import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Profiling from './pages/Profiling';
import Cleaning from './pages/Cleaning';
import AutoML from './pages/AutoML';
import Visualizations from './pages/Visualizations';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/upload"
        element={
          <Layout>
            <Upload />
          </Layout>
        }
      />
      <Route
        path="/profiling"
        element={
          <Layout>
            <Profiling />
          </Layout>
        }
      />
      <Route
        path="/cleaning"
        element={
          <Layout>
            <Cleaning />
          </Layout>
        }
      />
      <Route
        path="/automl"
        element={
          <Layout>
            <AutoML />
          </Layout>
        }
      />
      <Route
        path="/visualizations"
        element={
          <Layout>
            <Visualizations />
          </Layout>
        }
      />
      <Route
        path="/reports"
        element={
          <Layout>
            <Reports />
          </Layout>
        }
      />
      <Route
        path="/history"
        element={
          <Layout>
            <History />
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout>
            <Settings />
          </Layout>
        }
      />
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
