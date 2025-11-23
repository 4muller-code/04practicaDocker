// Redis Utility for Caching and Session Management
// Based on implementation guidelines

import Redis from 'ioredis';

class RedisClient {
  private client: Redis | null = null;

  constructor() {
    // In production, this would connect to the actual Redis instance
    // For development, we'll use a mock implementation
    if (process.env.NODE_ENV === 'production') {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      this.client.on('connect', () => {
        console.log('✅ Connected to Redis');
      });
    }
  }

  // Cache operations
  async setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.client) {
      // Mock implementation for development
      console.log(`[Redis Mock] SET ${key} with TTL ${ttlSeconds}s`);
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serializedValue);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    if (!this.client) {
      // Mock implementation for development
      console.log(`[Redis Mock] GET ${key}`);
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.client) {
      // Mock implementation for development
      console.log(`[Redis Mock] DEL ${key}`);
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting cache:', error);
    }
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `session:${sessionId}`;
    await this.setCache(key, sessionData, ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return this.getCache<T>(key);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.deleteCache(key);
  }

  // Ticket availability caching
  async cacheTicketAvailability(date: string, ticketTypeId: string, availability: any): Promise<void> {
    const key = `availability:${date}:${ticketTypeId}`;
    // Cache for 5 minutes
    await this.setCache(key, availability, 300);
  }

  async getCachedTicketAvailability(date: string, ticketTypeId: string): Promise<any | null> {
    const key = `availability:${date}:${ticketTypeId}`;
    return this.getCache(key);
  }

  // API rate limiting
  async checkRateLimit(identifier: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    if (!this.client) {
      // Mock implementation - always allow in development
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowSeconds * 1000 };
    }

    const key = `rate_limit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % windowSeconds);

    try {
      const pipeline = this.client.pipeline();

      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart - 1);

      // Add current request
      pipeline.zadd(key, now, `${now}:${Math.random()}`);

      // Set expiration
      pipeline.expire(key, windowSeconds * 2);

      // Get count
      pipeline.zcard(key);

      const results = await pipeline.exec();

      if (!results) {
        throw new Error('Redis pipeline execution failed');
      }

      const requestCount = results[3][1] as number;
      const remaining = Math.max(0, limit - requestCount);

      return {
        allowed: requestCount <= limit,
        remaining,
        resetTime: windowStart + windowSeconds
      };

    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Fail open - allow the request
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowSeconds * 1000 };
    }
  }

  // Token storage for API authentication
  async storeToken(token: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    const key = `token:${token}`;
    await this.setCache(key, data, ttlSeconds);
  }

  async getTokenData<T>(token: string): Promise<T | null> {
    const key = `token:${token}`;
    return this.getCache<T>(key);
  }

  async deleteToken(token: string): Promise<void> {
    const key = `token:${token}`;
    await this.deleteCache(key);
  }

  // Queue processing status
  async setProcessingStatus(jobId: string, status: any): Promise<void> {
    const key = `processing:${jobId}`;
    await this.setCache(key, status, 3600); // 1 hour TTL
  }

  async getProcessingStatus<T>(jobId: string): Promise<T | null> {
    const key = `processing:${jobId}`;
    return this.getCache<T>(key);
  }

  // Close connection
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}

// Create a singleton instance
export const redisClient = new RedisClient();

// Utility functions for common operations
export const cache = {
  // Ticket operations
  async cacheTicketData(ticketId: string, data: any): Promise<void> {
    await redisClient.setCache(`ticket:${ticketId}`, data, 1800); // 30 minutes
  },

  async getCachedTicketData<T>(ticketId: string): Promise<T | null> {
    return redisClient.getCache<T>(`ticket:${ticketId}`);
  },

  // Wholesaler operations
  async cacheWholesalerData(wholesalerId: string, data: any): Promise<void> {
    await redisClient.setCache(`wholesaler:${wholesalerId}`, data, 3600); // 1 hour
  },

  async getCachedWholesalerData<T>(wholesalerId: string): Promise<T | null> {
    return redisClient.getCache<T>(`wholesaler:${wholesalerId}`);
  },

  // Clear all cache for a specific pattern
  async clearPattern(pattern: string): Promise<void> {
    if (redisClient['client']) {
      const keys = await redisClient['client'].keys(pattern);
      if (keys.length > 0) {
        await redisClient['client'].del(...keys);
      }
    }
  }
};