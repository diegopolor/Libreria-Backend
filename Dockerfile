FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

RUN npm run prisma:generate

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "npm run prisma:deploy && npm run prisma:seed && node src/index.js"]
