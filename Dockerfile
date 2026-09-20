# --- Build stage ---
# node:20 (not 14): react-router-dom@7 in this project requires Node >=20,
# recharts requires >=18 — the app would not even npm install cleanly on 14.
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first, separately from the source copy, so this layer
# stays cached across rebuilds that only touch src/.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Serve stage ---
# MoneyLens is a pure client-side static app (no backend), so production
# should serve the compiled build/ output with a lightweight web server —
# not run the CRA dev server, which the previous Dockerfile did.
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# CRA uses client-side routing (react-router-dom), so unknown paths must
# fall back to index.html rather than 404ing at the web server level.
RUN printf 'server {\n\
    listen 8000;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]
