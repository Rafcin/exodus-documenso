# Pivot Brands Production Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore production signing and public branding assets, apply Pivot Brands recipient-facing branding, and make Sales templates accessible to every accepted organisation member.

**Architecture:** Preserve the Vercel React Router preset and isolated Hono API function. Register splat routes after concrete routes, derive signing request metadata directly from the loader request, then apply organisation-specific data and environment configuration with existing Documenso storage and membership models.

**Tech Stack:** React Router 7, Hono, TypeScript, Node test runner through `tsx`, Prisma/PostgreSQL on Neon, Vercel, Resend.

## Global Constraints

- Keep Documenso product branding in authenticated app chrome.
- Use `logo.png` for recipient-facing branding and `P525.png` for organisation/team avatars.
- Preserve existing organisation roles, groups, and pending-invite acceptance boundaries.
- Sync `documenso/documenso` upstream before implementing local fixes.
- Write and observe failing regression tests before production-code changes.
- Deploy to the Exodus Enterprises Vercel team only after tests, type checking, and a production-environment build pass.

---

### Task 1: Vercel route precedence regression

**Files:**
- Create: `apps/remix/app/routes-order.test.ts`
- Modify: `apps/remix/app/routes.ts`

**Interfaces:**
- Consumes: React Router route configuration returned by the existing default export.
- Produces: deterministic ordering where `/api/avatar/:id` and both branding-logo routes precede `/api/*`.

- [ ] **Step 1: Write the failing route-order test**

Create a Node test that awaits the route configuration, flattens it, and asserts every concrete `/api` route appears before `/api/*`.

- [ ] **Step 2: Run the test and verify RED**

Run: `npx tsx --test apps/remix/app/routes-order.test.ts`

Expected: FAIL because `/api/*` currently appears before `/api/avatar/:id` and the branding routes.

- [ ] **Step 3: Register splat route files last**

Collect route files through `defaultVisitFiles`, sort non-splat files before splat files while preserving lexical order inside each class, and pass that visitor to `flatRoutes`.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npx tsx --test apps/remix/app/routes-order.test.ts`

Expected: PASS.

### Task 2: Signing loader context regression

**Files:**
- Create: `apps/remix/server/utils/get-loader-session.test.ts`
- Modify: `apps/remix/server/context.ts`
- Modify: `apps/remix/server/utils/get-loader-session.ts`
- Modify: `apps/remix/app/routes/_recipient+/sign.$token+/_index.tsx`
- Modify: `apps/remix/app/routes/embed+/_v0+/sign.$token.tsx`

**Interfaces:**
- Consumes: `Request` from React Router loader arguments.
- Produces: `getOptionalLoaderContext(request: Request): AppContext`, which does not require Hono context storage.

- [ ] **Step 1: Write the failing context test**

Create a Node test that invokes `getOptionalLoaderContext(request)` outside Hono and asserts it returns the user agent and forwarded IP metadata without throwing.

- [ ] **Step 2: Run the test and verify RED**

Run: `npx tsx --test apps/remix/server/utils/get-loader-session.test.ts`

Expected: FAIL with an assertion showing Hono context is unavailable.

- [ ] **Step 3: Derive context from the request**

Export a shared request-to-`AppContext` helper from `server/context.ts`, use it from Hono middleware and `getOptionalLoaderContext`, and pass `request` at all four signing loader call sites.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npx tsx --test apps/remix/server/utils/get-loader-session.test.ts`

Expected: PASS.

### Task 3: Static and generated verification

**Files:**
- Modify only files already listed if type errors require corrections.

**Interfaces:**
- Consumes: completed route and context fixes.
- Produces: deployable Vercel output with correct route precedence.

- [ ] **Step 1: Run both regression tests together**

Run: `npx tsx --test apps/remix/app/routes-order.test.ts apps/remix/server/utils/get-loader-session.test.ts`

Expected: 2 tests, 0 failures.

- [ ] **Step 2: Type-check Remix**

Run: `npm run typecheck -w @documenso/remix`

Expected: exit 0.

- [ ] **Step 3: Build Vercel production output**

Run: `vercel pull --yes --environment production --scope exodus-enterprises`, then `vercel build --prod --yes --scope exodus-enterprises`.

Expected: build status `ok`.

- [ ] **Step 4: Inspect generated route precedence**

Read `.vercel/output/config.json` and assert concrete branding/avatar routes occur before `/api/*`.

### Task 4: Apply Pivot Brands organisation configuration

**Files:**
- Operational input: `/Users/rafszuminski/Documents/Pivot Brands Logos/logo.png`
- Operational input: `/Users/rafszuminski/Documents/Pivot Brands Logos/P525.png`

**Interfaces:**
- Consumes: live Pivot Brands organisation `org_bmvkdtvhnuthmwea`, existing Sales team/template, existing storage helpers.
- Produces: accessible organisation branding, avatars, Sales inheritance, and cleaned template metadata.

- [ ] **Step 1: Snapshot live settings and membership mappings**

Query organisation global settings, teams, organisation internal groups, Sales team groups, and template metadata before writing.

- [ ] **Step 2: Store the full branding logo and P avatars**

Use `buildBrandingLogoData` for `logo.png`; use `setAvatarImage` for the organisation and Leadership, Sales, and Operations teams with `P525.png`.

- [ ] **Step 3: Apply accessible inherited branding**

Set organisation branding enabled, company URL/details, and monochrome colors with `primary: #111111` and `primaryForeground: #ffffff`; leave team settings inherited.

- [ ] **Step 4: Make Sales access automatic**

Upsert the Sales `TeamGroup` mapping from the organisation INTERNAL_ORGANISATION MEMBER group with team role MEMBER. Preserve all other mappings.

- [ ] **Step 5: Clean the Sales template**

Set title to `Pivot Brands Payment Authorization`, visibility to EVERYONE, and add a concise signing subject and message.

- [ ] **Step 6: Update production sender display name**

Set `NEXT_PRIVATE_SMTP_FROM_NAME=Pivot Brands` in the Vercel production environment while preserving the verified sender address and Resend API key.

### Task 5: Preview, production promotion, and end-to-end proof

**Files:**
- No source files.

**Interfaces:**
- Consumes: prebuilt production artifact and live organisation configuration.
- Produces: verified production behavior at `https://documenso.pivotbrands.com`.

- [ ] **Step 1: Deploy the prebuilt artifact as preview**

Run: `vercel deploy --prebuilt --scope exodus-enterprises --yes`.

- [ ] **Step 2: Verify preview HTTP boundaries**

Check health, organisation logo, Sales team logo, organisation avatar, and the original signing path. Require successful image content types and no Hono-context error.

- [ ] **Step 3: Promote the verified artifact to production**

Run: `vercel promote <preview-url> --scope exodus-enterprises --yes`.

- [ ] **Step 4: Verify production data and HTTP behavior**

Repeat the endpoint checks on `documenso.pivotbrands.com`, inspect runtime errors, and verify Sales inheritance and template metadata directly in PostgreSQL.

- [ ] **Step 5: Send and open a new recipient request**

Send one payment-authorization request to `rafcin.s@gmail.com`, verify Resend acceptance/delivery, fetch its signing URL, and require HTTP 200 with the Pivot Brands logo endpoint returning an image.

- [ ] **Step 6: Push the verified fork**

Commit the stabilization changes, fast-forward local `main`, push `main` to `Rafcin/exodus-documenso`, and confirm origin contains the upstream merge and local regression fixes.

