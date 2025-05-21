import api from "./baseAPI";

const lineApi = {
    async editLine(body) {
        const response = await api.post("/line/edit", body);
        return response.data;
    },

    async disconnectLine(body) {
        const response = await api.post("/line/disconnect", body);
        return response.data;
    },

    
}

export default lineApi;