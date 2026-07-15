# Pivot Brands Production Stabilization Design

## Objective

Stabilize the Exodus Enterprises Documenso deployment at `documenso.pivotbrands.com`, restore recipient signing and public branding assets, apply upgrade-safe Pivot Brands branding, and make Sales templates available to current and future organisation members.

## Approved branding boundary

Pivot Brands branding applies to recipient-facing signing pages, transactional emails, organisation and team avatars, organisation branding settings, sender display name, and reusable Sales template copy. Documenso product identity remains in the authenticated application chrome and sign-in product shell so upstream upgrades remain straightforward.

The supplied full `logo.png` is the email and signing-header logo. The supplied square `P525.png` is the organisation and team avatar.

## Root causes

### Recipient signing 500

The Vercel React Router preset emits recipient pages as independent functions. Those functions do not run inside the Hono `contextStorage()` middleware, but `getOptionalLoaderContext()` unconditionally reads Hono context. The signing loader therefore throws `Context is not available` before it can load the recipient envelope.

The request metadata needed by these loaders is derivable directly from the incoming `Request`. The fix makes this dependency explicit and passes the request through every signing loader call site.

### Missing logos and avatars

The custom `/api/*` React Router catch-all is emitted before specific routes such as `/api/avatar/:id` and `/api/branding/logo/team/:teamId`. Vercel evaluates that broad route first, forwards the request to Hono, and Hono returns 404 because those public image routes are React Router routes.

The fix makes route discovery deterministic: splat routes are registered after concrete routes. This preserves the isolated Hono API bundle while allowing every specific React Router API route to win as intended.

## Organisation configuration

- Organisation and all three teams inherit a restrained monochrome theme with accessible black-on-white and white-on-black contrast.
- Organisation branding uses the full Pivot Brands logo, `https://www.pivotbrands.com/`, and concise company details.
- Organisation and team avatars use the supplied square P mark.
- The production email sender display name becomes `Pivot Brands`; the verified Resend sender address remains unchanged.
- The Sales payment-authorization template is renamed cleanly, remains `EVERYONE`, and receives a useful default subject and message.
- The organisation's internal MEMBER group is attached to Sales with the MEMBER role. This grants current and future accepted organisation members access to Sales and its `EVERYONE` templates without manual assignment. Existing admin and manager mappings remain unchanged.
- Pending invitees remain pending until acceptance; acceptance is the security boundary for active membership.

## Deployment and verification

The implementation is built with Vercel's production environment, deployed as a preview first, verified through HTTP and runtime logs, then promoted to production. Verification covers the original signing token, organisation/team logo endpoints, avatar endpoint, sender configuration, template visibility, group inheritance, and a new recipient signing request to `rafcin.s@gmail.com`.

