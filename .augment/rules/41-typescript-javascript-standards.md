---
description:
  TypeScript and JavaScript coding standards, patterns, and best practices
alwaysApply: false
---

# TypeScript/JavaScript Coding Standards

## Environment & Setup

### Node.js Version Management

- Use project-specific Node version (`.nvmrc` or `.node-version`)
- Install dependencies: `npm install` or `yarn install`
- Use npm scripts for common tasks

### TypeScript Configuration

```json
// tsconfig.json - Recommended strict settings
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Code Style

### Naming Conventions

```typescript
// camelCase for variables and functions
const userName = "John";
function getUserById(id: string) {}

// PascalCase for classes, interfaces, types
class UserService {}
interface UserData {}
type UserRole = "admin" | "user";

// UPPER_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = process.env.API_URL;

// Prefix interfaces with 'I' (optional, team preference)
interface IUser {}

// Prefix private class members with underscore (optional)
class Service {
  private _cache: Map<string, any>;
}
```

### Type Annotations (Required in TypeScript)

```typescript
// ✅ GOOD - Explicit types
function processUser(user: User, options?: ProcessOptions): ProcessedUser {
  const result: ProcessedUser = {
    id: user.id,
    name: user.name,
    processedAt: new Date(),
  };
  return result;
}

// ✅ GOOD - Inferred types (when obvious)
const count = 5; // number inferred
const users = getUsers(); // type inferred from function return
```

## Imports Organization

```typescript
// 1. External libraries (third-party)
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 2. Absolute imports from project
import { User } from "@/types";
import { UserService } from "@/services";
import { useAuth } from "@/hooks";

// 3. Relative imports
import { Button } from "../components";
import { formatDate } from "./utils";

// 4. Style imports (last)
import styles from "./Component.module.css";
```

## Type Safety

### Use Strong Types

```typescript
// ❌ BAD - Weak typing
function updateUser(id: any, data: any): any {
  // ...
}

// ✅ GOOD - Strong typing
interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
}

function updateUser(id: string, data: UpdateUserData): Promise<User> {
  // ...
}
```

### Avoid `any` - Use Proper Types

```typescript
// ❌ BAD
let data: any;

// ✅ GOOD - unknown (safer than any)
let data: unknown;
if (typeof data === "string") {
  console.log(data.toUpperCase());
}

// ✅ GOOD - Generic types
function identity<T>(arg: T): T {
  return arg;
}

// ✅ GOOD - Union types
type Response = SuccessResponse | ErrorResponse;
```

### Type Guards

```typescript
interface Dog {
  type: "dog";
  bark(): void;
}

interface Cat {
  type: "cat";
  meow(): void;
}

type Animal = Dog | Cat;

// Type guard function
function isDog(animal: Animal): animal is Dog {
  return animal.type === "dog";
}

// Usage
function makeSound(animal: Animal) {
  if (isDog(animal)) {
    animal.bark(); // TypeScript knows it's a Dog
  } else {
    animal.meow(); // TypeScript knows it's a Cat
  }
}
```

## Error Handling

### Try-Catch with Typed Errors

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

async function processData(data: unknown): Promise<ProcessedData> {
  try {
    const validated = await validateData(data);
    return await processValidated(validated);
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error(`Validation failed for field: ${error.field}`);
      throw error;
    }

    if (error instanceof Error) {
      logger.error(`Processing failed: ${error.message}`);
      throw new Error("Data processing failed");
    }

    // Unknown error type
    logger.error("Unknown error:", error);
    throw new Error("An unexpected error occurred");
  }
}
```

### Result Type Pattern (Alternative to Exceptions)

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return {
      success: false,
      error: new Error("Division by zero"),
    };
  }
  return { success: true, value: a / b };
}

// Usage
const result = divide(10, 2);
if (result.success) {
  console.log(result.value); // Type-safe access
} else {
  console.error(result.error);
}
```

## Async/Await

### Prefer Async/Await over Promises

```typescript
// ✅ GOOD - Readable async/await
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Failed to fetch user:", error);
    throw error;
  }
}

// ❌ LESS READABLE - Promise chains
function fetchUserData(userId: string): Promise<User> {
  return fetch(`/api/users/${userId}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .catch((error) => {
      logger.error("Failed to fetch user:", error);
      throw error;
    });
}
```

### Parallel Async Operations

```typescript
// ✅ GOOD - Parallel execution
async function loadDashboard() {
  const [user, posts, stats] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchStats(),
  ]);

  return { user, posts, stats };
}

// ❌ SLOWER - Sequential execution
async function loadDashboard() {
  const user = await fetchUser();
  const posts = await fetchPosts();
  const stats = await fetchStats();

  return { user, posts, stats };
}
```

## Functional Programming Patterns

### Immutability

```typescript
// ✅ GOOD - Immutable operations
const addUser = (users: User[], newUser: User): User[] => {
  return [...users, newUser];
};

const updateUser = (
  users: User[],
  id: string,
  updates: Partial<User>,
): User[] => {
  return users.map((user) => (user.id === id ? { ...user, ...updates } : user));
};

// ❌ BAD - Mutation
const addUser = (users: User[], newUser: User): User[] => {
  users.push(newUser);
  return users;
};
```

### Array Methods over Loops

```typescript
// ✅ GOOD - Declarative
const activeUsers = users
  .filter((user) => user.isActive)
  .map((user) => ({
    id: user.id,
    displayName: `${user.firstName} ${user.lastName}`,
  }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

// ❌ IMPERATIVE - Harder to read
const activeUsers = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push({
      id: users[i].id,
      displayName: `${users[i].firstName} ${users[i].lastName}`,
    });
  }
}
activeUsers.sort((a, b) => a.displayName.localeCompare(b.displayName));
```

## React-Specific Patterns (TypeScript)

### Functional Components with TypeScript

```typescript
import React, { FC, useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setLoading(true);
        const data = await fetchUser(userId);
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

### Custom Hooks

```typescript
import { useState, useEffect } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions<T> = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();

        if (!cancelled) {
          setData(result);
          options.onSuccess?.(result);
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error("Unknown error");
          setError(error);
          options.onError?.(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

// Usage
const {
  data: user,
  loading,
  error,
} = useApi(() => fetchUser(userId), [userId], {
  onSuccess: (user) => console.log("User loaded:", user),
  onError: (err) => console.error("Failed to load user:", err),
});
```

## Testing

### Jest with TypeScript

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserService } from "../UserService";
import { User } from "@/types";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    userService = new UserService(mockRepository);
  });

  describe("getUser", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };
      mockRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUser("1");

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should throw error when user not found", async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUser("999")).rejects.toThrow(
        "User not found",
      );
    });
  });
});
```

## Performance Optimization

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }: { items: Item[] }) {
  // Memoize expensive computations
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Memoize callback functions
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Security

### Input Sanitization

```typescript
import DOMPurify from "dompurify";

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong"],
    ALLOWED_ATTR: [],
  });
}

// Validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Environment Variables

```typescript
// ✅ GOOD - Type-safe environment variables
interface Env {
  API_URL: string;
  API_KEY: string;
  NODE_ENV: "development" | "production" | "test";
}

function getEnv(): Env {
  const env = {
    API_URL: process.env.API_URL,
    API_KEY: process.env.API_KEY,
    NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
  };

  // Validate required variables
  if (!env.API_URL || !env.API_KEY) {
    throw new Error("Missing required environment variables");
  }

  return env as Env;
}

export const config = getEnv();
```
