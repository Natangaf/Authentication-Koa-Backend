# NatangaDev Test - Node.js com Koa.js e AWS Cognito

Este é um projeto Node.js construído utilizando **Koa.js**, **TypeScript** e **AWS Cognito** para autenticação de usuários. Foi desenvolvido para fins de teste, com **PostgreSQL** como banco de dados. A aplicação utiliza **TypeORM** para interações com o banco de dados e **JWT** para autenticação baseada em tokens.

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Tecnologias](#tecnologias)
- [Como Começar](#como-começar)
- [Configuração do Docker](#configuração-do-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Coleção do Postman](#coleção-do-postman)
- [Licença](#licença)

## Descrição do Projeto

Este projeto implementa um sistema básico de autenticação e gerenciamento de usuários, utilizando AWS Cognito para autenticação. Ele inclui integração com **PostgreSQL** através do **TypeORM** e é construído com **Koa.js** para gerenciar requisições HTTP e rotas.

A aplicação está estruturada como um projeto TypeScript e utiliza Docker para containerização.

## Tecnologias

- **Koa.js**: Um framework minimalista e flexível para Node.js.
- **TypeScript**: Uma linguagem fortemente tipada que amplia o JavaScript.
- **AWS Cognito**: Para autenticação e autorização de usuários.
- **PostgreSQL**: Banco de dados relacional para armazenar dados dos usuários.
- **TypeORM**: Um ORM para interagir com o banco de dados PostgreSQL.
- **Docker**: Para containerizar a aplicação.
- **JWT**: Para autenticação baseada em tokens.

## Como Começar

Siga as instruções abaixo para configurar o projeto na sua máquina:

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker (se for usar a versão containerizada)
- PostgreSQL (caso não utilize Docker para o banco de dados)

### Instalando as Dependências

1. Clone o repositório:

   ```bash

   ```

2. Instale as dependências:

   ```bash

   ```

### Executando a Aplicação

1. Para gerar o build de produção e iniciar a aplicação:
    ```bash
    npm run build
    npm start
   ```

## Configuração do Docker

Este projeto utiliza Docker para facilitar a configuração e execução. Para rodar a aplicação e o banco de dados com Docker, siga os passos abaixo:

1. Construa a imagem Docker:
No diretório raiz do projeto, execute:
```bash
docker-compose up --build
```
Isso vai construir as imagens Docker e subir os containers para a aplicação e o banco de dados.

2. Acessando a aplicação:
Após os containers serem iniciados, você pode acessar a aplicação em http:/localhost:3000.
```bash
docker-compose up --build
```
Isso vai construir as imagens Docker e subir os containers para a aplicação e o banco de dados.

### Parâmetros de Configuração do Docker
O Docker irá utilizar as variáveis de ambiente definidas no arquivo .env para configurar o banco de dados e as credenciais do AWS Cognito.

### Variáveis de Ambiente
As variáveis de ambiente são necessárias para configurar o banco de dados e a autenticação. Elas podem ser definidas em um arquivo .env ou diretamente no seu ambiente Docker.

Exemplo de um arquivo .env:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco_de_dados

USER_POOL_ID=seu_user_pool_id
REGION=sua_regiao
CLIENT_ID=seu_client_id
CLIENT_SECRET=seu_client_secret
```

## Coleção do Postman

Para facilitar o teste da API, incluímos uma coleção do Postman que contém exemplos de requisições para as rotas disponíveis. Você pode importar a coleção no seu Postman e utilizá-la para testar as funcionalidades da aplicação.

### Como importar a coleção no Postman:

1. Baixe o arquivo da coleção [Natanga Test - Coleção do Postman](https://github.com/).
2. Abra o Postman.
3. Clique em **Importar** na parte superior esquerda.
4. Selecione o arquivo JSON da coleção baixado.

Isso vai adicionar todas as rotas configuradas no Postman, facilitando o teste das funcionalidades da API.


