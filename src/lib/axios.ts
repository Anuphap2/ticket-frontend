import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ฟังก์ชันสำหรับเตะออกเมื่อ Token มีปัญหาจริงๆ
const handleLogout = (reason = "expired") => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = `/login?reason=${reason}`;
  }
};

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    // 🎯 แก้ปัญหาข้อมูลซ้อนชั้น: คืนค่าก้อน data จริงๆ ออกไปให้ Service ใช้งานง่ายขึ้น
    // ถ้า Backend ของพู่กันใช้ TransformInterceptor { success, data }
    if (response.data && response.data.success === true) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 🎯 เช็ค 401 Unauthorized และต้องยังไม่ได้ลอง Retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Unauthorized! Attempting to refresh token...");
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.error("No refresh token found. Redirecting to login.");
        handleLogout("no_refresh_token");
        return Promise.reject(error);
      }

      try {
        // 🎯 ยิงไปขอ Token ใหม่
        // พยายามดึง baseURL ตรงๆ กันพลาด
        const refreshUrl = `${api.defaults.baseURL}/auth/refresh`;

        const res = await axios.post(refreshUrl, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        // 🎯 ดึง Token ออกมา (รองรับทั้ง snake_case และ camelCase)
        const responseData = res.data.data || res.data;
        const newAccessToken = responseData.access_token || responseData.accessToken;
        const newRefreshToken = responseData.refresh_token || responseData.refreshToken;

        if (!newAccessToken) throw new Error("Failed to extract new access token");

        // อัปเดตลงเครื่อง
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        console.log("Token refreshed successfully. Retrying original request.");

        // 🎯 ยิง Request เดิมซ้ำอีกครั้งด้วย Token ใหม่
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Refresh token expired or invalid:", refreshError);
        handleLogout("session_expired");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;