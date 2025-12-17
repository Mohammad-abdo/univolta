# Backend & Dashboard Setup Guide

## Prerequisites

- Node.js 20+
- SQLite is bundled automatically (no database service to configure)

## 1. Install dependencies

Install frontend dependencies from the project root:
```bash
npm install
```

Then install backend dependencies:
```bash
cd backend
npm install
```

## 2. Environment variables

### Frontend (`.env.local`)
Copy the example file and adjust the API URL if needed:
```bash
cp env.example .env.local
```

### Backend (`backend/.env`)
```bash
cd backend
cp env.example .env
```
The default `.env` uses an embedded SQLite database at `backend/dev.db`. Update the JWT secrets before running the server.

## 3. Database & seed

While inside `backend/` run:
```bash
npx prisma migrate deploy
npm run db:seed
```
This creates `dev.db`, syncs the schema, and seeds the default admin plus demo data.

## 4. Run the stack

Open two terminals:

1. **Backend API** (`backend/`):
   ```bash
   npm run dev
   ```
   → `http://localhost:4000/api/v1`

2. **Next.js app** (project root):
   ```bash
   npm run dev
   ```
   → Dashboard login at `http://localhost:3000/dashboard/login`

## Default Admin Credentials

- Email: `admin@univolta.com`
- Password: `admin123`

⚠️ Change this password after the first login.

## API Surface (authenticated unless noted)

- `POST /api/v1/auth/login` – credentials → tokens
- `GET /api/v1/auth/me` – validate the access token
- `POST /api/v1/auth/logout` – revoke refresh tokens
- `GET /api/v1/universities` – list universities (counts included)
- `POST /api/v1/universities` – create university *(admin)*
- `PUT /api/v1/universities/:id` – update university *(admin)*
- `DELETE /api/v1/universities/:id` – delete university *(admin)*
- `GET /api/v1/programs` – list programs
- `POST /api/v1/programs` – create program *(admin)*
- `GET /api/v1/applications` – list applications *(admin)*
- `POST /api/v1/applications` – submit an application (public)
- `GET /api/v1/testimonials` – list published testimonials (public)
- `POST /api/v1/testimonials` – create testimonial *(admin)*
- `GET /api/v1/faqs` – list published FAQs (public)
- `POST /api/v1/faqs` – create FAQ *(admin)*
- `GET /api/v1/users` – list users *(admin)*

All write endpoints expect the bearer token returned by `/auth/login`.

## Dashboard Pages

- `/dashboard/login` – admin login
- `/dashboard` – overview metrics
- `/dashboard/universities` – manage universities (delete supported)

Use the same authenticated fetch pattern to extend additional admin sections.

