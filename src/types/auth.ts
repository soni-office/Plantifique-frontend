export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ORG_MEMBER';

export interface User {
  uid: string;        // Firebase UID — canonical identity
  id?: string;        // backwards-compat alias (same value as uid)
  email?: string;
  name?: string;
  username?: string;
  role?: UserRole;
  org_id?: string;
  tiktokShopId?: string;
}
