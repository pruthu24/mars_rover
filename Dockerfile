FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build
 
# Stage 2 to host built React App
FROM nginx:alpine
RUN apk add --no-cache nodejs npm
RUN npm install -g react-inject-env
WORKDIR /usr/share/nginx/html
COPY --from=build-stage /app/dist .
COPY --from=build-stage /app/nginx /etc/nginx/conf.d
CMD ["sh", "-c", "react-inject-env set -d . && nginx -g 'daemon off;'"]