# Frontend Dockerfile (Expo Web static build served by Nginx)

# 1) Build static web with Expo
FROM node:20-alpine AS webbuild
WORKDIR /app

# Copy lockfile explicitly to ensure npm ci finds it
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Expo web export
ARG EXPO_PUBLIC_API_BASE_URL
ARG EXPO_PUBLIC_USE_BACKEND
ARG EXPO_PUBLIC_USE_FIRESTORE
ENV EXPO_NO_TELEMETRY=1 \
    EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL} \
    EXPO_PUBLIC_USE_BACKEND=${EXPO_PUBLIC_USE_BACKEND} \
    EXPO_PUBLIC_USE_FIRESTORE=${EXPO_PUBLIC_USE_FIRESTORE}
RUN npx expo export --platform web

# 2) Nginx runtime to serve static files
FROM nginx:1.25-alpine AS web

# Copy nginx config
COPY ./web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy exported web static files
COPY --from=webbuild /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


