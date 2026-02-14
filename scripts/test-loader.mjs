
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server') {
    // If the specifier is 'next/server', append '.js' to try to resolve the file directly
    // This assumes the file exists at next/server.js relative to package root or module resolution rules
    // But next/server is inside node_modules/next.
    // Standard resolution for next/server.js should work if specifier is 'next/server.js'.
    return nextResolve(specifier + '.js', context);
  }
  return nextResolve(specifier, context);
}
