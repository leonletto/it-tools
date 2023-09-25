# build stage
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g pnpm
RUN npm install
COPY . .
RUN npm run build

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

# docker build -t my-it-tools:1.0 -f Dockerfile .
#docker run -d --name it-tools -p 80 -p 443 my-it-tools:1.0
