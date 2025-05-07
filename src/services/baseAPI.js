import axios from "axios";

const API_URL = `localhost:3000/api`;
// const API_URL = `http://localhost:8888/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "accept ": "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const parsedToken = JSON.parse(token);
      config.headers["Authorization"] = `Bearer ${parsedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
