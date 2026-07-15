import { remixRoutesOptionAdapter } from '@react-router/remix-routes-option-adapter';
import { defaultVisitFiles, flatRoutes, type VisitFilesFunction } from 'remix-flat-routes';

const visitRouteFiles: VisitFilesFunction = (dir, visitor, baseDir = dir) => {
  const routeFiles: string[] = [];

  defaultVisitFiles(dir, (file) => routeFiles.push(file), baseDir);

  routeFiles
    .sort((left, right) => {
      const leftIsSplat = /(^|[/\\])\$\.[^/\\]+$/.test(left);
      const rightIsSplat = /(^|[/\\])\$\.[^/\\]+$/.test(right);

      if (leftIsSplat !== rightIsSplat) {
        return leftIsSplat ? 1 : -1;
      }

      return left.localeCompare(right);
    })
    .forEach(visitor);
};

export default remixRoutesOptionAdapter((defineRoutes) => {
  return flatRoutes('routes', defineRoutes, {
    ignoredRouteFiles: ['**/.*'], // Ignore dot files (like .DS_Store)
    visitFiles: visitRouteFiles,
    //appDir: 'app',
    //routeDir: 'routes',
    //basePath: '/',
    //paramPrefixChar: '$',
    //routeRegex: /(([+][\/\\][^\/\\:?*]+)|[\/\\]((index|route|layout|page)|(_[^\/\\:?*]+)|([^\/\\:?*]+\.route)))\.(ts|tsx|js|jsx|md|mdx)$$/,
  });
});
