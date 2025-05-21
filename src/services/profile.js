import api from "./baseAPI";

const profileAPI = {
    async getUserInfo(userId) {
        const response = await api.get(`/user/${userId}`);
        console.log("response", response);
        return response.data;
    },

    async updateUser(userId, params) {
        const response = await api.put(`/user/${userId}`, {
            username: params.username,
            phoneNumber: params.phoneNumber,
            address: params.address,
        });
        return response.data;
    },

    async updatePassword(params) {
        const response = await api.post(`/user/update-password`, {
            currentPassword: params.currentPassword,
            password: params.newPassword,
        });
        return response.data;
    },
};

export default profileAPI;
