import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

import server from '../../../server/router';

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

/**
 * Vercel's React Router adapter owns the server entry point, so requests for
 * the Hono APIs need to be forwarded explicitly. More-specific React Router
 * API routes (for example, /api/health) continue to take precedence over this
 * catch-all route.
 */
export function loader({ request }: LoaderFunctionArgs) {
  return server.fetch(request);
}

export function action({ request }: ActionFunctionArgs) {
  return server.fetch(request);
}
