import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi } from "@/apis/auth.api";
import { tokenStore } from "@/apis/http";
import type { User } from "@/types/user.types";
import type { LoginBody, RegisterBody } from "@/types/auth.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isAuthenticated: boolean;
  profile: User | null;
  isLoading: boolean;
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  setAuthTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  // State-driven: thay doi hasToken -> re-render -> enabled toggle -> query chay
  const [hasToken, setHasToken] = useState(() =>
    Boolean(tokenStore.getAccess()),
  );

  // 1. Dùng useQuery quản lý thông tin User đăng nhập
  const {
    data: meResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await authApi.getMe();
        return res.data.data;
      } catch (err) {
        tokenStore.clear();
        setHasToken(false);
        throw err;
      }
    },
    enabled: hasToken,
    staleTime: 1000 * 60 * 10, // Cache 10 phút
    retry: false,
  });

  const profile = meResponse || null;

  const login = async (body: LoginBody) => {
    const { data } = await authApi.signIn(body);
    tokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
    setHasToken(true); // re-render -> enabled: true -> query tu dong fetch /me
  };

  const register = async (body: RegisterBody) => {
    const { data } = await authApi.signUp(body);
    tokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
    setHasToken(true);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
    return "";
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error(error);
    }
    tokenStore.clear();
    setHasToken(false);
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
  };

  const setAuthTokens = async (accessToken: string, refreshToken: string) => {
    tokenStore.setTokens(accessToken, refreshToken);
    setHasToken(true);
    await refetch();
  };

  const refreshProfile = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!profile,
        profile,
        isLoading: hasToken && isLoading,
        login,
        register,
        logout,
        setAuthTokens,
        refreshProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
