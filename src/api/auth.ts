import { request, setStoredAuth, setStoredUser } from "./request";

export interface LoginPayload {
  code: string;
  nickname?: string;
  avatar_url?: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    expires_in: number;
    user: {
      user_id: string;
      openid: string;
      nickname?: string;
      avatar_url?: string;
      created_at: string;
    };
  };
}

export async function login(payload: LoginPayload) {
  const res = await request<LoginResponse>("/api/wechat/login", "POST", payload, { auth: false });
  if (res?.data?.token) {
    setStoredAuth(res.data.token, res.data.expires_in);
    setStoredUser(res.data.user);
  }
  return res;
}
