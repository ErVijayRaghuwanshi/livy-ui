# Stage 1: Build static web assets
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (Lightweight Caddy Web Server ~30MB)
FROM caddy:2-alpine
COPY --from=build /app/dist /srv

EXPOSE 4173

CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":4173", "--try-files", "{path}", "{path}/", "/index.html"]