import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log("API BASE =", API_BASE);

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const predictDamage = async (imageFile, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await apiClient.post('/api/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;