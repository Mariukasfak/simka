
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server' ||
      specifier === 'next/headers' ||
      specifier === '@supabase/auth-helpers-nextjs' ||
      specifier === 'nodemailer' ||
      specifier === 'zod') {
    return {
      shortCircuit: true,
      url: `mock:${specifier}`,
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('mock:')) {
    const specifier = url.slice(5); // remove 'mock:'

    if (specifier === 'next/server') {
        return {
            format: 'module',
            shortCircuit: true,
            source: `
                export class NextResponse {
                    static json(body, init) {
                        return { body, init, status: init?.status || 200, success: body.success };
                    }
                }
            `,
        };
    }

    if (specifier === 'next/headers') {
        return {
            format: 'module',
            shortCircuit: true,
            source: `
                export function cookies() {
                    return { getAll: () => [] };
                }
            `,
        };
    }

    if (specifier === '@supabase/auth-helpers-nextjs') {
        return {
            format: 'module',
            shortCircuit: true,
            source: `
                export function createRouteHandlerClient() {
                    return {
                        auth: {
                            getSession: async () => ({ data: { session: { user: { id: 'test-user' } } } }),
                        },
                        from: () => ({
                            insert: async () => {
                                if (globalThis.__MOCK_DB_THROW__) {
                                    throw new Error('Database exception');
                                }
                                if (globalThis.__MOCK_DB_ERROR__) {
                                    return { error: new Error('Database error') };
                                }
                                return { error: null };
                            }
                        })
                    };
                }
            `,
        };
    }

    if (specifier === 'nodemailer') {
        return {
            format: 'module',
            shortCircuit: true,
            source: `
                export default {
                    createTransport: () => ({
                        sendMail: async (opts) => {
                            if (globalThis.__MOCK_EMAIL_CALLBACK__) {
                                globalThis.__MOCK_EMAIL_CALLBACK__(opts);
                            }
                            return {};
                        }
                    })
                };
            `,
        };
    }

    if (specifier === 'zod') {
        return {
            format: 'module',
            shortCircuit: true,
            source: `
                const schemaMock = {
                    min: () => schemaMock,
                    max: () => schemaMock,
                    email: () => schemaMock,
                    optional: () => schemaMock,
                    parse: (data) => data,
                };

                export const z = {
                    object: (shape) => schemaMock,
                    string: () => schemaMock,
                    number: () => schemaMock,
                    ZodError: class ZodError extends Error {},
                };
            `,
        };
    }
  }
  return nextLoad(url, context, nextLoad);
}
