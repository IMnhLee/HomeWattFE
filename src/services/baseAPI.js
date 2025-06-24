import axios from "axios";

const API_URL = `http://103.177.111.30:3000`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Flag để theo dõi trạng thái đang refresh token hay không
let isRefreshing = false;
// Hàng đợi cho các request đang chờ token mới
let failedQueue = [];

// Xử lý hàng đợi các request thất bại
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const parsedToken = JSON.parse(token);
      config.headers["Authorization"] = `Bearer ${parsedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Kiểm tra nếu lỗi là 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Kiểm tra nếu tài khoản bị khóa
      if (error.response.data.message === "User not found or inactive") {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Kiểm tra nếu token không hợp lệ và chưa thử refresh token
      if (error.response.data.message === "Invalid token" && !originalRequest._retry) {
        if (isRefreshing) {
          // Nếu đang refresh, đưa request vào hàng đợi
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Lấy refresh_token từ localStorage
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
          // Không có refresh token, chuyển hướng về trang đăng nhập
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        try {
          // Gửi request để lấy token mới
          const parsedRefreshToken = JSON.parse(refreshToken);
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: parsedRefreshToken
          });
          console.log(response);
          
          // Nếu refresh token thành công
          if (response.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            
            // Lưu tokens mới vào localStorage
            localStorage.setItem("access_token", JSON.stringify(accessToken));
            localStorage.setItem("refresh_token", JSON.stringify(newRefreshToken));
            
            // Cập nhật header cho request gốc và request mặc định
            api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            
            // Xử lý các request trong hàng đợi
            processQueue(null, accessToken);
            
            // Thử lại request gốc
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token thất bại
          processQueue(refreshError, null);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    // Với các lỗi khác, trả về lỗi
    return Promise.reject(error);
  }
);

export default api;

// import axios from "axios";

// // const API_URL = `https://ecommercebackend-953d.up.railway.app/api`;
// const API_URL = `http://localhost:3000`;

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "accept ": "application/json",
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       const parsedToken = JSON.parse(token);
//       config.headers["Authorization"] = `Bearer ${parsedToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;
