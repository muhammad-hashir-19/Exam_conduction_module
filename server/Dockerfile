FROM node:20-alpine

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

# Run migrations and seed data before starting the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && npm run dev"]
