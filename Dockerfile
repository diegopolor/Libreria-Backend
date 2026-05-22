FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g prisma@5.10.0

COPY prisma ./prisma/

RUN prisma generate

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "prisma migrate deploy && prisma db seed && node src/index.js"]
