import api from "./baseAPI";

const floorApi = {
    async getAllFloor() {
        const response = await api.get("/floor");
        return response.data;
    },

    async addFloor(name) {
        const response = await api.post("/floor", name);
        return response.data;
    },

    async updateFloor(floorId, name) {
        const data = {
            floorId,
            name
        }
        const response = await api.put("/floor", data);
        return response.data;
    },

    async deleteFloor(floorId) {
        const response = await api.delete(`/floor/${floorId}`);
        return response.data;
    },

    async addRoomToFloor(floorId, name) {
        const data = {
            floorId,
            name
        }
        const response = await api.post("/room", data);
        return response.data;
    },

    async editRoom(roomId, name) {
        const data = {
            roomId,
            name
        }
        const response = await api.put("/room", data);
        return response.data;
    },

    async deleteRoom(roomId) {
        const response = await api.delete(`/room/${roomId}`);
        return response.data;
    },
}

export default floorApi;