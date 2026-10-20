# Code Nexus — Resend API Email Integration & Verification Guide

This guide details the complete **Resend HTTPS API** implementation in Code Nexus for single-use email verification, secure password reset, and transactional notifications.

---

## 1. Architectural Overview

- **Provider**: Resend HTTPS API (`resend` SDK v4)
- **Protocol**: HTTPS REST API (Port 443) — **No SMTP, Nodemailer, or SMTP fallbacks**
- **Token Security**:
  - Verification and password-reset tokens are generated as 32-byte cryptographic random hex strings (`crypto.randomBytes(32)`).
  - The application stores **only the SHA-256 hash** (`hashToken(token)`) in PostgreSQL tables (`verification_tokens` and `password_reset_tokens`).
  - Tokens are single-use, strictly bound to a user, and expire after 24 hours (verification) or 1 hour (password reset).
  - Token consumption operations use PostgreSQL row-level locks (`FOR UPDATE`) to prevent race conditions and token reuse.
  - Raw tokens are never returned in public API responses or written to system logs.

---

## 2. Environment Variables Configuration

Add the following variables to your `.env` file:

```env
# 1. Resend API Key
# Sign up at https://resend.com and generate an API key with "Sending access"
RESEND_API_KEY=

# 2. Sender Identity
# In development/testing, you can use Resend's verified test domain:
EMAIL_FROM=Code Nexus <onboarding@resend.dev>
# For production, verify your custom domain in Resend and configure:
# EMAIL_FROM=Code Nexus <noreply@<your-verified-domain>>

# 3. Application URL (used in verification & password reset links)
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. Authentication Secret (minimum 32 characters in production)
JWT_SECRET=
```

---

## 3. Step-by-Step Resend Account & Domain Verification

### Step 1: Create a Resend Account
1. Visit [resend.com](https://resend.com) and click **Get Started** (Free tier includes 3,000 emails/month).
2. Complete registration and verify your admin email.

### Step 2: Generate an API Key
1. Go to **API Keys** in the Resend dashboard navigation: [resend.com/api-keys](https://resend.com/api-keys).
2. Click **Create API Key**.
3. Name it `codenexus-production-key`.
4. Set permission to **Full access** (or **Sending access**).
5. Copy the generated key (`re_...`) and paste it as `RESEND_API_KEY` in your `.env`.

### Step 3: Domain Verification (Production)
1. Go to **Domains** in the Resend dashboard: [resend.com/domains](https://resend.com/domains).
2. Click **Add Domain** and enter your root domain (e.g., `codenexus.io`) or subdomain (e.g., `mail.codenexus.io`).
3. Resend will provide DNS records:
   - **DKIM** (TXT / CNAME records)
   - **SPF** (TXT record)
   - **DMARC** (TXT record)
4. Add these DNS records to your DNS provider (Cloudflare, Namecheap, Route53, etc.).
5. Click **Verify DNS Records** in Resend. Once status displays **Verified**, update `EMAIL_FROM`:
   ```env
   EMAIL_FROM=Code Nexus <noreply@codenexus.io>
   ```

### Step 4: Development Sandbox Testing (No Custom Domain Required)
If you do not yet have a verified domain:
- Keep `EMAIL_FROM=Code Nexus <onboarding@resend.dev>`.
- Resend's free test tier permits delivery to the specific email address associated with your Resend account.
- In unit and integration test runs, the Code Nexus email service provides automatic mock interception (`setEmailTestMock(true)`), so tests run deterministically without issuing outbound HTTP requests.

---

## 4. Authentication & Verification Flows

### A. New User Registration
1. User submits `full_name`, `email`, and `password` to `POST /api/auth/signup`.
2. Server validates format and minimum length (8 chars).
3. Server creates account with `is_verified = false`.
4. Server generates a 32-byte random token and saves its SHA-256 hash in `verification_tokens` (24h expiry).
5. Server sends verification email via Resend HTTPS API.
6. The user is **not** logged in automatically. Response contains no session cookie and no raw token.

### B. Consuming Email Verification
1. User clicks the link: `${APP_URL}/verify-email?token=<raw_token>`.
2. Frontend submits token to `POST /api/auth/verify-email`.
3. Server hashes token with SHA-256 and retrieves token record with `FOR UPDATE` row lock.
4. If token is valid, unused, and not expired:
   - Marks token `used_at = NOW()`.
   - Sets `users.is_verified = true`.
   - Revokes any remaining pending tokens for that user.
5. User is redirected to sign in.

### C. Rate-Limited Verification Resend
- Endpoint: `POST /api/auth/resend-verification`
- Rate limit: Maximum 3 requests per 10 minutes per IP/email.
- In-memory + PostgreSQL table sliding window (`rate_limits`).
- Safe responses: Returns a generic confirmation message even if the email does not exist, preventing user enumeration.

### D. Secure Password Reset Flow
1. User requests reset at `POST /api/auth/forgot-password`.
2. Rate limit: Maximum 3 requests per 15 minutes.
3. Server generates 32-byte token, hashes with SHA-256, and saves in `password_reset_tokens` (1h expiry).
4. Server sends reset email with link: `${APP_URL}/reset-password?token=<raw_token>`.
5. User chooses new password at `POST /api/auth/reset-password`.
6. Server verifies token hash, verifies `used_at IS NULL` and `expires_at > NOW()`, hashes new password with bcrypt, and invalidates all reset tokens.

---

## 5. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `RESEND_API_KEY is not configured` | Missing or blank key in `.env` | Add valid `re_...` key from [resend.com/api-keys](https://resend.com/api-keys) |
| `Domain not verified (403)` | `EMAIL_FROM` uses an unverified custom domain | Use `<onboarding@resend.dev>` until your domain DNS records verify |
| `Can only send to your own email` | Resend test mode restriction | In development, send emails to your Resend account email address or verify a domain |
| `This verification token has expired` | Link was clicked after 24 hours | Click "Resend Verification Link" on `/verify-email` |
| `Too many verification requests (429)` | Rate limit triggered | Wait 10 minutes before requesting another verification email |
