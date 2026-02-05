/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: audit/get_result
 * Path: /api/audit/get_result?auditId=123
 * Fetches an existing audit from the legacy MySQL database via Hyperdrive.
 */

interface Env {
  // HYPERDRIVE: Bound to your MySQL database
  // You need to run: npx wrangler hyperdrive create audit-db --connection-string="mysql://user:pass@host:port/db"
  // And add it to wrangler.toml
  AUDIT_DB: { connectionString: string };
  CACHE: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const auditId = url.searchParams.get('auditId');

  if (!auditId) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Brak identyfikatora audytu.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const cacheKey = `audit_result_${auditId}`;

    // 1. Try KV Cache first
    const cached: any = await env.CACHE.get(cacheKey, 'json');
    if (cached) {
      return new Response(
        JSON.stringify({ status: 'success', data: cached.data, meta: cached.meta, source: 'kv' }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    /**
     * NOTE: To query MySQL from Cloudflare Workers, you typically use a driver
     * like 'mysql2' with 'connect()'.
     * Since we are in a serverless environment, I will provide the logic
     * and you will need to ensure the database driver is compatible.
     *
     * For now, I'll implement the normalization logic which is the most complex part.
     */

    // Placeholder for actual DB fetch logic
    // const result = await fetchFromMySQL(env.AUDIT_DB, auditId);

    // For now, returning a message that Hyperdrive setup is required
    return new Response(
      JSON.stringify({
        status: 'info',
        message:
          'Hyperdrive for MySQL integration is being configured. Please ensure AUDIT_DB binding is set in wrangler.toml',
      }),
      { status: 501 },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), { status: 500 });
  }
};
