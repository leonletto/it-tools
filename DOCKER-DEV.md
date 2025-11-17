# IT-Tools Docker Development Guide

This guide explains how to run IT-Tools in Docker with live reload functionality for development.

## Overview

The `docker-compose-dev-mac.yml` configuration provides a complete development environment with:

- **Docker Compose Watch**: Efficient file watching optimized for macOS/Windows
- **Live Reload**: Changes to source files automatically update in the browser
- **Hot Module Replacement (HMR)**: Instant updates via Vite dev server
- **Smart Sync**: Different actions for different file types (sync, restart, rebuild)
- **Isolated Environment**: Consistent development environment across machines
- **Easy Setup**: One command to start developing

## Quick Start

### Start Development Environment (RECOMMENDED)

**Using Docker Compose Watch (Best for macOS/Windows):**

```bash
docker compose -f docker-compose-dev-mac.yml watch
```

This will:
1. Build the development Docker image
2. Install all dependencies inside the container
3. Start the Vite development server
4. **Watch for file changes and sync them automatically**
5. Enable live reload on file changes

Access the application at: <http://localhost:5173>

### Alternative: Start Without Watch

If you prefer manual control:

```bash
docker compose -f docker-compose-dev-mac.yml up --build
```

Note: Without `watch`, you'll need to manually restart the container to see changes.

### Start in Detached Mode

To run in the background:

```bash
docker compose -f docker-compose-dev-mac.yml up --build -d
```

View logs:
```bash
docker logs -f it-tools-dev
```

### Stop the Environment

```bash
docker compose -f docker-compose-dev-mac.yml down
```

## Development Workflow

### Making Changes with Docker Compose Watch

When using `docker compose watch`, file changes are handled automatically:

**Source Code Changes (src/, locales/, public/):**
1. Edit files in `src/`, `locales/`, or `public/` directories
2. Save your changes
3. Files are **automatically synced** to the container
4. Vite detects the change and triggers **HMR (Hot Module Replacement)**
5. Browser updates **instantly** without full reload

**Configuration Changes (vite.config.ts, tsconfig.json, etc.):**
1. Edit configuration files
2. Save your changes
3. Files are synced and container **automatically restarts**
4. Refresh your browser to see changes

**Dependency Changes (package.json):**
1. Edit `package.json`
2. Save your changes
3. Container is **automatically rebuilt** with new dependencies
4. Wait for rebuild to complete, then refresh browser

### Docker Compose Watch Actions

The watch configuration uses three different actions:

| Action | Files | Behavior |
|--------|-------|----------|
| **sync** | `src/`, `locales/`, `public/` | Syncs files, triggers HMR |
| **sync+restart** | `vite.config.ts`, `tsconfig.json`, etc. | Syncs files, restarts container |
| **rebuild** | `package.json` | Rebuilds entire container |

### Accessing the Container

To run commands inside the container:

```bash
docker exec -it it-tools-dev sh
```

Inside the container, you can run:
```bash
pnpm test          # Run tests
pnpm lint          # Run linter
pnpm typecheck     # Run type checking
```

## Production Preview (Optional)

To test the production build locally, uncomment the `it-tools-prod` service in `docker-compose-dev-mac.yml`:

```yaml
it-tools-prod:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: it-tools-prod
  ports:
    - "80:80"
    - "443:443"
  restart: unless-stopped
  networks:
    - it-tools-network
```

Then run:
```bash
docker compose -f docker-compose-dev-mac.yml up it-tools-prod --build
```

Access at: **http://localhost** (HTTP) or **https://localhost** (HTTPS with SSL)

## Comparison with Production Docker

### Development Setup (docker-compose-dev-mac.yml)

- Uses `Dockerfile.dev`
- Runs Vite dev server (port 5173)
- **Docker Compose Watch** for efficient file syncing
- Live reload enabled with HMR
- Source code mounted as volumes
- Fast iteration for development
- **Command**: `docker compose -f docker-compose-dev-mac.yml watch`

### Production Setup (Current docker build/run commands)

- Uses `Dockerfile`
- Builds static assets
- Serves via nginx (ports 80/443)
- Optimized for production
- SSL certificates included
- **Commands**:

  ```bash
  docker build -t my-it-tools:1.0 -f Dockerfile .
  docker run -d --name it-tools --restart unless-stopped -p 80 -p 443 my-it-tools:1.0
  ```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, modify the port mapping in `docker-compose-dev-mac.yml`:

```yaml
ports:
  - "3000:5173"  # Use port 3000 on host instead
```

### Changes Not Reflecting

**First, make sure you're using Docker Compose Watch:**

```bash
docker compose -f docker-compose-dev-mac.yml watch
```

If changes still aren't reflecting:

1. **Check if watch is running**:

   Look for "Watch enabled" or similar messages in the console output

2. **Verify files are being synced**:

   ```bash
   docker exec -it it-tools-dev ls -la /app/src/tools/html-md-converter/
   ```

   Make a change to a file and run this again to see if the timestamp updated

3. **Check Vite HMR connection**:

   Open browser console (F12) and look for Vite HMR connection messages. You should see:
   - `[vite] connecting...`
   - `[vite] connected.`

4. **Hard refresh browser**:

   Sometimes browser caching interferes. Try:
   - Mac: `Cmd+Shift+R`
   - Windows/Linux: `Ctrl+Shift+R`

5. **Restart with watch**:

   ```bash
   docker compose -f docker-compose-dev-mac.yml down
   docker compose -f docker-compose-dev-mac.yml watch
   ```

6. **Check Docker Compose version**:

   Docker Compose Watch requires Docker Compose v2.22.0 or later:

   ```bash
   docker compose version
   ```

   If your version is older, update Docker Desktop or use the polling fallback (see below)

### Fallback: Using Polling Instead of Watch

If Docker Compose Watch doesn't work on your system, the configuration also supports polling:

```bash
# Stop watch if running
docker compose -f docker-compose-dev-mac.yml down

# Start with regular up (polling is enabled via vite.config.docker.ts)
docker compose -f docker-compose-dev-mac.yml up --build
```

The polling configuration in `vite.config.docker.ts` checks for changes every 1 second.

### Node Modules Issues

If you encounter dependency issues:

```bash
# Remove the volume and rebuild
docker compose -f docker-compose-dev-mac.yml down -v
docker compose -f docker-compose-dev-mac.yml up --build
```

## Architecture

### File Structure

```
it-tools/
├── docker-compose-dev-mac.yml  # Development docker compose config
├── Dockerfile.dev              # Development Dockerfile (Vite dev server)
├── Dockerfile                  # Production Dockerfile (nginx + built assets)
├── vite.config.docker.ts       # Docker-specific Vite config (with polling)
├── vite.config.ts              # Standard Vite configuration
├── src/                        # Source code (mounted for live reload)
├── locales/                    # Translations (mounted for live reload)
├── public/                     # Static assets (mounted for live reload)
└── DOCKER-DEV.md              # This documentation file
```

### Key Configuration Files

**`vite.config.docker.ts`** - Docker-specific configuration that enables:
- File watching with polling (`usePolling: true`)
- 1-second polling interval for change detection
- HMR (Hot Module Replacement) configuration
- Server binding to `0.0.0.0` for Docker networking

### Docker Compose Watch vs Bind Mounts

**This configuration uses Docker Compose Watch instead of traditional bind mounts.**

**Why?**

- **Better Performance**: Watch is optimized for macOS/Windows file systems
- **No Conflicts**: Avoids the warning "path also declared by a bind mount volume"
- **Smart Syncing**: Different actions for different file types
- **Efficient**: Only syncs changed files, not entire directories

**What's Synced:**

- `./src` → `/app/src` (sync - triggers HMR)
- `./locales` → `/app/locales` (sync - triggers HMR)
- `./public` → `/app/public` (sync - triggers HMR)
- `./index.html` → `/app/index.html` (sync - triggers HMR)
- Configuration files (sync+restart - restarts container)
- `./package.json` (rebuild - rebuilds container)

**What's NOT Synced:**

- `node_modules` - Kept in a Docker volume to avoid conflicts with host system

## Quick Reference

### Common Commands

```bash
# Start development with watch (RECOMMENDED)
docker compose -f docker-compose-dev-mac.yml watch

# Stop the environment
docker compose -f docker-compose-dev-mac.yml down

# View logs
docker logs -f it-tools-dev

# Access container shell
docker exec -it it-tools-dev sh

# Rebuild from scratch
docker compose -f docker-compose-dev-mac.yml down -v
docker compose -f docker-compose-dev-mac.yml build --no-cache
docker compose -f docker-compose-dev-mac.yml watch
```

### File Change Behavior

| File Type | Action | What Happens |
|-----------|--------|--------------|
| `src/**/*.vue` | sync | HMR - instant browser update |
| `locales/**/*.yml` | sync | HMR - instant browser update |
| `public/**/*` | sync | HMR - instant browser update |
| `vite.config.docker.ts` | sync+restart | Container restarts |
| `tsconfig.json` | sync+restart | Container restarts |
| `package.json` | rebuild | Container rebuilds |

### Troubleshooting Quick Fixes

```bash
# Changes not showing up?
docker compose -f docker-compose-dev-mac.yml restart

# Still not working? Rebuild:
docker compose -f docker-compose-dev-mac.yml down
docker compose -f docker-compose-dev-mac.yml watch

# Nuclear option (clean slate):
docker compose -f docker-compose-dev-mac.yml down -v
docker compose -f docker-compose-dev-mac.yml build --no-cache
docker compose -f docker-compose-dev-mac.yml watch
```

## Additional Resources

- [Docker Compose Watch Documentation](https://docs.docker.com/compose/file-watch/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [IT-Tools Repository](https://github.com/CorentinTh/it-tools)

