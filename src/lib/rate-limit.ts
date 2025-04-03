import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;
  public config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.requests = new Map();
    this.config = config;
  }

  private cleanup() {
    const now = Date.now();
    Array.from(this.requests.entries()).forEach(([key, value]) => {
      if (value.resetTime <= now) {
        this.requests.delete(key);
      }
    });
  }

  check(key: string): RateLimitResult {
    this.cleanup();
    const now = Date.now();
    const request = this.requests.get(key);

    if (!request) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (request.resetTime <= now) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (request.count >= this.config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: request.resetTime,
      };
    }

    request.count++;
    return {
      success: true,
      remaining: this.config.maxRequests - request.count,
      resetTime: request.resetTime,
    };
  }
}

// Create rate limiter instances for different endpoints
export const contactFormLimiter = new RateLimiter({
  maxRequests: 5, // 5 requests
  windowMs: 60 * 60 * 1000, // 1 hour
});

export const authLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const apiLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 60 * 1000, // 1 hour
});

export function withRateLimit(
  limiter: RateLimiter,
  identifier: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const result = limiter.check(identifier);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    const response = await handler(req);

    // Add rate limit headers to the response
    response.headers.set('X-RateLimit-Limit', limiter.config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  };
}
