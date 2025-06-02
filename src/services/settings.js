import api from "./baseAPI";

const settingsApi = {
    async getBillingStartDate() {
        const response = await api.get("/settings/billing-start-date");
        return response.data;
    },

    async editBillingStartDate(date) {
        const data = {
            billingStartDate: date
        };
        const response = await api.post("/settings/billing-start-date", data);
        return response.data;
    }
}