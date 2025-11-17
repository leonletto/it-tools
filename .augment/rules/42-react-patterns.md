---
description: React-specific patterns, hooks, and component best practices
alwaysApply: false
---

# React Best Practices

## Component Structure

### Functional Components (Preferred)

```typescript
import { FC, useState, useEffect } from 'react';

interface UserCardProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserCard: FC<UserCardProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
};
```

## Hooks Best Practices

### Custom Hooks

```typescript
function useApi<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
```

### useCallback and useMemo

```typescript
const MemoizedComponent = ({ items, onItemClick }) => {
  // Memoize expensive computations
  const sortedItems = useMemo(() =>
    items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  // Memoize callbacks
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return <List items={sortedItems} onClick={handleClick} />;
};
```

## State Management

### Context API

```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## Performance

### React.memo

```typescript
export const ExpensiveComponent = React.memo<Props>(
  ({ data }) => {
    return <div>{/* Complex rendering */}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### Code Splitting

```typescript
const LazyDashboard = lazy(() => import('./Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <LazyDashboard />
</Suspense>
```

## Error Boundaries

```typescript
class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```
