import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis for rate limiting
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const rateLimiter = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit/cardsavvy",
    })
    : null;

export async function middleware(request: NextRequest) {
    const isDev = process.env.NODE_ENV === "development";

    // BFSI-grade CSP:
    // - In dev: allow 'unsafe-eval' and 'unsafe-inline' for webpack HMR
    // - In production: strict nonce-based policy for maximum security
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const devCSP = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://relaxing-kid-60624.upstash.io;
      object-src 'none';
      base-uri 'self';
      frame-ancestors 'none';
    `;

    const prodCSP = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://relaxing-kid-60624.upstash.io;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `;

    const cspValue = (isDev ? devCSP : prodCSP).replace(/\s{2,}/g, " ").trim();

    // Rate limiting on compute APIs
    if (request.nextUrl.pathname.startsWith("/api/recommend")) {
        if (redis && rateLimiter) {
            const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
            if (ip !== "::1" && ip !== "127.0.0.1") {
                const { success, limit, reset, remaining } = await rateLimiter.limit(ip);
                if (!success) {
                    return new NextResponse("Too Many Requests", {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        },
                    });
                }
            }
        }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspValue);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    response.headers.set("Content-Security-Policy", cspValue);
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
