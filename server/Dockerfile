FROM node:18-alpine

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
