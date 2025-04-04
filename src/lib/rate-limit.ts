import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  prefix?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private redis: Redis;
  public config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    try {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        retry: {
          retries: 3,
          backoff: (retryCount) => Math.min(retryCount * 50, 1000),
        },
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      // Initialize with default config but mark as non-functional
      this.redis = null as any;
    }
    this.config = {
      prefix: 'rate-limit:',
      ...config,
    };
  }

  private getKey(identifier: string): string {
    return `${this.config.prefix}${identifier}`;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // If Redis is not initialized, allow the request
      if (!this.redis) {
        console.warn('Redis client not initialized, bypassing rate limit check');
        return {
          success: true,
          remaining: this.config.maxRequests,
          resetTime: now + this.config.windowMs,
        };
      }

      // Get all timestamps within the window
      const timestamps = await this.redis.lrange(key, 0, -1);
      const validTimestamps = timestamps
        .map(Number)
        .filter(timestamp => timestamp > windowStart);

      // Remove old timestamps
      if (validTimestamps.length < timestamps.length) {
        await this.redis.ltrim(key, validTimestamps.length, -1);
      }

      // Check if we're over the limit
      if (validTimestamps.length >= this.config.maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetTime: validTimestamps[0] + this.config.windowMs,
        };
      }

      // Add new timestamp
      await this.redis.rpush(key, now.toString());
      await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));

      return {
        success: true,
        remaining: this.config.maxRequests - (validTimestamps.length + 1),
        resetTime: now + this.config.windowMs,
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // In case of Redis failure, allow the request but with a warning
      console.warn('Rate limiting bypassed due to Redis error');
      return {
        success: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }

  async cleanup(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.config.prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis cleanup error:', error);
    }
  }
}

// Create rate limiter instances for different endpoints
export const contactFormLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'contact-form:',
});

export const authLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  prefix: 'auth:',
});

export const apiLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  prefix: 'api:',
});

export function withRateLimit(
  limiter: RateLimiter,
  identifier: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const result = await limiter.check(identifier);

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

// Cleanup function to be called periodically
export async function cleanupRateLimits() {
  await Promise.all([
    contactFormLimiter.cleanup(),
    authLimiter.cleanup(),
    apiLimiter.cleanup(),
  ]);
}
