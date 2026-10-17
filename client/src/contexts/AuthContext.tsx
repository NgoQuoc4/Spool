import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/apis/auth.api";
import { tokenStore } from "@/apis/http";
import type { User } from "@/types/user.types";
import type { LoginBody, RegisterBody } from "@/types/auth.types";

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
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi load app: nếu có token thì fetch lại profile
  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then(({ data }) => setProfile(data.data))
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (body: LoginBody) => {
    const { data } = await authApi.signIn(body);
    tokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
    const { data: meData } = await authApi.getMe();
    setProfile(meData.data);
  };

  const register = async (body: RegisterBody) => {
    const { data } = await authApi.signUp(body);
    tokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
    const { data: meData } = await authApi.getMe();
    setProfile(meData.data);
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
    setProfile(null);
  };

  const setAuthTokens = async (accessToken: string, refreshToken: string) => {
    tokenStore.setTokens(accessToken, refreshToken);
    const { data: meData } = await authApi.getMe();
    setProfile(meData.data);
  };

  const refreshProfile = async () => {
    const { data: meData } = await authApi.getMe();
    setProfile(meData.data);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!profile,
        profile,
        isLoading,
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
