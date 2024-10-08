# Crud --- Processo Seletivo TaqTile
![repository-size](https://img.shields.io/github/repo-size/Andernial/processo-seletivo-backend-2024?labelColor=%23FFD602&color=white)
![stats-last commit](https://img.shields.io/github/last-commit/Andernial/processo-seletivo-backend-2024?display_timestamp=committer&labelColor=%23FFD602&color=white)

## 📗Description
This project is being developed as a part of a recruitment process and this description may change during the updates.

For now the project is a simple graphql API built with apollo server. When running it locally its possible to make three simple test querys (more detailed explanations can be found in the 'Steps to run and debug' section).


## 👾Environment and tools
- [VS Code](https://code.visualstudio.com/)
- [NodeJS](https://nodejs.org/en)
- [TypeScript](https://www.typescriptlang.org/)
- [GraphQL](https://graphql.org/)
- [DotEnv](https://www.npmjs.com/package/dotenv)
- [Eslint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Docker](https://www.docker.com/)
- [Postgres](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)


## 🏃🏻‍♀️​Steps to run and debug
### Cloning the Repository to your machine

You can choose to clone the repository to your machine or you can download the zip file from the "code" button on github.

**Cloning the repo using a command on your terminal of choice**
```
git clone https://github.com/Andernial/processo-seletivo-backend-2024

```
**After that you can access the root directory in you terminal and install the necessary dependencies with the command**

```
npm i
```
### DotEnv
Create a .env file in the root directory of the project, them start making the enviroment variables.

**Enviroment Variables**
```
DB_USER = "Name of the DB user"
DB_PASSWORD = "Password of the DB user"
DB_NAME1 = "Name of the local Postgres DB"
DB_NAME2 = "Name of the Test Postgres DB"
DATABASE_URL = postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```
The database variables will be used on the **docker-compose** file later.

if you don't know how to set up the database url format you can find a more detailed explanation [here](https://www.prisma.io/docs/orm/reference/connection-urls)

### Docker

In this project, there is a Docker Compose file containing the configuration of two PostgreSQL database images. To run the containers on your machine, you will need [Docker](https://www.docker.com/) installed.

**Running the databases in docker compose file**
```
docker compose up -d
```

**Stopping the running docker containers from the compose file**
```
docker compose stop
```

**Removing docker compose file containers**
```
docker compose down
```
### Running Prisma Migrations
After running the local database you can run the migrations saved on **prisma/migrations** file

**Running migration**
```
npx prisma migrate deploy

```
this will update your local postgres database with all the pending migrations.
### Running the project

**Main Scripts**
```
npm start 
```
```
npm run dev
```
```
npm run lint
```
```
npm run lint -- --fix

```
- execute **npm start** on your terminal to compile the ts script and start the graphql with apollo server
- execute **npm run dev** on your terminal to start nodemon (you still have to execute the command **npx tsc --watch** in another terminal to use nodemon + typescript)
- execute **npm run lint** to check for linting errors
- execute **npm run lint -- --fix** to fix linting errors

## 📦​Final Considerations
This project and the documentation will still go trough many updates soon.
