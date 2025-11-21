# Simple static HTML Dockerfile - NO EXPO BUILD
FROM nginx:1.25-alpine

# Copy static HTML directly
COPY public/ /usr/share/nginx/html/

# Copy nginx config
COPY web/nginx.conf /etc/nginx/templates/default.conf.template || echo "server { listen 8080; root /usr/share/nginx/html; index index.html; }" > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

