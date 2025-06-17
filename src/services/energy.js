import api from "./baseAPI";

const energyApi = {
    async getConsumptionInOneCycle() {
        const response = await api.get("/energy/consumption");
        return response.data;
    },

    async getConsumptionByDate(viewType, date) {
        // const formattedDate = format(date, "yyyy-MM-dd");
        const data = {
            viewType: viewType,
            date: date
        };
        const response = await api.post("/energy/consumption", data);
        return response.data;
    },

    async getLineEnergyData() {
        const response = await api.get("/energy/line-data");
        return response.data;
    }
}

export default energyApi;