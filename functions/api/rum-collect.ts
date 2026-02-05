/**
 * Cloudflare Pages Function: rum-collect
 * Path: /api/rum-collect
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data: any = await request.json();
    const { name, value, url } = data;

    if (!name || value === undefined) {
      return new Response('Missing data', { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const isMobile = /android|iphone|ipad/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    
    const parsedUrl = new URL(url || request.url);
    const path = parsedUrl.pathname;

    // Use waitUntil to avoid blocking the response
    context.waitUntil(
      env.DB.prepare(`
        INSERT INTO performance_metrics (metric_name, metric_value, page_url, user_agent, device_type)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        name.substring(0, 10),
        parseFloat(value),
        path.substring(0, 255),
        userAgent.substring(0, 255),
        deviceType
      ).run()
    );

    return new Response(null, { status: 201 });

  } catch (err) {
    // Fail silently for RUM
    return new Response(null, { status: 200 });
  }
};
