# 1. Node.js 18 버전 기반 컨테이너
FROM node:22.14.0 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
RUN npm run build

# 2. Nginx 기반 컨테이너
FROM nginx:alpine

# 🔥 Nginx 설정 파일 복사
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 🔥 React 빌드 파일 복사
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
