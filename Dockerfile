# Etapa 1: build estático con Astro
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar deps con cache
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build args (PUBLIC_*) se hornean en el bundle estático.
# En Coolify deben cargarse como Build Variables.
ARG PUBLIC_API_BASE_URL
ARG PUBLIC_SITE_URL
ARG PUBLIC_SITE_NAME="CMS Municipios Lavalleja"

ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL \
    PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_SITE_NAME=$PUBLIC_SITE_NAME

RUN test -n "$PUBLIC_API_BASE_URL" || (echo "PUBLIC_API_BASE_URL build arg is required" && exit 1)
RUN test -n "$PUBLIC_SITE_URL" || (echo "PUBLIC_SITE_URL build arg is required" && exit 1)

RUN npm run build

# Etapa 2: nginx sirviendo /dist
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
