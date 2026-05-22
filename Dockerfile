FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN chmod +x node_modules/.bin/prisma

COPY prisma ./prisma/

RUN node_modules/.bin/prisma generate

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node_modules/.bin/prisma db seed && node src/index.js"]
