import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => {
    // 🎯 แกะให้ถึงก้อนเนื้อข้อมูล (data.data) หรือก้อนหลัก (data)
    if (response.data && response.data.success) {
      // คืนค่าก้อนเนื้อข้อมูลออกไปเลย เพื่อให้ service รับไปใช้ง่ายๆ
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // 🎯 ยิงไปที่ endpoint refresh ของเรา (อิงตาม Backend ที่เราทำ)
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          // 🎯 แกะ data จากก้อนที่ refresh ได้มา
          const { access_token, refresh_token: new_refresh } = res.data.data;

          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', new_refresh);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.clear(); // ล้างให้หมดแล้วไปล็อกอินใหม่
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;