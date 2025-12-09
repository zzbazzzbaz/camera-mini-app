const BASE_URL = "http://localhost:3000";

interface RequestOptions {
  auth?: boolean;
  headers?: Record<string, string>;
}

export const TOKEN_KEY = "auth_token";
export const TOKEN_EXPIRES_AT_KEY = "auth_token_expires_at";
export const USER_KEY = "auth_user";

export const getStoredToken = () => {
  const token = uni.getStorageSync(TOKEN_KEY) as string | undefined;
  const expiresAt = uni.getStorageSync(TOKEN_EXPIRES_AT_KEY) as number | undefined;
  if (!token || !expiresAt) return "";
  if (Date.now() > expiresAt) {
    uni.removeStorageSync(TOKEN_KEY);
    uni.removeStorageSync(TOKEN_EXPIRES_AT_KEY);
    return "";
  }
  return token;
};

export function setStoredAuth(token: string, expiresInSeconds: number) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  uni.setStorageSync(TOKEN_KEY, token);
  uni.setStorageSync(TOKEN_EXPIRES_AT_KEY, expiresAt);
}

export function setStoredUser(user: any) {
  uni.setStorageSync(USER_KEY, user);
}

export function clearStoredAuth() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(TOKEN_EXPIRES_AT_KEY);
  uni.removeStorageSync(USER_KEY);
}

export async function request<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any,
  options: RequestOptions = {}
): Promise<T> {
  const auth = options.auth !== false;
  const token = auth ? getStoredToken() : "";

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      success: (res) => {
        const { statusCode, data: body } = res;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(body as T);
        } else {
          reject(body);
        }
      },
      fail: (error) => reject(error),
    });
  });
}
