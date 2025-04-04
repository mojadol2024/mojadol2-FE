FROM node:22.14.0 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
RUN npm run build

# 빌드 결과만 남기고 컨테이너 실행 안 함
CMD ["echo", "Build complete"]
