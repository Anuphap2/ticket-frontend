import axios, { AxiosAdapter } from "axios";
import { ROUTES } from "@/lib/constants";
import { mockStore } from "@/lib/mockStore";
import { handleMockRequest } from "@/lib/mockApi";

// Create custom adapter that handles demo mock API in portfolio mode
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const demoMockAdapter: AxiosAdapter = async (config) => {
  const isDemo = mockStore.isDemoMode();

  if (isDemo) {
    let parsedData = config.data;
    if (typeof config.data === "string") {
      try {
        parsedData = JSON.parse(config.data);
      } catch {}
    }

    try {
      const mockRes = await handleMockRequest(
        config.method || "get",
        config.url || "",
        parsedData,
        config.headers
      );

      if (mockRes) {
        return {
          data: mockRes.data,
          status: mockRes.status,
          statusText: "OK",
          headers: {},
          config,
        };
      }
    } catch (err) {
      console.warn("Demo Mock API handling error:", err);
    }
  }

  // Fallback to real backend adapter if demo mode is off or route unhandled
  return defaultAdapter(config);
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  adapter: demoMockAdapter,
});

const handleLogout = (reason = "expired") => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = `${ROUTES.login}?reason=${reason}`;
  }
};

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    // Unwrap backend's TransformInterceptor envelope { success, data }
    if (response.data && response.data.success === true) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ตรวจสอบว่า URL ที่ยิงไปนั้น เป็นของ Login หรือ Register หรือไม่
    const isAuthRoute =
      originalRequest.url?.includes("/auth/signin") ||
      originalRequest.url?.includes("/auth/signup");

    // ถ้าเป็น 401 และไม่ใช่หน้า Auth ให้ทำงานเรื่อง Refresh Token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        handleLogout("no_refresh_token");
        return Promise.reject(error);
      }

      try {
        const refreshUrl = `${api.defaults.baseURL}/auth/refresh`;
        const res = await axios.post(
          refreshUrl,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        );

        const responseData = res.data.data || res.data;
        const newAccessToken =
          responseData.access_token || responseData.accessToken;
        const newRefreshToken =
          responseData.refresh_token || responseData.refreshToken;

        if (!newAccessToken)
          throw new Error("Failed to extract new access token");

        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn("Refresh token expired or invalid — logging out");
        handleLogout("session_expired");
        return Promise.reject(refreshError);
      }
    }

    // ถ้าเป็นหน้า Login/Register หรือ Error อื่นๆ ให้โยน Error กลับไปที่ Component ได้เลย
    return Promise.reject(error);
  },
);

export default api;
