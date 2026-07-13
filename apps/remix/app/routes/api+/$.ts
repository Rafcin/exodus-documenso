import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

import server from '../../../server/router';

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
