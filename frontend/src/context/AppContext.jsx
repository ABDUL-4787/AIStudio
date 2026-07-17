import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AppProvider = ({ children }) => {
  const [activeDataset, setActiveDataset] = useState(null);
  const [activeModel, setActiveModel] = useState(null);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState({
    company_name: 'PredictIQ Enterprise User',
    default_report_title: 'Automated Machine Learning Summary',
    gemini_api_key: ''
  });

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings`);
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load application settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <AppContext.Provider
      value={{
        activeDataset,
        setActiveDataset,
        activeModel,
        setActiveModel,
        toast,
        showToast,
        hideToast,
        settings,
        setSettings,
        fetchSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
