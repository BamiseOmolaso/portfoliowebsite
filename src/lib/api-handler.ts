import { NextRequest, NextResponse } from 'next/server';
import { apiLimiter, withRateLimit } from './rate-limit';
import { isIPBlacklisted } from './security';

interface HandlerConfig {
  requireAuth?: boolean;
  methods?: string[];
  rateLimit?: boolean;
}

export function createApiHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: HandlerConfig = {}
) {
  return async (req: NextRequest) => {
    try {
      // Check allowed methods
      if (config.methods && !config.methods.includes(req.method)) {
        return new NextResponse(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405 }
        );
      }

      // Check IP blacklist
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      if (await isIPBlacklisted(ip)) {
        return new NextResponse(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403 }
        );
      }

      // Apply rate limiting if enabled
      if (config.rateLimit !== false) {
        const identifier = `${ip}:${req.nextUrl.pathname}`;
        return withRateLimit(apiLimiter, identifier, async (req) => {
          return await handler(req);
        })(req);
      }

      return await handler(req);
    } catch (error) {
      console.error('API error:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        { status: 500 }
      );
    }
  };
}

// Example usage:
/*
export const GET = createApiHandler(
  async (req) => {
    // Your handler logic here
    return NextResponse.json({ data: 'success' });
  },
  {
    methods: ['GET'],
    requireAuth: true,
    rateLimit: true,
  }
);
*/ 