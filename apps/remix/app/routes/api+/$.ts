import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

/**
 * Keep the full Hono API server in a dedicated Vercel function bundle. Without
 * a route-specific function config, the Vercel React Router preset groups this
 * catch-all with every UI route and makes simple page loads import the entire
 * API, email, PDF, and jobs stack during cold starts.
 */
export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

async function handleApiRequest(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    const { default: authServer } = await import('../../../server/auth-router');

    return authServer.fetch(request);
  }

  const { default: server } = await import('../../../server/router');

  return server.fetch(request);
}

/**
 * Vercel's React Router adapter owns the server entry point, so requests for
 * the Hono APIs need to be forwarded explicitly. More-specific React Router
 * API routes (for example, /api/health) continue to take precedence over this
 * catch-all route.
 */
export function loader({ request }: LoaderFunctionArgs) {
  return handleApiRequest(request);
}

export function action({ request }: ActionFunctionArgs) {
  return handleApiRequest(request);
}
