import api from "./baseAPI";

const adminApi = {

    async getUsersWithMonitoring() {
        const response = await api.get("/user");
        return response.data;
    }
}
export default adminApi;