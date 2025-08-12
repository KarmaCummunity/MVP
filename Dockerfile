# Frontend Dockerfile (Expo Web static build served by Nginx)

# 1) Build static web with Expo
FROM node:20-alpine as webbuild
WORKDIR /app

# Copy package manifest(s). If package-lock.json קיים הוא ייכלל אוטומטית.
COPY package*.json ./
# התקנת תלויות: אם יש lockfile נשתמש ב-ci, אחרת ב-install
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi
COPY . .

# Expo web export (defaults ensure production works on Railway even without build args)
ARG EXPO_PUBLIC_API_BASE_URL=/
ARG EXPO_PUBLIC_USE_BACKEND=1
ARG EXPO_PUBLIC_USE_FIRESTORE=0
ENV EXPO_NO_TELEMETRY=1 \
    EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL} \
    EXPO_PUBLIC_USE_BACKEND=${EXPO_PUBLIC_USE_BACKEND} \
    EXPO_PUBLIC_USE_FIRESTORE=${EXPO_PUBLIC_USE_FIRESTORE}
RUN npx --yes expo@latest export --platform web || npx expo export --platform web

# 2) Nginx runtime to serve static files
FROM nginx:1.25-alpine as web

# Copy nginx config template and entrypoint to inject runtime BACKEND_BASE_URL
ENV BACKEND_BASE_URL="http://localhost:3001"
ENV NGINX_PORT=8080
ENV EXPO_PUBLIC_USE_BACKEND=1
ENV EXPO_PUBLIC_USE_FIRESTORE=0
COPY ./web/nginx.conf /etc/nginx/templates/default.conf.template
RUN printf '#!/bin/sh\nset -e\n: "${BACKEND_BASE_URL:=http://localhost:3001}"\n: "${PORT:=8080}"\nexport NGINX_PORT="$PORT"\n\
  envsubst '\''$BACKEND_BASE_URL $NGINX_PORT'\'' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
  exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh \
  && chmod +x /docker-entrypoint.sh

# Copy exported web static files
COPY --from=webbuild /app/dist /usr/share/nginx/html

LABEL Name="kc-web" Version="1.4.0"
EXPOSE 8080
CMD ["/docker-entrypoint.sh"]


