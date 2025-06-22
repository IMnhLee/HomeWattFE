import api from "./baseAPI";

const authApi = {
  async login(params) {
    const response = await api.post("/auth/login", {
      email: params.username,
        password: params.password,
    });
    return response.data
  },

  async logout(refresh_token) {
    const response = await api.post("/auth/logout", {
      RefreshToken: refresh_token,
    });
    return response.data
  },

  async register(params) {
    const response = await api.post("/auth/register", {
      email: params.email,
      password: params.password,
      username: params.username,
      // phone: params.phone,
    });
    return response.data
  },

  async forgotPassword(params) {
    const response = await api.post("/user/forgot-password", {
      email: params.email,
    });
    return response.data
  },

  async resetPassword(params) {
    const response = await api.post("/user/reset-password", {
      email: params.email,
      password: params.password,
      token: params.token,
    });
    return response.data
  },

  async loginWithGoogle(token) {
    const response = await api.post("/auth/google-login", {
      token: token,
    });
    return response.data
  }
};

export default authApi;
