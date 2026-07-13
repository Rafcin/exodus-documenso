# Documenso Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy upstream Documenso v2.15.0 from `Rafcin/exodus-documenso` to the Exodus Enterprises Vercel team with Neon Postgres, Resend email, database-backed document storage, and a functional signing certificate.

**Architecture:** Keep upstream application behavior intact and add Vercel's official React Router preset to the Documenso app workspace. Connect project-scoped Neon and Resend Marketplace resources, map their injected credentials to Documenso's current environment contract, apply Prisma migrations through Neon's direct connection, and promote only after runtime health and certificate checks pass.

**Tech Stack:** Documenso 2.15.0, React Router 7, Hono, Prisma 6, Vercel, `@vercel/react-router` 1.3.1, Neon Postgres, Resend, OpenSSL.

## Global Constraints

- The fork begins from upstream stable release `v2.15.0` at `c5efd34e95737f98f64c31214cebee80fb598f29`.
- Deployment-specific commits remain minimal and retain the upstream fork relationship.
- The Vercel project must belong to the `exodus-enterprises` team and remain connected to `Rafcin/exodus-documenso`.
- Neon and Resend must be provisioned or connected through the Vercel Marketplace.
- Documents initially use `NEXT_PUBLIC_UPLOAD_TRANSPORT=database`.
- No paid Marketplace plan may be selected without explicit approval.
- Production promotion requires successful database, health, certificate, and email configuration checks.

---

### Task 1: Add the Vercel React Router deployment preset

**Files:**
- Modify: `apps/remix/package.json`
- Modify: `apps/remix/react-router.config.ts`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: the existing `@documenso/remix` React Router build.
- Produces: Vercel Build Output API artifacts through `vercelPreset()`.

- [ ] **Step 1: Capture the failing precondition**

Run:

```bash
node -e "const p=require('./apps/remix/package.json'); if (p.dependencies?.['@vercel/react-router']) process.exit(1)"
rg -q 'vercelPreset' apps/remix/react-router.config.ts && exit 1 || exit 0
```

Expected: both commands exit successfully because the Vercel dependency and preset are absent.

- [ ] **Step 2: Install the official adapter**

Run:

```bash
npm install @vercel/react-router@1.3.1 --workspace @documenso/remix
```

Expected: `apps/remix/package.json` and `package-lock.json` include `@vercel/react-router@1.3.1`.

- [ ] **Step 3: Enable the Vercel preset**

Update `apps/remix/react-router.config.ts` to:

```ts
import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
  appDirectory: 'app',
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;
```

- [ ] **Step 4: Verify configuration and build output**

Run:

```bash
node -e "const p=require('./apps/remix/package.json'); if (p.dependencies?.['@vercel/react-router'] !== '1.3.1') process.exit(1)"
rg -q 'presets: \[vercelPreset\(\)\]' apps/remix/react-router.config.ts
npm run build --workspace @documenso/remix
```

Expected: configuration assertions pass and the Documenso app build completes with Vercel output artifacts.

- [ ] **Step 5: Commit the adapter**

Run:

```bash
git add apps/remix/package.json apps/remix/react-router.config.ts package-lock.json docs/superpowers/plans/2026-07-13-vercel-deployment.md
git commit -m "build: add Vercel React Router deployment"
```

Expected: a commit containing only the adapter, lockfile, and implementation plan.

### Task 2: Create and connect the Vercel project

**Files:**
- Generated locally and ignored: `.vercel/project.json`

**Interfaces:**
- Consumes: `Rafcin/exodus-documenso` main and the Vercel adapter commit.
- Produces: the Exodus Enterprises `exodus-documenso` project linked to the GitHub fork.

- [ ] **Step 1: Push the approved source commits**

Run:

```bash
git push origin main
git ls-remote origin refs/heads/main
```

Expected: the remote SHA matches local `HEAD`.

- [ ] **Step 2: Create or reuse and link the project**

Run:

```bash
vercel project add exodus-documenso --scope exodus-enterprises
vercel link --yes --project exodus-documenso --scope exodus-enterprises
```

If the project already exists, reuse it and run only the link command. Expected: `.vercel/project.json` identifies the Exodus Enterprises team and `exodus-documenso` project.

- [ ] **Step 3: Connect GitHub and set the application root**

Run:

```bash
vercel git connect https://github.com/Rafcin/exodus-documenso.git --scope exodus-enterprises
```

Configure the project root directory to `apps/remix`, Node.js to 22.x, and production branch to `main` through the Vercel project API or dashboard. Expected: the project reports the GitHub repository, root directory, Node.js version, and production branch correctly.

### Task 3: Connect Marketplace resources and configure Documenso

**Files:**
- Generated outside git: `../secrets/documenso-signing.p12`
- Generated outside git: `../secrets/documenso-signing.p12.base64`

**Interfaces:**
- Consumes: linked Vercel project, Neon pooled/direct URLs, and Resend API key.
- Produces: complete production, preview, and development environment configuration.

- [ ] **Step 1: Create and connect a free Neon resource**

Run from the linked project:

```bash
vercel integration add neon --scope exodus-enterprises
vercel integration list --scope exodus-enterprises
vercel env ls --scope exodus-enterprises
```

Expected: a Neon resource is connected to `exodus-documenso` and injects `POSTGRES_URL` or `POSTGRES_PRISMA_URL` plus `POSTGRES_URL_NON_POOLING` without selecting a paid plan.

- [ ] **Step 2: Connect the existing Resend Marketplace installation**

Run:

```bash
vercel integration add resend/resend-email --scope exodus-enterprises
vercel integration list --scope exodus-enterprises
vercel env ls --scope exodus-enterprises
```

Expected: the existing Resend resource is connected to the project and injects `RESEND_API_KEY`.

- [ ] **Step 3: Generate production secrets and signing material**

Run outside the repository:

```bash
mkdir -p ../secrets
openssl req -x509 -newkey rsa:4096 -sha256 -days 825 -nodes -keyout ../secrets/documenso-signing.key -out ../secrets/documenso-signing.crt -subj '/CN=Exodus Enterprises Documenso/O=Exodus Enterprises'
openssl pkcs12 -export -out ../secrets/documenso-signing.p12 -inkey ../secrets/documenso-signing.key -in ../secrets/documenso-signing.crt -passout env:DOCUMENSO_SIGNING_PASSPHRASE
base64 < ../secrets/documenso-signing.p12 | tr -d '\n' > ../secrets/documenso-signing.p12.base64
```

Generate `DOCUMENSO_SIGNING_PASSPHRASE`, `NEXTAUTH_SECRET`, `NEXT_PRIVATE_ENCRYPTION_KEY`, and `NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY` with `openssl rand -base64 48`. Expected: secrets are not written inside the repository.

- [ ] **Step 4: Add Documenso environment variables**

Set each value for production, preview, and development using `vercel env add "$ENV_NAME" "$VERCEL_ENVIRONMENT" --scope exodus-enterprises`, where the two shell variables are assigned from each row before the command runs:

```text
NEXTAUTH_SECRET
NEXT_PRIVATE_ENCRYPTION_KEY
NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY
NEXT_PUBLIC_WEBAPP_URL=https://exodus-documenso.vercel.app
NEXT_PRIVATE_INTERNAL_WEBAPP_URL=https://exodus-documenso.vercel.app
NEXT_PUBLIC_UPLOAD_TRANSPORT=database
NEXT_PRIVATE_JOBS_PROVIDER=local
NEXT_PRIVATE_SMTP_TRANSPORT=resend
NEXT_PRIVATE_RESEND_API_KEY is copied from the Marketplace-injected RESEND_API_KEY
NEXT_PRIVATE_SMTP_FROM_NAME=Documenso
NEXT_PRIVATE_SMTP_FROM_ADDRESS is set to the sender address reported by the connected Resend resource
NEXT_PRIVATE_SIGNING_TRANSPORT=local
NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS is read from ../secrets/documenso-signing.p12.base64
NEXT_PRIVATE_SIGNING_PASSPHRASE is set to the generated DOCUMENSO_SIGNING_PASSPHRASE
DOCUMENSO_DISABLE_TELEMETRY=true
```

Expected: `vercel env ls --scope exodus-enterprises` lists every name for all three environments without exposing secret values.

### Task 4: Migrate, deploy, and verify production

**Files:**
- No tracked source changes.

**Interfaces:**
- Consumes: configured Vercel project and Marketplace credentials.
- Produces: verified production Documenso deployment.

- [ ] **Step 1: Pull production environment and apply migrations**

Run:

```bash
vercel env pull .env.vercel.production --yes --environment=production --scope exodus-enterprises
npm run with:env -- npm run prisma:migrate-deploy -w @documenso/prisma
```

Run the migration with the pulled production values loaded so Documenso uses Neon's direct connection for schema changes. Expected: Prisma reports all migrations applied successfully.

- [ ] **Step 2: Create the preview deployment**

Run:

```bash
PREVIEW_URL=$(vercel deploy --scope exodus-enterprises | tail -n 1)
vercel inspect "$PREVIEW_URL" --scope exodus-enterprises
```

Expected: the deployment state is Ready with no build errors.

- [ ] **Step 3: Verify runtime and signing certificate**

Run:

```bash
curl --fail --show-error --silent "$PREVIEW_URL/api/health"
curl --fail --show-error --silent "$PREVIEW_URL/api/certificate-status"
```

Expected: health returns HTTP 200 and certificate status reports a valid configured certificate.

- [ ] **Step 4: Verify authentication and email delivery**

Create a test account in the preview UI, request its verification or password-reset email, and confirm delivery in Resend. Expected: authentication persists through Neon and the message is accepted by Resend from the configured verified sender.

- [ ] **Step 5: Promote and re-check production**

Run:

```bash
vercel promote "$PREVIEW_URL" --scope exodus-enterprises
curl --fail --show-error --silent https://exodus-documenso.vercel.app/api/health
curl --fail --show-error --silent https://exodus-documenso.vercel.app/api/certificate-status
```

Expected: the exact verified preview artifact serves production and both production checks succeed.

- [ ] **Step 6: Confirm source and deployment alignment**

Run:

```bash
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/main
vercel inspect https://exodus-documenso.vercel.app --scope exodus-enterprises
```

Expected: the worktree is clean, local and remote Git SHAs match, and Vercel reports the production deployment Ready.
