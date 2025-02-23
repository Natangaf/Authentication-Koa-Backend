# Usa uma imagem oficial do Node.js
FROM node:20.17

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos essenciais para a instalação das dependências
COPY package*.json tsconfig.json ./

# Instala as dependências com cache otimizado
RUN npm ci --only=production

# Copia o restante do código
COPY . .

# Compila o projeto
RUN npm run build

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
