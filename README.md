## Setup Project ##

1. Install npm packages in client and server folders: `npm install`

2. Copy `.env.example` into `.env` and configure as you need

3. Run migrations and seeders in server folder:

- `npm run migrate:latest`

- `npm run seed:run`

4. Run server and client with the same command: `npm run dev`

## Knex commands ##

-  `npm run migrate:make my_migration` (create new migration file)

-  `npm run migrate:latest` (run migrate command)

-  `npm run migrate:rollback` (rollback the latest migration)

-  `npm run seed:make my_seed` (create new seeder)

-  `npm run seed:run` (run seed command)