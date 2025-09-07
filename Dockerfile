FROM node:22-slim AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

#Imagem final
FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
COPY --from=builder /app/swagger.yaml /app/swagger.yaml

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
