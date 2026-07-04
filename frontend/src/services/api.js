import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://product-damage-detection-1.onrender.com";

console.log("API URL:", API_BASE);

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  console.log("Sending Request:", config.baseURL + config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error(error.message);
    }

    return Promise.reject(error);
  }
);

export const predictDamage = async (imageFile, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await apiClient.post("/api/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};

export default apiClient;