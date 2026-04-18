/**
 * app/api/auth/[...nextauth]/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth.js Route Handler
 *
 * This file is the single entry point for ALL Auth.js HTTP requests:
 *   GET  /api/auth/session     → returns current session
 *   GET  /api/auth/csrf        → CSRF token
 *   GET  /api/auth/providers   → list of configured providers
 *   POST /api/auth/signin/credentials → handles login form submission
 *   POST /api/auth/signout     → handles logout
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Import the handlers from your auth config
 *   import { handlers } from '@/lib/auth'
 *
 * STEP 2 — Re-export GET and POST from handlers
 *   export const { GET, POST } = handlers
 *
 * That's it! Auth.js handles everything internally.
 * You don't write any logic here.
 */
