# Documenso Vercel Deployment Design

## Objective

Deploy the latest upstream Documenso release from `Rafcin/exodus-documenso` to the Exodus Enterprises Vercel team with Neon Postgres and Resend provisioned through the Vercel Marketplace.

## Source and release policy

- The fork's `main` branch must begin at the exact commit used by upstream `documenso/documenso` for the latest stable release, currently `v2.15.0` (`c5efd34e95737f98f64c31214cebee80fb598f29`).
- Deployment-specific changes are applied as minimal commits on top of that upstream release.
- The deployed project remains connected to the fork so future updates can be reviewed and deployed through Git.

## Runtime architecture

- Vercel hosts the React Router application using Vercel's official `@vercel/react-router` preset.
- The existing Documenso Hono and React Router request stack remains unchanged.
- Neon supplies PostgreSQL. Its pooled URL is used for application queries and its direct URL is used for Prisma migrations.
- Documents use Documenso's default database storage for the initial deployment, avoiding an extra storage service.
- Resend supplies transactional email through Documenso's native `resend` transport.
- A passphrase-protected PKCS#12 signing certificate is supplied as encrypted base64 environment data because Vercel does not provide a persistent mounted filesystem.

## Environment mapping

- Neon Marketplace variables are consumed through Documenso's built-in `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, and `POSTGRES_URL_NON_POOLING` detection.
- `RESEND_API_KEY` is mapped to `NEXT_PRIVATE_RESEND_API_KEY`.
- The production URL is supplied as `NEXT_PUBLIC_WEBAPP_URL` and `NEXT_PRIVATE_INTERNAL_WEBAPP_URL`.
- Random values of at least 32 characters are generated for `NEXTAUTH_SECRET`, `NEXT_PRIVATE_ENCRYPTION_KEY`, and `NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY`.
- Email uses `NEXT_PRIVATE_SMTP_TRANSPORT=resend`, an authorized sender address, and the Documenso sender name.
- Signing uses `NEXT_PRIVATE_SIGNING_TRANSPORT=local`, `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS`, and `NEXT_PRIVATE_SIGNING_PASSPHRASE`.

## Deployment sequence

1. Add and validate the official Vercel React Router preset.
2. Push the deployment commit to the fork.
3. Create and link the Exodus Enterprises Vercel project.
4. Provision a free Neon resource and connect it to the project.
5. Connect the existing Resend Marketplace installation and API key to the project.
6. Add the Documenso-specific environment variables and signing certificate.
7. Apply Prisma migrations through the direct Neon connection.
8. Create a preview deployment and verify build/runtime logs, `/api/health`, `/api/certificate-status`, authentication, and email delivery.
9. Promote the verified deployment to production.

## Failure handling

- Do not promote a preview that fails health, certificate, database, or email checks.
- If a database migration fails, preserve the database and deployment, inspect the failed migration, and repair forward.
- If a Marketplace install requires billing or provider consent, stop at the provider confirmation rather than selecting a paid plan without approval.

## Success criteria

- The fork contains the latest upstream stable release plus only the required Vercel deployment changes.
- The Vercel project belongs to Exodus Enterprises and is Git-connected to `Rafcin/exodus-documenso`.
- Neon and Resend are project-connected Marketplace resources.
- The production URL returns a healthy Documenso instance.
- Database migrations, certificate status, account authentication, document signing, and outbound transactional email are verified.
