"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // 🎯 สำคัญ: ต้องใส่ Header กลับเข้าไปทุกครั้งที่ Refresh หน้าเว็บด้วยครับ
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Failed to parse user data', error);
                logout(); // ถ้าข้อมูลเพี้ยน ให้ logout ไปเลยปลอดภัยกว่าครับ
            }
        }
        setLoading(false);
    };
    initAuth();
}, []);

  const login = (token: string, refreshToken: string, userData: any) => {
    // 🎯 เช็คก่อนว่า userData ถูกครอบมาหรือเปล่า ถ้าถูกครอบให้แกะออกก่อนเก็บ
    const actualUser = userData?.data ? userData.data : userData;

    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(actualUser));

    setUser(actualUser);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
