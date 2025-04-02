interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  private constructor(ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = ttl;
  }

  public static getInstance(ttl?: number): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache(ttl);
    }
    return Cache.instance;
  }

  public set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const cache = Cache.getInstance();

// Example usage:
// const data = await cache.get('projects');
// if (!data) {
//   const newData = await fetchProjects();
//   cache.set('projects', newData, 60 * 60 * 1000); // 1 hour
//   return newData;
// }
// return data; 