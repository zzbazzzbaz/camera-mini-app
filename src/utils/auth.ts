import { getStoredToken, setStoredAuth, setStoredUser, clearStoredAuth } from "@/api/request";

export const useAuth = () => {
  const getToken = () => getStoredToken();

  const saveAuth = (token: string, expiresInSeconds: number, user?: any) => {
    setStoredAuth(token, expiresInSeconds);
    if (user) setStoredUser(user);
  };

  const clearAuth = () => clearStoredAuth();

  return { getToken, saveAuth, clearAuth };
};
