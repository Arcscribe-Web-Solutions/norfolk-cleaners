# Norfolk Cleaners

> **A modern, web-based replacement for ServicesM8** - built by [Arcscribe Web Solutions](https://arcscribe.co.uk).

Norfolk Cleaners is moving away from [ServicesM8](https://www.servicesm8.com/) and needs a purpose-built website and job management platform tailored to their cleaning business. This project is that replacement: a fast, modern Next.js application backed by a **Coolify-hosted PostgreSQL** database that will grow to cover booking, job tracking, invoicing, and everything else ServicesM8 currently handles - without the per-job fees and platform lock-in.

**Demo URL:** [https://demo.norfolkcleaners.arcscri.be](https://demo.norfolkcleaners.arcscri.be)

---

## Table of Contents

- [Stack](#stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Site Configuration](#site-configuration)
- [Components Reference](#components-reference)
- [Pages & Routing](#pages--routing)
- [API Routes](#api-routes)
- [Optional Integrations](#optional-integrations)
- [Environment Variables](#environment-variables)
- [Styling & Dark Mode](#styling--dark-mode)
- [SEO & Metadata](#seo--metadata)
- [Adding New Pages](#adding-new-pages)
- [Adding New Components](#adding-new-components)
- [Adding New API Routes](#adding-new-api-routes)
- [Health Check](#health-check)
- [Client Project Setup Checklist](#client-project-setup-checklist)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Conventions](#conventions)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Fonts | Geist Sans & Geist Mono (via `next/font/google`) | - |
| Database | PostgreSQL (Coolify) via `pg` | 8 *(optional)* |
| Object Storage | MinIO via AWS SDK v3 | 3 *(optional)* |
| Email | SMTP via Nodemailer | 8 *(optional)* |
| Linting | ESLint + `eslint-config-next` | 9 |

---

## Prerequisites

- **Node.js** 20 or later
- **npm** (ships with Node)
- *(Optional)* A [Coolify](https://coolify.io)-hosted PostgreSQL instance, MinIO, and/or an SMTP server - only if the feature is needed

---

## Getting Started

```bash
# 1 - Clone this repo (or use it as a template)
git clone <repo-url> client-project-name
cd client-project-name

# 2 - Install dependencies
npm install

# 3 - Copy the example env and customise
cp .env.example .env.local

# 4 - Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site should render with default placeholder content.

---

## Project Structure

```
arcscribesiteboilerplate/
├── public/                     # Static assets (favicon, images, etc.)
├── src/
│   ├── app/                    # Next.js App Router - pages & API routes
│   │   ├── api/
│   │   │   ├── contact/        # POST /api/contact - form handler
│   │   │   └── health/         # GET  /api/health  - status check
│   │   ├── about/              # /about
│   │   ├── contact/            # /contact (uses ContactForm component)
│   │   ├── privacy/            # /privacy (placeholder for legal copy)
│   │   ├── services/           # /services
│   │   ├── terms/              # /terms (placeholder for legal copy)
│   │   ├── globals.css         # Global styles + Tailwind import
│   │   ├── layout.tsx          # Root layout - Header, <main>, Footer
│   │   ├── not-found.tsx       # Custom 404 page
│   │   └── page.tsx            # Homepage - hero, services, CTA
│   ├── components/             # Reusable UI components
│   │   ├── Button.tsx          # Polymorphic button / link
│   │   ├── ContactForm.tsx     # Client-side contact form
│   │   ├── Container.tsx       # Max-width page wrapper
│   │   ├── Footer.tsx          # Site footer with Arcscribe attribution
│   │   ├── Header.tsx          # Responsive header with mobile menu
│   │   └── ServiceCard.tsx     # Service / feature card
│   └── lib/                    # Server-side utility modules
│       ├── db.ts               # PostgreSQL client (opt-in)
│       ├── features.ts         # Feature toggle system
│       ├── mail.ts             # SMTP email client (opt-in)
│       ├── site-config.ts      # Single source of truth for site data
│       └── storage.ts          # MinIO storage client (opt-in)
├── .env.example                # Template for environment variables
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Architecture Overview

### Design Principles

1. **Config-driven** - All site-specific strings (name, nav links, services, branding) live in `src/lib/site-config.ts`. No page component contains hard-coded client copy.
2. **Opt-in integrations** - Database, storage, and email are disabled by default. Each is gated by an `ENABLE_*` flag in `src/lib/features.ts`. Modules throw an explicit error if accessed while disabled.
3. **Singleton pattern** - All external clients (pg pool, Nodemailer transport, S3Client) are cached on `globalThis` to survive Next.js HMR reloads during development without leaking connections.
4. **Zero client-side JS where possible** - Only components that need interactivity (`ContactForm`, `Header` mobile menu) are marked `"use client"`. Everything else is a Server Component by default.
5. **Dark mode out of the box** - All components ship with Tailwind `dark:` variants that respond to the user's OS preference via `prefers-color-scheme`.

### Request Flow (Contact Form Example)

```
Browser → ContactForm (client component)
       → fetch POST /api/contact
       → route.ts validates input
       → if SMTP enabled → sendMail()
       → if DB enabled   → insert row (commented template)
       → console.log() as fallback
       → JSON response → ContactForm updates UI state
```

---

## Site Configuration

**File:** `src/lib/site-config.ts`

This is the single source of truth. Every layout element and page reads from here - **never hard-code client strings elsewhere**.

| Property | Purpose |
| --- | --- |
| `name` | Site / business name (also used in `<title>`) - defaults to `NEXT_PUBLIC_SITE_NAME` env var |
| `url` | Canonical production URL - defaults to `NEXT_PUBLIC_SITE_URL` env var |
| `description` | One-liner for meta tags and the footer |
| `locale` | HTML `lang` attribute and Open Graph locale (default: `en-GB`) |
| `nav` | Array of `{ label, href }` - drives both the Header and Footer navigation |
| `services` | Array of `{ title, description, icon }` - rendered as ServiceCards on the homepage |
| `arcscribe` | Arcscribe attribution block shown in the footer |

### Updating for a New Client

```ts
// src/lib/site-config.ts
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Acme Ltd",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://acme.example.com",
  description: "Professional widget manufacturing services.",
  locale: "en-GB",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
    // Add or remove entries as needed - the Header and Footer update automatically
  ],
  services: [
    { title: "Custom Widgets", description: "Bespoke widgets for any use case.", icon: "⚙️" },
    { title: "Widget Repair", description: "Fast turnaround repairs.", icon: "🔧" },
    { title: "Consultancy", description: "Expert advice on widget strategy.", icon: "💡" },
  ],
  // Leave arcscribe untouched
};
```

---

## Components Reference

All components live in `src/components/` and are self-contained.

### `Button`

Polymorphic component that renders as a `<Link>`, `<a>`, or `<button>` depending on props.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | Button label / content |
| `href` | `string?` | - | If provided, renders as a link |
| `variant` | `"primary" \| "secondary" \| "outline"` | `"primary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding / font size |
| `external` | `boolean` | `false` | Opens in new tab (`target="_blank"`) |
| `className` | `string` | `""` | Additional Tailwind classes |
| `onClick` | `() => void` | - | Click handler (button mode only) |

```tsx
<Button href="/contact" variant="primary" size="lg">Get in Touch</Button>
<Button href="https://arcscribe.co.uk" external variant="outline">Visit Arcscribe</Button>
<Button onClick={handleAction} variant="secondary">Do Something</Button>
```

### `Container`

Max-width wrapper (`max-w-6xl`) with responsive horizontal padding.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | Content |
| `as` | `"div" \| "section" \| "article" \| "main"` | `"div"` | HTML element |
| `className` | `string` | `""` | Additional classes |

```tsx
<Container as="section" className="py-20">
  <h2>Section Title</h2>
</Container>
```

### `ContactForm`

Client component (`"use client"`) that renders a name / email / message form. Submits to `POST /api/contact` via `fetch`. Manages its own `idle → submitting → success | error` state.

No props - drop it into any page:

```tsx
<ContactForm />
```

### `Header`

Responsive sticky header. Desktop: horizontal nav links. Mobile: hamburger toggle with slide-down menu. Reads `siteConfig.name` and `siteConfig.nav` automatically.

### `Footer`

Four-column grid footer: brand + description, quick links (from `siteConfig.nav`), legal links (privacy/terms), and Arcscribe attribution. Year is dynamically generated.

### `ServiceCard`

Renders a single service/feature card. Driven by the `ServiceItem` type from `site-config.ts`.

```tsx
<ServiceCard title="Consulting" description="Expert advice." icon="💡" />
```

---

## Pages & Routing

All pages use the Next.js App Router convention (`src/app/<route>/page.tsx`).

| Route | File | Description |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Homepage - hero section, service cards grid, CTA |
| `/about` | `src/app/about/page.tsx` | About page - customise per client |
| `/services` | `src/app/services/page.tsx` | Services page - customise per client |
| `/contact` | `src/app/contact/page.tsx` | Contact page - renders `<ContactForm />` |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy - placeholder, fill per client |
| `/terms` | `src/app/terms/page.tsx` | Terms of service - placeholder, fill per client |
| `/*` (404) | `src/app/not-found.tsx` | Custom 404 with "Go Home" button |

---

## API Routes

### `POST /api/contact`

Handles contact form submissions.

**Request body:**

```json
{ "name": "Jane Doe", "email": "jane@example.com", "message": "Hello!" }
```

**Behaviour:**
- Validates that `name`, `email`, and `message` are present (returns `400` otherwise)
- If `ENABLE_SMTP=true` → sends an email via `sendMail()` to `SMTP_FROM_EMAIL`
- If `ENABLE_DATABASE=true` → template for inserting into a `contact_submissions` table (commented out - uncomment and adjust when the schema is ready)
- Always logs to `console.log()` as a fallback
- Returns `{ "success": true }` on success, `{ "error": "..." }` on failure

### `GET /api/health`

Returns application status and connectivity of enabled integrations. Useful for uptime monitoring and post-deployment verification.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-18T12:00:00.000Z",
  "features": { "database": false, "storage": false, "smtp": false },
  "integrations": {}
}
```

When integrations are enabled, the `integrations` object includes their connection status (`"connected"` or `"error"`).

---

## Optional Integrations

All integrations are **disabled by default** and gated by the feature toggle system in `src/lib/features.ts`. Enable them by setting the corresponding `ENABLE_*` variable to `"true"` in `.env.local`.

If you import a disabled module and call its functions, it will throw a descriptive error:

```
[Arcscribe] Feature "database" is disabled. Set ENABLE_DATABASE=true in your .env.local to enable it.
```

### PostgreSQL via Coolify (`src/lib/db.ts`)

Provides a singleton connection pool via the `pg` library, connecting to a Coolify-hosted PostgreSQL instance using a `DATABASE_URL` connection string.

```env
ENABLE_DATABASE=true
DATABASE_URL=postgresql://postgres:<password>@<coolify-host>:5432/norfolk_cleaners
```

**Exports:**

| Function | Description |
| --- | --- |
| `getPool()` | Returns the singleton `Pool` instance |
| `query<T>(text, params?)` | Runs a parameterised query, returns `T[]` |
| `testConnection()` | Returns `true` if the database is reachable |

```ts
import { query } from "@/lib/db";

const users = await query<User>("SELECT * FROM users WHERE active = $1", [true]);
```

### MinIO Object Storage (`src/lib/storage.ts`)

S3-compatible client purpose-built for MinIO. Path-style access is always enabled.

```env
ENABLE_STORAGE=true
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=uploads
```

**Exports:**

| Function | Description |
| --- | --- |
| `getClient()` | Returns the singleton `S3Client` |
| `ensureBucket(bucket?)` | Creates the bucket if it doesn't exist |
| `uploadFile(key, body, contentType?, bucket?)` | Upload a file |
| `getFile(key, bucket?)` | Get a readable stream |
| `getFileInfo(key, bucket?)` | Get metadata without downloading |
| `fileExists(key, bucket?)` | Check existence |
| `deleteFile(key, bucket?)` | Delete a file |
| `listFiles(prefix?, maxKeys?, bucket?)` | List objects under a prefix |
| `getPresignedUrl(key, method?, expiresIn?, bucket?)` | Generate a pre-signed URL for upload/download |
| `testConnection()` | Returns `true` if the bucket is reachable |

```ts
import { ensureBucket, uploadFile, getPresignedUrl } from "@/lib/storage";

await ensureBucket();
await uploadFile("docs/report.pdf", buffer, "application/pdf");
const url = await getPresignedUrl("docs/report.pdf");        // GET (download)
const uploadUrl = await getPresignedUrl("docs/new.pdf", "PUT"); // PUT (browser upload)
```

### SMTP Email (`src/lib/mail.ts`)

Nodemailer-based transactional email.

```env
ENABLE_SMTP=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASSWORD=secret
SMTP_FROM_NAME="Norfolk Cleaners"
SMTP_FROM_EMAIL=noreply@example.com
```

**Exports:**

| Function | Description |
| --- | --- |
| `getTransport()` | Returns the singleton Nodemailer transporter |
| `sendMail(options)` | Send an email (see `SendMailOptions` interface) |
| `testConnection()` | Returns `true` if the SMTP server responds |

`SendMailOptions` fields: `to`, `subject`, `text?`, `html?`, `from?`, `replyTo?`, `cc?`, `bcc?`, `attachments?`

```ts
import { sendMail } from "@/lib/mail";

await sendMail({
  to: "customer@example.com",
  subject: "Thank you for your enquiry",
  html: "<p>We'll be in touch shortly.</p>",
  replyTo: "client@theirbusiness.co.uk",
});
```

---

## Environment Variables

Complete reference - copy from `.env.example` to `.env.local`.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | Recommended | `"Norfolk Cleaners"` | Site / business name (visible in browser) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `"http://localhost:3000"` | Canonical production URL |
| **Feature Toggles** | | | |
| `ENABLE_DATABASE` | No | `"false"` | Enable PostgreSQL (Coolify) |
| `ENABLE_STORAGE` | No | `"false"` | Enable MinIO |
| `ENABLE_SMTP` | No | `"false"` | Enable SMTP email |
| **PostgreSQL (Coolify)** | | | |
| `DATABASE_URL` | If DB enabled | - | Full PostgreSQL connection string from Coolify |
| **MinIO** | | | |
| `MINIO_ENDPOINT` | If storage enabled | `"http://localhost:9000"` | MinIO server URL |
| `MINIO_ACCESS_KEY` | If storage enabled | `"minioadmin"` | Access key |
| `MINIO_SECRET_KEY` | If storage enabled | `"minioadmin"` | Secret key |
| `MINIO_BUCKET` | If storage enabled | `"uploads"` | Default bucket name |
| **SMTP** | | | |
| `SMTP_HOST` | If SMTP enabled | `"smtp.example.com"` | SMTP server hostname |
| `SMTP_PORT` | If SMTP enabled | `587` | SMTP port |
| `SMTP_SECURE` | If SMTP enabled | `"false"` | Use TLS (`"true"` for port 465) |
| `SMTP_USER` | If SMTP enabled | `""` | SMTP username |
| `SMTP_PASSWORD` | If SMTP enabled | `""` | SMTP password |
| `SMTP_FROM_NAME` | If SMTP enabled | `"Client Site"` | Sender display name |
| `SMTP_FROM_EMAIL` | If SMTP enabled | `"noreply@example.com"` | Sender email address |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-only.

---

## Styling & Dark Mode

- **Tailwind CSS 4** is imported via `@import "tailwindcss"` in `src/app/globals.css`.
- CSS custom properties `--background` and `--foreground` are defined in `:root` and overridden in a `prefers-color-scheme: dark` media query.
- All components use Tailwind's `dark:` variant for dark mode styling - **no toggle is needed**. It follows the user's operating system preference automatically.
- Fonts: **Geist Sans** (body) and **Geist Mono** (code) are loaded via `next/font/google` in `layout.tsx` and exposed as CSS custom properties `--font-geist-sans` and `--font-geist-mono`.
- The design uses a **zinc colour palette** throughout for a clean, neutral aesthetic.

### Adding Custom Colours

Extend themes via `globals.css` using the `@theme inline` block or add Tailwind utilities as needed:

```css
@theme inline {
  --color-brand: #2563eb;
  --color-brand-dark: #1d4ed8;
}
```

Then use with `bg-brand`, `text-brand-dark`, etc.

---

## SEO & Metadata

Metadata is configured in `src/app/layout.tsx` via the Next.js `Metadata` export:

- **Title template:** `"%s | Client Name"` - each page can set its own title segment.
- **Description:** Pulled from `siteConfig.description`.
- **metadataBase:** Set to `siteConfig.url` - required for correct Open Graph URLs.
- **Open Graph:** Type, locale, and site name are pre-configured.

To set page-specific metadata:

```ts
// src/app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",               // Renders as "About Us | Client Name"
  description: "Learn more about our company.",
};
```

---

## Adding New Pages

1. Create a folder under `src/app/` with the route name:

```
src/app/blog/page.tsx
```

2. Use the standard template:

```tsx
import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest news and updates.",
};

export default function BlogPage() {
  return (
    <Container as="section" className="py-20">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Blog
      </h1>
      {/* Page content */}
    </Container>
  );
}
```

3. Add the route to `siteConfig.nav` if it should appear in the header/footer navigation.

---

## Adding New Components

1. Create the file in `src/components/`:

```
src/components/TestimonialCard.tsx
```

2. Follow the existing pattern:
   - Default export the component
   - Accept props via a typed interface
   - Use Tailwind classes with `dark:` variants
   - Only add `"use client"` if the component needs interactivity (state, effects, event handlers)

---

## Adding New API Routes

1. Create a `route.ts` file in the appropriate `src/app/api/` folder:

```
src/app/api/newsletter/route.ts
```

2. Export named functions matching HTTP methods:

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Handle logic
  return NextResponse.json({ success: true });
}
```

3. Use the feature toggle pattern to guard optional integrations:

```ts
import { features } from "@/lib/features";

if (features.database) {
  const { query } = await import("@/lib/db");
  // ...
}
```

---

## Health Check

```
GET /api/health
```

Use this endpoint after deployments and for uptime monitoring. It reports:
- Overall application status
- Which features are enabled
- Connectivity status of each enabled integration (database, storage, SMTP)

Example response with all features enabled and healthy:

```json
{
  "status": "ok",
  "timestamp": "2026-02-18T12:00:00.000Z",
  "features": { "database": true, "storage": true, "smtp": true },
  "integrations": {
    "database": "connected",
    "storage": "connected",
    "smtp": "connected"
  }
}
```

---

## Client Project Setup Checklist

Use this checklist when creating a new client site from this boilerplate:

- [ ] Clone/copy the repo and rename the project
- [ ] Run `npm install`
- [ ] Copy `.env.example` → `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_NAME` and `NEXT_PUBLIC_SITE_URL`
- [ ] Edit `src/lib/site-config.ts` - update `description`, `nav`, and `services`
- [ ] Replace `public/favicon.ico` with the client's favicon
- [ ] Customise page content in `src/app/*/page.tsx` (especially homepage hero copy)
- [ ] Enable required integrations in `.env.local` (`ENABLE_DATABASE`, `ENABLE_STORAGE`, `ENABLE_SMTP`)
- [ ] Configure integration credentials in `.env.local`
- [ ] Update `src/app/privacy/page.tsx` with client's privacy policy
- [ ] Update `src/app/terms/page.tsx` with client's terms of service
- [ ] Run `npm run build` to verify there are no errors
- [ ] Verify `GET /api/health` returns expected status
- [ ] Set up production environment variables on the hosting platform

---

## Deployment

This is a standard Next.js application. Deploy to any platform that supports Node.js:

### Vercel (Recommended)

1. Push the repo to GitHub/GitLab
2. Import the project in [Vercel](https://vercel.com)
3. Add all `.env.local` variables in the Vercel project settings → Environment Variables
4. Deploy

### Self-Hosted (Node.js)

```bash
npm run build
npm start
```

The production server runs on port 3000 by default. Use a reverse proxy (Nginx, Caddy) in front.

### Docker

Add a `Dockerfile` following the [Next.js Docker example](https://github.com/vercel/next.js/tree/canary/examples/with-docker) and include your environment variables at build/run time.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create an optimised production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint across the project |

---

## Conventions

These are the standards we follow across all Arcscribe client projects:

1. **TypeScript everywhere** - No `.js` files. All components and utilities are strictly typed.
2. **Server Components by default** - Only add `"use client"` when a component needs browser APIs, state, or event handlers.
3. **Config-driven copy** - Client-specific text lives in `site-config.ts`, not scattered across components.
4. **Feature toggles** - Never import an optional integration directly. Always check `features.*` or use `requireFeature()`.
5. **Path aliases** - Use `@/` to import from `src/` (configured in `tsconfig.json`).
6. **Tailwind only** - No CSS modules or styled-components. Use Tailwind utility classes with `dark:` variants.
7. **Semantic HTML** - Use appropriate semantic elements (`<section>`, `<article>`, `<nav>`, `<main>`, etc.).
8. **No hard-coded colours** - Stick to the zinc palette for consistency. Add brand colours via `@theme inline` in `globals.css`.

---

## Troubleshooting

### `Feature "X" is disabled` error

You're calling a function from `db.ts`, `mail.ts`, or `storage.ts` without enabling the feature. Add `ENABLE_DATABASE=true`, `ENABLE_STORAGE=true`, or `ENABLE_SMTP=true` to your `.env.local`.

### Hot reload creates multiple database connections

This shouldn't happen - the pool is cached on `globalThis`. If you see connection issues during development, restart the dev server (`Ctrl+C` → `npm run dev`).

### Contact form returns 400

The API expects `name`, `email`, and `message` in the JSON body. Ensure all three fields are populated.

### Styles not applying

Make sure `@import "tailwindcss"` is present at the top of `src/app/globals.css`. If you've added custom Tailwind classes that don't render, run `npm run build` to check for purge issues.

### SMTP "self-signed certificate" error

Set `SMTP_SECURE=false` for port 587 (STARTTLS) or ensure your SMTP provider has a valid certificate. For development, you can use [Mailpit](https://github.com/axllent/mailpit) or [MailHog](https://github.com/mailhog/MailHog) as a local SMTP server.

### MinIO "bucket does not exist" error

Call `ensureBucket()` once before uploading. You can add this to a startup script or run it from the health check route during initial setup.

---

## License

Private - built and managed by [Arcscribe Web Solutions](https://arcscribe.co.uk) for Norfolk Cleaners.
