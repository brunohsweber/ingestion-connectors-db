
# Stage 1: Criar imagem mínima
FROM node:alpine as builder

WORKDIR /app

# Copiar dependências
COPY package.json package-lock.json /app/

# Desativar verificação automática de atualizações do npm
RUN npm config set update-notifier false

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . /app

# Construir o projeto
RUN npm run build

# Stage 2: Criar imagem final
FROM node:alpine

WORKDIR /app

# Desativar verificação automática de atualizações do npm
RUN npm config set update-notifier false

# Copiar artefatos da etapa anterior
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
COPY --from=builder /app/tsconfig.json /app/tsconfig.json
COPY --from=builder /app/tsconfig-paths.js /app/tsconfig-paths.js

COPY --from=builder /app /app

# Exemplo de como você pode definir o comando padrão
CMD ["npm", "run", "start:prod"]
