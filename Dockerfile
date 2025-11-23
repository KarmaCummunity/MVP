# Frontend Dockerfile (Expo Web static build served by Nginx)
# ===================================================================
# Multi-stage build for optimized production deployment
# Stage 1: Build Expo web application
# Stage 2: Serve with Nginx
# ===================================================================

FROM node:20-alpine as webbuild

# Set working directory
WORKDIR /app

# ===============================================
# DEPENDENCY INSTALLATION
# ===============================================
# Copy package manifests first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies with explicit error handling
# Using npm ci for reproducible builds (respects package-lock.json exactly)
RUN set -ex && \
    # Clear npm cache to avoid corruption issues
    npm cache clean --force && \
    # Install dependencies
    npm ci --legacy-peer-deps --ignore-scripts && \
    # Verify critical Expo packages are installed
    npm list expo-linking expo-constants expo-router || true && \
    # Rebuild native modules if needed (for web, usually not needed but safe)
    npm rebuild && \
    # Log installed versions for debugging
    echo "=== Installed Package Versions ===" && \
    npm list --depth=0 expo expo-router expo-linking expo-constants

# ===============================================
# COPY APPLICATION SOURCE
# ===============================================
COPY . .

# ===============================================
# BUILD CONFIGURATION & ENVIRONMENT
# ===============================================
ARG EXPO_PUBLIC_API_BASE_URL=/
ARG EXPO_PUBLIC_USE_BACKEND=1
ARG EXPO_PUBLIC_USE_FIRESTORE=0

ENV NODE_ENV=production \
    EXPO_NO_TELEMETRY=1 \
    EXPO_NO_DOTENV=1 \
    EXPO_USE_STATIC=1 \
    EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL} \
    EXPO_PUBLIC_USE_BACKEND=${EXPO_PUBLIC_USE_BACKEND} \
    EXPO_PUBLIC_USE_FIRESTORE=${EXPO_PUBLIC_USE_FIRESTORE}

# ===============================================
# WEB EXPORT
# ===============================================
# Export for web with fallback strategy
RUN set -ex && \
    echo "=== Starting Expo Web Export ===" && \
    npx --yes expo@~53.0.20 export --platform web --clear || \
    (echo "First export attempt failed, retrying without cache..." && \
     rm -rf .expo dist && \
     npx expo export --platform web --clear) && \
    echo "=== Export Complete ===" && \
    ls -la dist/

# ===============================================
# STAGE 2: NGINX RUNTIME
# ===============================================
FROM nginx:1.25-alpine as web

# Runtime environment variables
ENV BACKEND_BASE_URL="http://localhost:3001" \
    NGINX_PORT=8080 \
    EXPO_PUBLIC_USE_BACKEND=1 \
    EXPO_PUBLIC_USE_FIRESTORE=0

# Copy nginx configuration
COPY ./web/nginx.conf /etc/nginx/templates/default.conf.template

# Create entrypoint script with proper variable substitution
RUN printf '#!/bin/sh\n\
set -e\n\
: "${BACKEND_BASE_URL:=http://localhost:3001}"\n\
: "${PORT:=8080}"\n\
export NGINX_PORT="$PORT"\n\
echo "Starting Nginx with BACKEND_BASE_URL=$BACKEND_BASE_URL on port $NGINX_PORT"\n\
envsubst '\''$BACKEND_BASE_URL $NGINX_PORT'\'' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Copy exported web static files from build stage
COPY --from=webbuild /app/dist /usr/share/nginx/html

# Verify files were copied
RUN echo "=== Nginx HTML Directory Contents ===" && \
    ls -la /usr/share/nginx/html/

# Metadata
LABEL name="kc-web" \
      version="2.0.1" \
      description="KC Frontend - Expo Web + Nginx" \
      maintainer="navesarussi@gmail.com"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["/docker-entrypoint.sh"]
