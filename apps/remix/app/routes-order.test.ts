import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

type RouteEntry = {
  path?: string;
  children?: RouteEntry[];
};

const flattenRoutes = (routes: RouteEntry[]): RouteEntry[] => {
  return routes.flatMap((route) => [route, ...flattenRoutes(route.children ?? [])]);
};

test('registers concrete API routes before the Hono API splat', async () => {
  process.chdir(fileURLToPath(new URL('..', import.meta.url)));

  const { default: routeConfig } = await import('./routes');
  const routes = flattenRoutes(await routeConfig);
  const apiPaths = routes
    .map((route) => route.path)
    .filter((path): path is string => typeof path === 'string' && path.startsWith('api'));

  const splatIndex = apiPaths.indexOf('api/*');

  assert.notEqual(splatIndex, -1, 'expected the Hono /api/* route to exist');

  for (const concretePath of [
    'api/avatar/:id',
    'api/branding/logo/organisation/:orgId',
    'api/branding/logo/team/:teamId',
  ]) {
    const concreteIndex = apiPaths.indexOf(concretePath);

    assert.notEqual(concreteIndex, -1, `expected ${concretePath} to exist`);
    assert.ok(
      concreteIndex < splatIndex,
      `expected ${concretePath} to be registered before api/*, got ${apiPaths.join(', ')}`,
    );
  }
});
