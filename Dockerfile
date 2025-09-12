# ---- build ----
FROM node:18-alpine AS build
WORKDIR /app



COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY .env ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY index.html ./          
COPY src ./src

RUN npm install
RUN npm run build            

# ---- run ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80