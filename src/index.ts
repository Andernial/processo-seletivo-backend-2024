import { bootstrap } from '@graphql/graphql-server';
const port = parseInt(process.env.PORT);
bootstrap(port);
