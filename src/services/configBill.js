import api from "./baseAPI";

const configBillApi = {

    async getStartBillingDate() {
        const response = await api.get("/epriceConfig/startBillingDate");
        return response.data;
    },

    async editStartBillingDate(date) {
        const data = {
            billingCycleStartDay: date
        };
        const response = await api.post("/epriceConfig/startBillingDate/edit", data);
        return response.data;
    },

    // Bill Config methods
    async getPriceConfig() {
        const response = await api.get("/epriceConfig");
        return response.data;
    },

    async editPriceConfig(priceType) {
        const data = { priceType };
        const response = await api.post("/epriceConfig/edit", data);
        return response.data;
    },

    // One Price Config methods
    async getOnePriceConfig() {
        const response = await api.get("/epriceConfig/onePrice");
        return response.data;
    },

    // async createOnePriceConfig(price) {
    //     const data = { price };
    //     const response = await api.post("/epriceConfig/onePrice/create", data);
    //     return response.data;
    // },

    async editOnePriceConfig(price) {
        const data = { price };
        const response = await api.post("/epriceConfig/onePrice", data);
        return response.data;
    },

    // Percent Price Config methods
    async getPercentPriceConfig() {
        const response = await api.get("/epriceConfig/percentPrice");
        return response.data;
    },

    async createPercentPriceConfig(name, price, percent) {
        const data = {
            name,
            price,
            percent
        };
        const response = await api.post("/epriceConfig/percentPrice/create", data);
        return response.data;
    },

    async editPercentPriceConfig(id, name, price, percent) {
        const data = {
            id,
            name,
            price,
            percent
        };
        const response = await api.post("/epriceConfig/percentPrice/edit", data);
        return response.data;
    },

    async deletePercentPriceConfig(id) {
        const data = { id };
        const response = await api.post("/epriceConfig/percentPrice/delete", data);
        return response.data;
    },

    // Stair Price Config methods
    async getStairPriceConfig() {
        const response = await api.get("/epriceConfig/stairPrice");
        return response.data;
    },

    async createStairPriceConfig(step, minKwh, maxKwh, price) {
        const data = {
            step,
            minKwh,
            maxKwh,
            price
        };
        const response = await api.post("/epriceConfig/stairPrice/create", data);
        return response.data;
    },

    async editStairPriceConfig(id, step, minKwh, maxKwh, price) {
        const data = {
            id,
            step,
            minKwh,
            maxKwh, 
            price
        };
        const response = await api.post("/epriceConfig/stairPrice/edit", data);
        return response.data;
    },

    async deleteStairPriceConfig(id) {
        const data = { id };
        const response = await api.post("/epriceConfig/stairPrice/delete", data);
        return response.data;
    }
};

export default configBillApi;