import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

// Scope all auth operations to the GCIP tenant
firebaseAuth.tenantId = import.meta.env.VITE_FIREBASE_TENANT_ID ?? 'default-tenant-id';

// Persist session across page reloads
void setPersistence(firebaseAuth, browserLocalPersistence);
