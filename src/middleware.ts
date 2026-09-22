import { defineMiddleware } from "astro:middleware";
import redirects from "./data/redirects.json";

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const admin = /^\/(?:keystatic|api\/keystatic)(?:\/|$)/.test(path);
  // Local mode is only available to the development server. Never expose an
  // unauthenticated filesystem editor when production credentials are missing.
  if (
    admin &&
    import.meta.env.PROD &&
    (!import.meta.env.PUBLIC_GITHUB_REPO ||
      !import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ||
      !process.env.KEYSTATIC_GITHUB_CLIENT_ID ||
      !process.env.KEYSTATIC_GITHUB_CLIENT_SECRET ||
      !process.env.KEYSTATIC_SECRET)
  ) {
    return new Response(
      "The webmaster interface is awaiting GitHub configuration. Contact the site administrator.",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "no-store",
        },
      },
    );
  }
  const key =
    path.endsWith("/") || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;
  const target = (redirects as Record<string, string>)[key];
  if (target) return context.redirect(target, 301);
  if (
    !admin &&
    path !== "/" &&
    !path.endsWith("/") &&
    !/\.[a-z0-9]+$/i.test(path) &&
    !path.startsWith("/_")
  ) {
    return context.redirect(`${path}/${context.url.search}`, 301);
  }
  const response = await next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  if (admin) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
  }
  // Compress public HTML when running the standalone Node server, including
  // its inline map and styles. Leave editor, API and already encoded responses alone.
  if (
    import.meta.env.PROD &&
    !admin &&
    response.ok &&
    response.body &&
    response.headers.get("Content-Type")?.includes("text/html") &&
    !response.headers.has("Content-Encoding")
  ) {
    response.headers.append("Vary", "Accept-Encoding");
    const acceptsGzip = (context.request.headers.get("Accept-Encoding") || "")
      .split(",")
      .some((entry) => {
        const [encoding, ...parameters] = entry.trim().split(";");
        const quality = parameters.find((value) =>
          value.trim().startsWith("q="),
        );
        return (
          encoding.toLowerCase() === "gzip" &&
          (!quality || Number(quality.trim().slice(2)) > 0)
        );
      });
    if (acceptsGzip) {
      response.headers.set("Content-Encoding", "gzip");
      response.headers.delete("Content-Length");
      response.headers.delete("ETag");
      return new Response(
        response.body.pipeThrough(new CompressionStream("gzip")),
        {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        },
      );
    }
  }
  return response;
});
