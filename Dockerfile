# build stage
FROM node:lts-alpine AS build-stage
# Set environment variables for non-interactive npm installs
ENV NPM_CONFIG_LOGLEVEL=warn
ENV CI=true
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm i --frozen-lockfile
COPY . .
RUN pnpm build

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx-ssl.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates
COPY secrets/it-tools.orb.local.crt /etc/nginx/ssl/
COPY secrets/it-tools.orb.local.key /etc/nginx/ssl/
COPY secrets/zllocalCA.crt /etc/nginx/ssl/

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
