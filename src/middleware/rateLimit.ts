import { NextRequest } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of rateLimits.entries()) {
            if (value.resetAt < now) {
                rateLimits.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

/**
 * Basic in-memory rate limiting.
 * Note: If using multiple server instances (Vercel, etc.), this will reset per instance.
 * For true global rate limiting, use Redis.
 */
export function rateLimit(
    request: NextRequest,
    limits: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetAt: number } {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const endpoint = request.nextUrl.pathname;
    const key = `${ip}:${endpoint}`;
    const now = Date.now();

    let entry = rateLimits.get(key);

    if (!entry || entry.resetAt < now) {
        entry = {
            count: 1,
            resetAt: now + limits.windowMs,
        };
        rateLimits.set(key, entry);

        return {
            allowed: true,
            remaining: limits.maxRequests - 1,
            resetAt: entry.resetAt,
        };
    }

    if (entry.count >= limits.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }

    entry.count++;

    return {
        allowed: true,
        remaining: limits.maxRequests - entry.count,
        resetAt: entry.resetAt,
    };
}
