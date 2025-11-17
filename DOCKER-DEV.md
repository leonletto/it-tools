# IT-Tools Docker Development Guide

This guide explains how to run IT-Tools in Docker with live reload functionality for development.

## Overview

The `docker-compose-dev-mac.yml` configuration provides a complete development environment with:

- **Live Reload**: Changes to source files automatically update in the browser
- **Hot Module Replacement (HMR)**: Instant updates via Vite dev server
- **Isolated Environment**: Consistent development environment across machines
- **Easy Setup**: One command to start developing

## Quick Start

### Start Development Environment

```bash
docker compose -f docker-compose-dev-mac.yml up --build
```

This will:
1. Build the development Docker image
2. Install all dependencies inside the container
3. Start the Vite development server
4. Enable live reload on file changes

Access the application at: **http://localhost:5173**

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

### Making Changes

1. Edit files in `src/`, `locales/`, or `public/` directories
2. Save your changes
3. The browser will automatically reload with your changes (HMR)

### Rebuilding

If you modify `package.json`, `vite.config.ts`, or other configuration files:

```bash
docker compose -f docker-compose-dev-mac.yml up --build --force-recreate
```

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
- Live reload enabled
- Source code mounted as volumes
- Fast iteration for development
- **Command**: `docker compose -f docker-compose-dev-mac.yml up --build`

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

1. Check if the file is mounted correctly in `docker-compose-dev-mac.yml`
2. Restart the container: `docker compose -f docker-compose-dev-mac.yml restart`
3. Rebuild if needed: `docker compose -f docker-compose-dev-mac.yml up --build --force-recreate`

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
├── src/                        # Source code (mounted for live reload)
├── locales/                    # Translations (mounted for live reload)
├── public/                     # Static assets (mounted for live reload)
└── vite.config.ts             # Vite configuration
```

### Mounted Volumes

The following directories are mounted for live reload:
- `./src` → `/app/src`
- `./locales` → `/app/locales`
- `./public` → `/app/public`
- `./index.html` → `/app/index.html`
- Configuration files (vite.config.ts, tsconfig.json, etc.)

The `node_modules` directory is kept in a Docker volume to avoid conflicts with host system.

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [IT-Tools Repository](https://github.com/CorentinTh/it-tools)

