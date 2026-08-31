FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

ENV NODE_ENV=production

CMD ["npm", "start"]
