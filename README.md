# Vehicle and Building Inspection Forms

Next.js frontend for the inspection forms, with a separate Express API and a Prisma schema prepared for MySQL persistence.

## Getting Started

Install dependencies:

```powershell
npm install
```

Create a local environment file from `.env.example`. The default API configuration expects the frontend at `http://localhost:3000` and the Express API at `http://localhost:4000`.

Run the frontend and API in separate terminals:

```powershell
npm run dev
npm run api:dev
```

Open [http://localhost:3000](http://localhost:3000). The API health check is available at `http://localhost:4000/health`.

## Database Setup

The Prisma schema uses MySQL and is ready for migrations when a MySQL database is available:

```powershell
npm run prisma:generate
npx prisma migrate dev --name init
```

Until a database repository is connected, the Express API uses an in-memory repository so local form submission can be tested without MySQL. Set `DATABASE_URL` in `.env` before running Prisma migrations.

The vehicle form submits to `NEXT_PUBLIC_API_URL/api/inspections`, and the Express API validates the payload with Zod.

## Useful Commands

```powershell
npm run lint
npm run build
npm run api
```

## References

- [Next.js documentation](https://nextjs.org/docs)
- [Express documentation](https://expressjs.com/)
- [Prisma MySQL documentation](https://www.prisma.io/docs/orm/overview/databases/mysql)
