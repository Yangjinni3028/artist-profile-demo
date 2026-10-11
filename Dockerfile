FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=8081
EXPOSE 8081

CMD ["node", "src/index.js"]
