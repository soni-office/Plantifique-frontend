export interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  role?: 'ORG_ADMIN' | 'ORG_MEMBER';   // Added: user's role in the org
  org_id?: string;                       // Added: the org this user belongs to
  tiktokShopId?: string;
}

export interface LoginResponse {
  redirect_url?: string;
}

export interface SessionResponse {
  jwt_token: string;
  access_token: string;   // Legacy alias — same value as jwt_token
  token_type: string;
  user: User;
}
