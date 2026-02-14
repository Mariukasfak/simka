import { isBuiltin } from 'node:module';
import { dirname } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const baseURL = pathToFileURL(cwd() + '/').href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server') {
    // Next.js exports are complex, sometimes needing specific file resolution
    try {
      return await nextResolve('next/server.js', context);
    } catch {
      // If direct resolution fails, fall back to default
      return nextResolve(specifier, context);
    }
  }
  if (specifier === 'next/headers') {
    try {
      return await nextResolve('next/headers.js', context);
    } catch {
      return nextResolve(specifier, context);
    }
  }

  // Handle relative imports that might be missing extensions for test environment
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
        return await nextResolve(specifier, context);
    } catch (error) {
        if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
            try {
                return await nextResolve(specifier + '.ts', context);
            } catch (e) {
                  try {
                    return await nextResolve(specifier + '.tsx', context);
                  } catch (e2) {}
            }
        }
        throw error;
    }
}

  return nextResolve(specifier, context);
}
