---
description:
  Apply when optimizing application performance, addressing performance
  bottlenecks, or implementing caching strategies
alwaysApply: false
---

# Performance Optimization Strategies

## When to Apply

Use these guidelines when:

- Profiling reveals performance bottlenecks
- User reports slow response times
- Database queries are slow (N+1 problems)
- Memory usage is excessive
- Build times are too long
- Frontend rendering is sluggish

## Database Optimization

### Query Optimization

#### N+1 Query Problem

```python
# ❌ BAD - N+1 queries (1 query + N queries for each user)
users = User.query.all()
for user in users:
    print(user.posts)  # Triggers separate query for each user

# ✅ GOOD - Single query with join
users = User.query.options(joinedload(User.posts)).all()
for user in users:
    print(user.posts)  # No additional queries
```

```typescript
// ❌ BAD - Multiple database calls
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ where: { userId: user.id } });
}

// ✅ GOOD - Single query with include
const users = await User.findAll({
  include: [{ model: Post }],
});
```

#### Add Indexes

```sql
-- Identify slow queries first
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Add appropriate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
```

#### Use Pagination

```typescript
// ✅ GOOD - Cursor-based pagination
interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

async function getPosts(options: PaginationOptions) {
  const limit = options.limit || 20;

  const query = Post.query().limit(limit).orderBy("created_at", "desc");

  if (options.cursor) {
    query.where("id", "<", options.cursor);
  }

  const posts = await query;

  return {
    data: posts,
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
  };
}
```

### Connection Pooling

```python
# Python SQLAlchemy
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,        # Number of connections to maintain
    max_overflow=10,     # Additional connections when pool is full
    pool_timeout=30,     # Seconds to wait for connection
    pool_recycle=3600    # Recycle connections after 1 hour
)
```

```typescript
// Node.js pg-pool
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  database: "mydb",
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Caching Strategies

### Multi-Layer Caching

#### Application-Level Cache

```typescript
import NodeCache from "node-cache";

// In-memory cache with TTL
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60s
});

async function getUserWithCache(userId: string): Promise<User> {
  const cacheKey = `user:${userId}`;

  // Check cache first
  const cached = cache.get<User>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const user = await User.findById(userId);

  // Store in cache
  cache.set(cacheKey, user, 300);

  return user;
}
```

#### Redis Cache

```python
import redis
import json
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cached(ttl: int = 300):
    """Decorator for caching function results in Redis."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{func.__name__}:{json.dumps(args)}:{json.dumps(kwargs)}"

            # Check cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)

            # Execute function
            result = func(*args, **kwargs)

            # Store in cache
            redis_client.setex(cache_key, ttl, json.dumps(result))

            return result
        return wrapper
    return decorator

@cached(ttl=600)
def get_user_profile(user_id: int):
    return User.query.get(user_id).to_dict()
```

### Cache Invalidation

```typescript
class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache();
  }

  async getUser(id: string): Promise<User> {
    const key = `user:${id}`;

    const cached = this.cache.get<User>(key);
    if (cached) return cached;

    const user = await User.findById(id);
    this.cache.set(key, user, 300);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await User.update(id, data);

    // Invalidate cache
    this.cache.del(`user:${id}`);

    // Also invalidate related caches
    this.cache.del(`user:${id}:posts`);
    this.cache.del(`user:${id}:stats`);

    return user;
  }
}
```

## Frontend Performance

### Code Splitting

```typescript
// React lazy loading
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Debounce and Throttle

```typescript
// Debounce - Wait until user stops typing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Usage in search
const searchUsers = debounce(async (query: string) => {
  const results = await api.searchUsers(query);
  setSearchResults(results);
}, 300);

// Throttle - Execute at most once per interval
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage for scroll event
const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 100);
```

### Virtual Scrolling for Large Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated item height
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

```typescript
// Next.js Image component (automatic optimization)
import Image from 'next/image';

function Profile({ user }: { user: User }) {
  return (
    <Image
      src={user.avatar}
      alt={user.name}
      width={200}
      height={200}
      loading="lazy"
      placeholder="blur"
    />
  );
}

// Manual lazy loading
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}
      alt={alt}
    />
  );
}
```

## Memory Optimization

### Avoid Memory Leaks

#### Clean Up Event Listeners

```typescript
useEffect(() => {
  const handleResize = () => {
    console.log("Window resized");
  };

  window.addEventListener("resize", handleResize);

  // Clean up
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

#### Cancel Async Operations

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch("/api/data", {
        signal: controller.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Fetch failed:", error);
      }
    }
  }

  fetchData();

  // Cancel fetch if component unmounts
  return () => {
    controller.abort();
  };
}, []);
```

### Efficient Data Structures

```python
# Use generators for large datasets
def process_large_file(filename: str):
    """Process file line by line without loading all into memory."""
    with open(filename, 'r') as f:
        for line in f:
            yield process_line(line)

# Use sets for lookups (O(1) vs O(n) for lists)
# ❌ BAD - O(n) lookup
allowed_ids = [1, 2, 3, 4, 5]
if user_id in allowed_ids:  # Linear search
    grant_access()

# ✅ GOOD - O(1) lookup
allowed_ids = {1, 2, 3, 4, 5}
if user_id in allowed_ids:  # Hash lookup
    grant_access()
```

## Profiling and Monitoring

### Python Profiling

```python
import cProfile
import pstats

def profile_function():
    profiler = cProfile.Profile()
    profiler.enable()

    # Your code here
    result = expensive_operation()

    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(10)  # Top 10 functions

    return result
```

### Node.js Profiling

```typescript
// Using clinic.js
// npm install -g clinic
// clinic doctor -- node app.js

// Manual timing
console.time("database-query");
const users = await User.findAll();
console.timeEnd("database-query");

// Performance monitoring
import { performance } from "perf_hooks";

async function monitorPerformance<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    logger.info(`${name} took ${duration.toFixed(2)}ms`);

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
```

## Best Practices Checklist

- [ ] Add database indexes for frequently queried columns
- [ ] Implement caching for expensive operations
- [ ] Use connection pooling for database connections
- [ ] Implement pagination for large datasets
- [ ] Use code splitting for large frontend applications
- [ ] Optimize images (compression, lazy loading, responsive images)
- [ ] Debounce/throttle frequent operations (search, scroll)
- [ ] Clean up event listeners and async operations
- [ ] Use efficient data structures (sets, maps vs arrays)
- [ ] Profile code to identify actual bottlenecks
- [ ] Monitor production performance metrics
- [ ] Implement proper error handling (don't swallow errors)
