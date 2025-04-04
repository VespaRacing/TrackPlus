FROM node:18-alpine
WORKDIR /app

COPY package.json ./
RUN npm install -g http-server

COPY . .

EXPOSE 3000

CMD ["http-server", "-p", "3000", "-a", "0.0.0.0"]
