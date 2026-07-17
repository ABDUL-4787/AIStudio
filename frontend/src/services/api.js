import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const datasetService = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  list: () => api.get('/datasets/list'),
  get: (id) => api.get(`/datasets/${id}`),
  delete: (id) => api.delete(`/datasets/${id}`),
  preview: (id) => api.get(`/datasets/${id}/preview`),
};

export const profilingService = {
  get: (datasetId) => api.get(`/profiling/${datasetId}`),
};

export const cleaningService = {
  getRecommendations: (datasetId) => api.get(`/cleaning/${datasetId}/recommendations`),
  apply: (datasetId, steps) => api.post(`/cleaning/${datasetId}/apply`, steps),
};

export const automlService = {
  getColumns: (datasetId) => api.get(`/automl/${datasetId}/columns`),
  train: (datasetId, targetColumn) => api.post(`/automl/${datasetId}/train`, { target_column: targetColumn }),
};

export const visualizationService = {
  getDistribution: (datasetId) => api.get(`/visualizations/${datasetId}/distribution`),
  getCorrelation: (datasetId) => api.get(`/visualizations/${datasetId}/correlation`),
  getMissing: (datasetId) => api.get(`/visualizations/${datasetId}/missing`),
  getModelResults: (modelId) => api.get(`/visualizations/model/${modelId}/results`),
};

export const insightsService = {
  generate: (datasetId, modelId) => api.post('/insights/generate', { dataset_id: datasetId, model_id: modelId }),
};

export const reportsService = {
  build: (datasetId, modelId, insightsInfo, leaderboard = []) => 
    api.post('/reports/build', { dataset_id: datasetId, model_id: modelId, insights_info: insightsInfo, leaderboard }),
  list: () => api.get('/reports/list'),
  downloadUrl: (reportId) => `${API_URL}/reports/${reportId}/download`,
};

export const historyService = {
  list: (page = 1, size = 20) => api.get(`/history/list?page=${page}&size=${size}`),
  delete: (id) => api.delete(`/history/${id}`),
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
};

export default api;
