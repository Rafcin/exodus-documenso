import { auth } from '@documenso/auth/server';
import { Hono } from 'hono';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

const authServer = new Hono().route('/api/auth', auth);

/**
 * Keep authentication isolated from the much larger general API bundle so a
 * cold start cannot prevent users from signing up, signing in, or restoring a
 * session.
 */
export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export function loader({ request }: LoaderFunctionArgs) {
  return authServer.fetch(request);
}

export function action({ request }: ActionFunctionArgs) {
  return authServer.fetch(request);
}
