import api from "./baseAPI";

const monitoringApi = {
  async getAllMonitoring(page, limit) {
    const response = await api.get(`/monitoring?page=${page}&limit=${limit}`);
    return response.data;
  },

  async addMonitoring(data) {
    const response = await api.post("/monitoring", data);
    return response.data;
  },

  async updateMonitoring(data) {
    const response = await api.put("/monitoring", data);
    return response.data;
  },

  async removeMonitoring(deviceId) {
    const response = await api.delete(`/monitoring/${deviceId}`);
    return response.data;
  }
};

export default monitoringApi;