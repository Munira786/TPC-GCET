# Training & Placement Cell Portal

A campus placement portal for students and the placement office (TPC).
Students maintain one profile and apply to companies they're eligible
for; the placement office manages companies, eligibility criteria, and
application status.

## Tech stack

- **Framework:** Next.js 16 (App Router, Server Actions, TypeScript)
- **UI:** Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- **Database:** SQLite via Prisma ORM
- **Auth:** Custom JWT session cookies (`jose`), bcrypt password hashing
- **Validation:** Zod + React Hook Form
- **File storage:** Resumes stored on local disk under `/uploads` (private, served through an authenticated API route)

## Getting started

```bash
npm install
npx prisma migrate deploy   # create the SQLite database
npx prisma db seed          # load demo admin/students/companies
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment variables live in `.env` (already created for local dev —
see `.env.example` for the template). At minimum you need:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="a long random string"
```

## Demo credentials

Seeded by `prisma/seed.ts`:

| Role | Login | Password |
|---|---|---|
| Admin | `admin@tpc.edu` | `Admin@123` |
| Student (complete profile) | `21CSE001` (Aarav Sharma) | `Student@123` |
| Student (complete profile) | `21IT014` (Priya Verma) | `Student@123` |
| Student (complete profile) | `21ECE022` (Rohan Gupta) | `Student@123` |
| Student (incomplete profile) | `22CSE045` (Ishita Rao) | `Student@123` |

Re-run `npx prisma db seed` any time to reset back to this demo data
(existing rows are upserted, not duplicated).

## How it works

**Students** sign in with the enrollment number + password issued by
the college (seeded here as demo accounts — in a real deployment these
would be provisioned from the college's student records rather than
self-registered). On first login they fill a one-time profile
(personal + academic details, resume PDF, optional skills/links).
Once complete, they can browse companies — eligibility (CGPA,
department, backlogs, year) is computed against each company's
criteria and shown as a badge — apply in one click, and track status
per application.

**Admins** sign in separately and get a dashboard to browse/filter
students, manage companies (create/edit/delete, set eligibility
criteria and deadlines), review applicants per company, move
applications through Applied → Shortlisted → Selected/Rejected,
download resumes, and export an applicant list to CSV.

## Project structure

```
prisma/schema.prisma        Database schema (Student, Admin, Company, Application)
prisma/seed.ts               Demo data
src/actions/                 Server Actions (auth, student profile/apply, admin CRUD)
src/app/student/(portal)/    Student dashboard, companies, applications, profile
src/app/admin/(portal)/      Admin dashboard, students, companies
src/app/api/files/resume/    Authenticated resume download
src/app/api/admin/.../export CSV export of applicants
src/lib/                     Auth, Prisma client, eligibility logic, validation schemas
src/proxy.ts                 Route protection (Next.js 16 middleware convention)
```

## Notes for production use

- Swap `JWT_SECRET` for a strong random value and keep it out of version control.
- SQLite is used for zero-config local development; the Prisma schema
  can be pointed at PostgreSQL by changing the `datasource` provider
  and connection string.
- Resumes are stored on local disk (`/uploads`, gitignored). For a
  multi-instance deployment, swap `src/lib/files.ts` for an
  object-storage backend (S3-compatible).
