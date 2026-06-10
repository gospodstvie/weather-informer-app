FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server ./server
COPY client ./client
COPY docs ./docs
COPY data ./data
COPY .env.example ./

ENV PORT=5500
EXPOSE 5500

CMD ["node", "server/server.js"]
