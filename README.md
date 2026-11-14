# PaperTrail

PaperTrail is an online bookstore with an admin-managed book storefront, a peer-to-peer marketplace, memberships, and an admin dashboard.

## Features

- Browse, search, filter, and purchase books from the PaperTrail storefront.
- Manage cart, checkout, orders, reviews, wishlists, profiles, and memberships.
- Buy and sell reader-listed books through the moderated marketplace.
- Administer users, orders, marketplace listings, and storefront books.
- Upload book covers for storefront books from the admin panel.

## Technology stack

| Area | Technologies |
|---|---|
| Website | React 18, Vite, React Router, Tailwind CSS, Zustand, Axios |
| Backend | Node.js, Express, Mongoose, Multer |
| Database | MongoDB Atlas |

## Folder structure

```text
backend/     Express API, MongoDB models, routes, seed and smoke utilities
web/         React storefront and admin website
mobile/      Original React Native app; unused by the website
```

## Prerequisites

- Node.js 18 or newer and npm.
- A MongoDB Atlas connection string and a database named `papertrail`.

## Environment variables

Copy `backend/.env.example` to `backend/.env` and set values for your environment. Copy `web/.env.example` to `web/.env` if the API URL differs from the local default.

Backend (`backend/.env`):

```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
# Optional public origin for uploaded cover URLs, e.g. https://api.example.com
# PUBLIC_BASE_URL=<public-api-origin>
```

Website (`web/.env`):

```env
VITE_API_URL=http://localhost:4000/api
```

Keep actual secrets and credentials out of source control.

## Setup

Install dependencies at the root and in both applications:

```bash
npm install
cd backend && npm install
cd ../web && npm install
```

Configure `backend/.env`, then seed development data and start the backend:

```bash
cd backend
npm run seed
npm run dev
```

In another terminal, start the website:

```bash
cd web
npm run dev
```

Alternatively, run both servers from the repository root with `npm run dev`.
The backend listens on port `4000`; the website listens on port `5173`.

Seeded accounts are for development only (created by `npm run seed`):

| Email | Password | Role |
|---|---|---|
| admin@papertrail.com | admin123 | Admin |
| user@papertrail.com | user123 | User |

## Run and verification commands

```bash
npm run dev                 # Root: backend and website together
npm run dev:backend         # Root: backend only
npm run dev:web             # Root: website only
cd backend && npm run smoke # API smoke test; the API must be running
cd web && npm run lint
cd web && npm run build
```

## API overview

- Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- Storefront: `GET /api/books`, `GET /api/books/:id`, `GET /api/books/featured`, `GET /api/books/new-arrivals`, `GET /api/books/best-sellers`.
- Cart and orders: `/api/cart` and `/api/orders`.
- Marketplace: `GET` and `POST /api/marketplace`, plus listing detail, contact, and account endpoints. The API supports updating listings; the website interface does not provide edit/resubmit controls for rejected listings.
- Admin books: `POST /api/admin/books`, `PATCH /api/admin/books/:id`, and `DELETE /api/admin/books/:id`.
- Admin cover upload: `POST /api/admin/uploads/cover` with a multipart `cover` image (JPEG, PNG, or WebP; up to 5 MB).
- Other admin endpoints manage dashboard stats, users, orders, memberships, messages, and marketplace moderation.

All admin endpoints require an authenticated admin account.

## Admin guide: add a storefront book

Sign in with an admin account and choose **Books → Add book** in the admin panel. You can also use **Add book** from the storefront's Books page. Enter the book details, price, and stock; optionally enter an original price to show a discount. Set a cover URL or select an image to upload it, check any storefront flags, and save. The book then appears in the storefront and can be searched and purchased.

## Troubleshooting

- **API connection failed:** confirm the backend is running at `http://localhost:4000` and `VITE_API_URL` points to `/api`.
- **Database connection failed:** check the Atlas connection string, network access rules, and database credentials in `backend/.env`.
- **CORS errors:** set `CLIENT_URL` to the comma-separated website origins, then restart the backend.
- **Uploaded cover does not load:** check that the backend is reachable from the browser and configure `PUBLIC_BASE_URL` when using a reverse proxy or public hostname.
- **Port already in use:** stop the process using port `4000` or `5173`, or configure the backend `PORT` and corresponding website API URL.
