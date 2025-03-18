# 1. Node.js 18 버전 기반으로 컨테이너 생성
FROM node:22.14.0

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 package-lock.json을 복사 (의존성 설치를 위한 최소한의 파일만 복사)
COPY package.json package-lock.json ./

# 4. production 환경에서 필요한 패키지 설치 (개발용 패키지는 설치 X)
RUN npm install --production

# 5. 프로젝트 전체 복사
COPY . .

# 6. React 프로젝트 빌드
RUN npm run build

# 7. 빌드된 정적 파일을 서빙하기 위해 Nginx 사용
FROM nginx:alpine

# 8. React의 빌드 결과물을 Nginx가 서비스할 디렉토리로 복사
COPY --from=0 /app/build /usr/share/nginx/html

# 9. Nginx 컨테이너에서 80 포트 오픈
EXPOSE 4000

# 10. Nginx 실행 (데몬 모드 해제)
CMD ["nginx", "-g", "daemon off;"]
