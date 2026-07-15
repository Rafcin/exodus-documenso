import { type AppContext, createAppContext } from '../context';

/**
 * Get the full context passed to the loader.
 *
 * @returns The full app context.
 */
export const getOptionalLoaderContext = (request: Request): AppContext => {
  return createAppContext(request);
};
