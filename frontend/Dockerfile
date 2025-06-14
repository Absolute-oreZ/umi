FROM node:18-alpine as build

WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm ci --only=production

# copy source code
COPY . .

# build
RUN npm run build

# production stage
FROM nginx:alpine

# copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]