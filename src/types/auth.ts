export interface User {
  id: string;
  email?: string;
  username?: string;
  tiktokShopId?: string;
}

export interface LoginResponse {
  redirect_url?: string;
}

export interface SessionResponse {
  access_token: string;
  token_type: string;
  user: User;
}
