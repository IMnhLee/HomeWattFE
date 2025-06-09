import api from "./baseAPI";

const adminApi = {

    async getUsersWithMonitoring() {
        const response = await api.get("/user");
        return response.data;
    },

    async manageUserActive(userId, active) {
        const response = await api.put(`/user/manage-active/${userId}`, { active });
        return response.data;
    },

    async deleteUser(userId) {
        const response = await api.delete(`/user/${userId}`);
        return response.data;
    }
}
export default adminApi;