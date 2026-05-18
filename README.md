# MailEnclave

> A secure, open-source front-end layer over [Testmail.app](https://testmail.app) — with AES-256 encryption, PIN-protected vaulting, real-time SSE streaming, and persistent storage.

MailEnclave wraps the Testmail.app API to give developers and QA engineers a polished, private dashboard for managing test emails. Instead of relying on Testmail's 24-hour email buffer, MailEnclave fetches, encrypts, and stores your emails permanently — so you never lose a test run.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AES-256 Encrypted Storage** | API keys, email subjects, and full message bodies are encrypted at rest |
| **PIN-Protected Vault** | Mark sensitive email tags as private — access requires a vault PIN |
| **Real-Time SSE Streaming** | Incoming emails appear instantly via Server-Sent Events |
| **Multi-Namespace Support** | Connect multiple Testmail.app namespaces under one account |
| **Persistent Email History** | Emails are stored beyond Testmail's 24-hour free-tier buffer |
| **Paginated Email Loading** | Emails load in chunks of 30 with infinite scroll for performance |
| **Cascade Namespace Delete** | Deleting a namespace removes all its emails, tags, and vault data atomically |
| **Refresh Token Rotation** | Hardened sessions with JWT + rotating opaque refresh tokens and reuse detection |
| **OTP Email Verification** | Signup and password reset flows secured with 6-digit OTP |
| **Security Notifications** | Automatic email alerts on password and vault PIN changes |

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL via Prisma 7 (driver adapter)
- **Auth:** bcrypt + JWT + refresh token rotation
- **Encryption:** AES-256-CBC for email bodies and API keys
- **Email:** Nodemailer via Brevo SMTP
- **Hosting:** Azure Container Apps (Docker)
- **CI/CD:** GitHub Actions → GHCR → Azure

### Frontend
- **Framework:** Next.js (App Router)
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **State:** Zustand + React Query
- **Forms:** React Hook Form + Zod validation
- **Hosting:** Vercel

---

## 📁 Project Structure

```
MailEnclave/
├── backend/
│   ├── prisma/              # Schema & migrations
│   ├── src/
│   │   ├── constants/       # Environment config
│   │   ├── controllers/     # Route handlers
│   │   ├── db/              # Prisma client setup
│   │   ├── generated/       # Prisma generated client (gitignored)
│   │   ├── lib/             # Crypto, IP hashing, helpers
│   │   ├── middlewares/     # Auth guard, error handler
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic
│   │   ├── validators/      # Zod schemas
│   │   └── server.ts        # Entry point
│   ├── Dockerfile           # Multi-stage production build
│   └── prisma.config.js     # Prisma CLI config
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages (App Router)
│       ├── components/      # UI components
│       ├── lib/             # API clients, validators, utils
│       └── stores/          # Zustand stores
└── .github/
    └── workflows/           # CI/CD pipeline
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 22
- **PostgreSQL** database
- **Testmail.app** account (free tier works)
- **Brevo** account for SMTP (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/shubhamthakur-2504/MailEnclave.git
cd MailEnclave
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file from the sample:

```bash
cp sample.env .env
# Edit .env with your actual values
```

Required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `ENCRYPTION_KEY` | 32-byte key in hex (64 chars) for AES-256 |
| `IP_HASH_SECRET` | Secret for hashing client IPs |
| `BREVO_SMTP_HOST` | Brevo SMTP host |
| `BREVO_SMTP_PORT` | SMTP port (default: 587) |
| `BREVO_SMTP_USER` | Brevo SMTP username |
| `BREVO_SMTP_PASSWORD` | Brevo SMTP password |
| `BREVO_FROM_EMAIL` | Sender email for notifications |
| `FRONTEND_URL` | Frontend origin for CORS |

Run database migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:4000` by default.

---

## 🐳 Docker (Backend)

Build and run the backend with Docker:

```bash
cd backend
docker build -t mailenclave-backend .
docker run -p 4000:4000 --env-file .env mailenclave-backend
```

The Dockerfile uses a multi-stage build:
1. **Builder stage** — installs deps, generates Prisma client, compiles TypeScript
2. **Runner stage** — copies only production deps + compiled output for a lean image

---

## 🔄 CI/CD

The project uses GitHub Actions for automated deployment:

- **Trigger:** Push to `main` that touches `backend/` files
- **Pipeline:** Build Docker image → Push to GitHub Container Registry → Deploy to Azure Container Apps
- **Required Secrets:**
  - `AZURE_CREDENTIALS` — Azure service principal JSON

---

## 🔐 Security Model

- **Passwords** are hashed with **bcrypt** (10 salt rounds)
- **Email bodies** and **API keys** are encrypted with **AES-256-CBC** before storage
- **Vault PIN** adds an access-control layer on top of at-rest encryption
- **Sessions** use short-lived JWTs + rotating refresh tokens with reuse detection
- **OTP verification** on signup and password reset (rate-limited to 5 attempts)
- **Security emails** sent automatically on password or vault PIN changes
- **CORS** restricted to the configured frontend origin

---

## 📄 API Routes

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup/otp` | Request signup OTP |
| `POST` | `/auth/signup` | Register with OTP |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/logout` | Logout |
| `POST` | `/auth/refresh` | Refresh access token |
| `PUT` | `/auth/vault` | Setup vault PIN |
| `POST` | `/auth/vault/verify` | Verify vault PIN |
| `PUT` | `/auth/password` | Change password |
| `PUT` | `/auth/vault/reset` | Reset vault PIN |
| `POST` | `/auth/password-reset/otp` | Request password reset OTP |
| `POST` | `/auth/password-reset` | Reset password with OTP |

### Config (Namespaces)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/config` | Add namespace |
| `GET` | `/config` | List namespaces |
| `GET` | `/config/:id` | Get single namespace |
| `PUT` | `/config/:id` | Update namespace / API key |
| `DELETE` | `/config/:id` | Remove namespace (cascades emails + tags) |
| `GET` | `/config/:id/tags` | List private vault tags |
| `POST` | `/config/:id/tags` | Mark tag as private |
| `DELETE` | `/config/:id/tags/:tag` | Unmark tag as private |
| `GET` | `/config/stats` | Dashboard stats (counts) |

### Emails
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/emails/:configId` | Fetch emails (paginated, 30/page) |
| `GET` | `/emails/:configId/stream` | SSE real-time stream |
| `GET` | `/emails/mail/:id` | Fetch single email with decrypted body |
| `PATCH` | `/emails/mail/:id/read` | Mark email as read |
| `DELETE` | `/emails/mail/:id` | Delete single email |
| `DELETE` | `/emails/:configId/tag/:tag` | Delete all emails under a tag |

---

## 🙏 Acknowledgements

- [Testmail.app](https://testmail.app) — the email testing API this project is built on
- [Prisma](https://prisma.io) — type-safe database ORM
- [shadcn/ui](https://ui.shadcn.com) — beautiful UI components
- [Brevo](https://brevo.com) — transactional email delivery