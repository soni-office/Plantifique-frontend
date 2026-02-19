# Plantifique Frontend

React + TypeScript + Vite frontend for TikTok Shop OAuth flow and dashboard.

## Setup

1. Install dependencies:
   `npm install`
2. Create env file:
   `cp .env.example .env`
3. Run dev server:
   `npm run dev`

Frontend runs at `http://localhost:5173`.

## Environment Variables

- `VITE_BACKEND_URL=http://localhost:8000`
- `VITE_TIKTOK_LOGIN_PATH=/auth/tiktokshop/login`

## Backend CORS Notes

For FastAPI backend, allow:
- origin: `http://localhost:5173`
- credentials: `true` (safe to keep enabled)

Example FastAPI CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## OAuth Troubleshooting

- A `302 Found` on TikTok OAuth authorize endpoint is normal. OAuth uses redirects.
- The backend login endpoint, backend callback route, and TikTok app redirect URI must match exactly.
- This frontend expects backend callback relay to: `/auth/tiktokshop/callback` on frontend.
- Flow implemented:
  - frontend navigates to backend `/auth/tiktokshop/login`
  - backend redirects TikTok callback to frontend with `code` + `state`
  - frontend page `/auth/tiktokshop/callback` calls backend `/auth/tiktokshop/exchange`
  - backend returns app JWT; frontend stores it and calls `/auth/me`
- Ensure TikTok app redirect URI is backend callback:
  - `http://localhost:8000/auth/tiktokshop/callback`
