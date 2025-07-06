# Issue Tracker Lite

A simple, lightweight bug tracking system with AI-assisted title generation.

## Features

- **User Authentication:** Users can register and log in.
- **Ticket Creation & Listing:** Users can create tickets via a form and view their own tickets.
- **Ticket Editing & Deletion:** Users can edit and delete **only their own** tickets.
- **Comments:** Any user can add comments to **any** ticket.
- **Status Management:** Tickets can be updated to one of: Open, In Progress, Resolved, Closed.
- **Priority & Category (optional):**
  - Priority: Low, Medium, High
  - Category: Bug, Feature, Task
- **AI Title Generation:** If a ticket description is provided, AI can automatically generate a concise title.

## Setup

1. In both `client` and `server` folders, install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your environment variables.
3. In the `server` folder, run migrations and seeders:
   ```bash
   npm run migrate:latest
   npm run seed:run
   ```
4. Start both server and client with:
   ```bash
   npm run dev
   ```

## Knex commands

- `npm run migrate:make <name>`     – Create a new migration
- `npm run migrate:latest`          – Apply all pending migrations
- `npm run migrate:rollback`        – Roll back the last migration batch
- `npm run seed:make <name>`        – Create a new seeder
- `npm run seed:run`                – Run all seeders