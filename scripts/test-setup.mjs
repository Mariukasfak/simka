import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register the custom loader
register('./test-loader.mjs', import.meta.url);
