---
description:
  Apply when implementing authentication, handling user input, storing sensitive
  data, or addressing security vulnerabilities
alwaysApply: false
---

# Security Best Practices

## When to Apply

Use these guidelines when:

- Implementing authentication or authorization
- Handling user input
- Storing or transmitting sensitive data
- Working with external APIs
- Deploying to production
- Addressing security audit findings

## Authentication & Authorization

### Password Security

#### Never Store Plain Text Passwords

```python
# ✅ GOOD - Hash passwords with bcrypt
import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
```

```typescript
// ✅ GOOD - Hash passwords with bcrypt
import bcrypt from "bcrypt";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### JWT Token Management

```typescript
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "15m"; // Short-lived access tokens
const REFRESH_TOKEN_EXPIRY = "7d";

function generateAccessToken(payload: TokenPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: "your-app",
    audience: "your-app-users",
  });
}

function generateRefreshToken(userId: string): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");

  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

function verifyToken(token: string): TokenPayload {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Store refresh tokens securely (database with user association)
async function storeRefreshToken(userId: string, token: string): Promise<void> {
  await RefreshToken.create({
    userId,
    token: await hashToken(token), // Hash refresh tokens in database
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}
```

### Secure Session Management

```typescript
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    name: "sessionId", // Don't use default 'connect.sid'
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true, // Not accessible via JavaScript
      maxAge: 3600000, // 1 hour
      sameSite: "strict", // CSRF protection
    },
  }),
);
```

## Input Validation & Sanitization

### SQL Injection Prevention

```python
# ✅ GOOD - Parameterized queries
import psycopg2

def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Parameterized query prevents SQL injection
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )

    return cursor.fetchone()

# ❌ BAD - String formatting (vulnerable to SQL injection)
def get_user_by_email_unsafe(email: str):
    cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

```typescript
// ✅ GOOD - Using ORM or parameterized queries
import { query } from "./database";

async function getUserByEmail(email: string) {
  // Parameterized query
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);

  return result.rows[0];
}

// ✅ GOOD - Using ORM (Sequelize, TypeORM, etc.)
const user = await User.findOne({ where: { email } });
```

### XSS Prevention

```typescript
import DOMPurify from 'dompurify';
import { escape } from 'html-escaper';

// Sanitize HTML content
function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false
  });
}

// Escape user input for display
function escapeHtml(unsafe: string): string {
  return escape(unsafe);
}

// React automatically escapes content, but be careful with dangerouslySetInnerHTML
function SafeContent({ html }: { html: string }) {
  // ✅ GOOD - Sanitized before rendering
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(html)
      }}
    />
  );
}
```

### Input Validation with Zod (TypeScript)

```typescript
import { z } from "zod";

// Define validation schema
const UserRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
  name: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  age: z
    .number()
    .int("Age must be an integer")
    .min(18, "Must be at least 18 years old")
    .max(120, "Invalid age"),
});

type UserRegistration = z.infer<typeof UserRegistrationSchema>;

async function registerUser(data: unknown): Promise<User> {
  // Validate input
  const validated = UserRegistrationSchema.parse(data);

  // Now 'validated' is type-safe and sanitized
  return await createUser(validated);
}

// With error handling
async function registerUserSafe(
  data: unknown,
): Promise<Result<User, ValidationError>> {
  const result = UserRegistrationSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: new ValidationError(result.error.errors),
    };
  }

  const user = await createUser(result.data);
  return { success: true, value: user };
}
```

### Python Input Validation

```python
from pydantic import BaseModel, EmailStr, validator, constr
from typing import Optional

class UserRegistration(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=128)
    name: constr(min_length=2, max_length=100)
    age: int

    @validator('password')
    def validate_password_strength(cls, v):
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain lowercase letter')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain number')
        if not any(char in '!@#$%^&*()_+-=' for char in v):
            raise ValueError('Password must contain special character')
        return v

    @validator('age')
    def validate_age(cls, v):
        if v < 18:
            raise ValueError('Must be at least 18 years old')
        if v > 120:
            raise ValueError('Invalid age')
        return v

def register_user(data: dict):
    # Validate and parse input
    validated = UserRegistration(**data)

    # Now 'validated' is type-safe and sanitized
    return create_user(validated.dict())
```

## Secrets Management

### Environment Variables

```typescript
// ✅ GOOD - Load from environment
import dotenv from "dotenv";

dotenv.config();

interface Config {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  api: {
    key: string;
  };
}

function loadConfig(): Config {
  const requiredEnvVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "API_KEY",
  ];

  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    database: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    },
    api: {
      key: process.env.API_KEY!,
    },
  };
}

export const config = loadConfig();

// ❌ BAD - Hardcoded secrets
// const config = {
//   database: {
//     password: 'my-secret-password-123'  // NEVER DO THIS
//   }
// };
```

### Secrets in Version Control

```.gitignore
# Environment variables
.env
.env.local
.env.*.local

# Don't commit secrets
secrets.yaml
credentials.json

# Keep .env.example for reference (without actual secrets)
!.env.example
```

```bash
# .env.example (commit this)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

## API Security

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

const redisClient = createClient();

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rate_limit:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful attempts
  message: "Too many login attempts, please try again later",
});

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);
```

### CORS Configuration

```typescript
import cors from "cors";

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ❌ BAD - Allow all origins in production
// app.use(cors({ origin: '*' }));
```

### Security Headers

```typescript
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.yourdomain.com"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny", // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true,
  }),
);
```

## File Upload Security

```typescript
import multer from "multer";
import path from "path";
import crypto from "crypto";

// Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".pdf"];

    if (!allowedExts.includes(ext)) {
      return cb(new Error("Invalid file extension"));
    }

    cb(null, true);
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Additional validation: scan file content
  // (e.g., using antivirus, image validation library)

  res.json({
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});
```

## Security Checklist

### Authentication & Authorization

- [ ] Passwords are hashed with bcrypt (12+ rounds)
- [ ] JWT tokens have short expiration times
- [ ] Refresh tokens are stored securely
- [ ] Sessions are stored server-side (Redis/database)
- [ ] Session cookies are httpOnly, secure, sameSite
- [ ] Multi-factor authentication is implemented (for sensitive operations)

### Input Validation

- [ ] All user input is validated and sanitized
- [ ] SQL queries use parameterized queries
- [ ] HTML content is sanitized before rendering
- [ ] File uploads are restricted by type and size
- [ ] API endpoints validate request bodies

### Secrets Management

- [ ] No secrets in source code
- [ ] Environment variables used for configuration
- [ ] .env files are in .gitignore
- [ ] Production secrets are rotated regularly

### API Security

- [ ] Rate limiting is implemented
- [ ] CORS is properly configured
- [ ] Security headers are set (Helmet.js)
- [ ] API authentication is required
- [ ] HTTPS is enforced in production

### Monitoring & Logging

- [ ] Failed authentication attempts are logged
- [ ] Security events are monitored
- [ ] Error messages don't leak sensitive information
- [ ] Audit logs for sensitive operations

### Dependencies

- [ ] Dependencies are regularly updated
- [ ] Vulnerability scanning is automated (npm audit, Snyk)
- [ ] Only trusted dependencies are used
- [ ] Dependency versions are pinned
