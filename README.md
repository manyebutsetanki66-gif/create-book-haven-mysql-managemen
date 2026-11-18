# Book Haven - Library Management System

A full-stack web application for running a small library: log in, manage books and stock, record borrowing, manage users and see live statistics.

Built for **Web Application Development (BIWA2110)**, Limkokwing University of Creative Technology.

**React (Vite) -> Fetch API -> Express REST API -> MySQL**

---

## 1. Main features

- **Login and roles:** membership ID + password, JWT authentication, bcrypt password hashing, protected routes, three roles (Administrator, Librarian, Member).
- **Dashboard:** total books, available copies, registered users, low-stock count, low-stock books (fewer than 2 copies, highlighted in red) and recent transactions. All numbers are calculated from the database.
- **Books:** add, view, search, edit and delete. Each book has title, author, genre, ISBN (unique), initial quantity and available quantity.
- **Transactions:** borrow a book (stock goes down) or record a stock arrival (stock goes up), with a full history (ID, book, user, type, quantity, date and time). Stock is updated inside a database transaction.
- **Users:** register (with password confirmation), view, search, edit, delete and assign roles (administrators only).
- **Responsive design** for desktop and mobile, loading indicators, error and success messages, confirmation dialogs before deleting.

### Who can do what

| | Administrator | Librarian | Member |
| --- | :---: | :---: | :---: |
| Dashboard | yes | yes | yes (no transactions list) |
| View and search books | yes | yes | yes |
| Add / edit / delete books | yes | yes | no |
| Transactions page | yes | yes | no |
| Users page | yes | no | no |

## 2. Technologies

| Part | Technology |
| --- | --- |
| Frontend | React 19 (JavaScript/JSX), Vite, React Router 6, plain CSS, hooks (`useState`, `useEffect` and others) |
| Backend | Node.js, Express 4, REST API, JWT (`jsonwebtoken`), `bcrypt`, `cors`, `dotenv`, `mysql2` |
| Database | MySQL 8 (MariaDB 10.5+ also works) |
| Icons | Font Awesome (loaded from a CDN, the app works without it) |

## 3. Project structure

```
book-haven/
├── frontend/
│   ├── public/                  favicon
│   ├── src/
│   │   ├── components/          Navbar, BookList, AddBookForm, EditBookForm, UserForm, UserList,
│   │   │                        TransactionForm, TransactionList, StatCard, Modal, ConfirmDialog,
│   │   │                        Alert, Loader, FormField, SearchBar, ProtectedRoute ...
│   │   ├── pages/               Login, Dashboard, Books, Transactions, Users, NotFound
│   │   ├── context/             AuthContext.jsx   (who is logged in)
│   │   ├── services/            api.js            (every fetch call)
│   │   ├── hooks/               useAsync.js, useDebounce.js
│   │   ├── utils/               validators.js, format.js
│   │   ├── App.jsx, main.jsx, index.css
│   ├── .env.example, index.html, package.json, vite.config.js
├── backend/
│   ├── config/                  db.js (MySQL connection pool)
│   ├── controllers/             auth, dashboard, book, transaction, user
│   ├── middleware/              auth.js (JWT + roles), validate.js, errorHandler.js
│   ├── routes/                  auth, dashboard, books, transactions, users
│   ├── utils/                   asyncHandler.js, HttpError.js, resetDemoPasswords.js
│   ├── server.js, package.json, .env.example
├── database/
│   ├── schema.sql               creates the database and tables
│   └── seed.sql                 sample admin, users, books and transactions
├── README.md, VIVA_NOTES.md, LICENSE, .gitignore
```

## 4. What you need installed

- **Node.js 18 or newer** (check: `node -v`) from https://nodejs.org
- **MySQL 8** running locally (or XAMPP/MariaDB), plus the `mysql` command or MySQL Workbench / phpMyAdmin
- **Git** (check: `git --version`)

## 5. Installation and running, step by step

### 1) Get the code

```bash
git clone https://github.com/<your-username>/book-haven.git
cd book-haven
```

(If you received a ZIP file instead, extract it and open a terminal inside the `book-haven` folder.)

### 2) Create and fill the database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Enter your MySQL password when asked. This creates the `book_haven` database with sample data.

> **MySQL Workbench:** open each file and click the lightning button (schema first, then seed).
> **phpMyAdmin (XAMPP):** Import tab -> choose `schema.sql` -> Go, then the same for `seed.sql`.

### 3) Configure and start the backend

```bash
cd backend
npm install
```

Create your environment file:

- macOS / Linux / Git Bash: `cp .env.example .env`
- Windows Command Prompt: `copy .env.example .env`

Open `backend/.env` and set at least:

| Variable | Meaning |
| --- | --- |
| `DB_PASSWORD` | your MySQL password (leave empty if none) |
| `JWT_SECRET` | any long random text. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `DB_USER`, `DB_HOST`, `DB_PORT`, `DB_NAME` | change only if your MySQL setup differs (defaults: root, localhost, 3306, book_haven) |
| `PORT` | API port (default 5000) |
| `CLIENT_ORIGIN` | address of the React app (default http://localhost:5173) |

Start the backend:

```bash
npm run dev
```

You should see `Book Haven API running on http://localhost:5000` and `Database connection OK`.

### 4) Configure and start the frontend (new terminal)

```bash
cd frontend
npm install
```

Create the environment file the same way (`cp .env.example .env` or `copy .env.example .env`). The default `VITE_API_URL=http://localhost:5000` is correct unless you changed the backend `PORT`.

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

Other useful commands: `npm run build` (production build of the frontend), `npm start` (run the backend without auto-restart).

## 6. Sample login accounts

| Membership ID | Password | Role |
| --- | --- | --- |
| `ADM001` | `Admin@123` | Administrator |
| `LIB001` | `Librarian@123` | Librarian |
| `MEM001` | `Member@123` | Member |
| `MEM002` | `Member@123` | Member |
| `MEM003` | `Member@123` | Member |

These are demo accounts for testing. Change the passwords before using the system for real.

## 7. API overview

All endpoints except `POST /auth/login` need the header `Authorization: Bearer <token>`. Errors always look like `{ "success": false, "message": "..." }`.

| Method | Endpoint | Allowed roles | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | public | Log in, returns user and token |
| GET | `/auth/me` | any logged-in user | Check the saved token |
| GET | `/dashboard` | any logged-in user | Statistics, low-stock books, recent transactions (staff only) |
| GET | `/books?search=` | any logged-in user | List or search books |
| GET | `/books/:id` | any logged-in user | One book |
| POST | `/books` | administrator, librarian | Add a book |
| PUT | `/books/:id` | administrator, librarian | Update a book |
| DELETE | `/books/:id` | administrator, librarian | Delete a book |
| GET | `/transactions` | administrator, librarian | Transaction history |
| GET | `/transactions/:id` | administrator, librarian | One transaction |
| POST | `/transactions` | administrator, librarian | Record `BORROW` or `STOCK_ARRIVAL` |
| GET | `/users?search=` | administrator, librarian | List or search users |
| GET | `/users/:id` | administrator, librarian | One user |
| POST | `/users` | administrator | Register a user |
| PUT | `/users/:id` | administrator | Update a user (password optional) |
| DELETE | `/users/:id` | administrator | Delete a user |

Status codes used: 200, 201, 400 (invalid input, insufficient stock), 401 (not logged in), 403 (no permission), 404 (not found), 409 (duplicate ISBN or membership ID), 503 (database unreachable), 500 (server error).

## 8. Business rules

- A new book starts with `available_quantity = initial_quantity` (initial quantity must be at least 1).
- A borrow is rejected if it asks for more copies than are available, or for zero/negative quantity.
- A stock arrival increases the available quantity. (Returns are not part of the brief: record returned copies as a stock arrival.)
- Stock update and history record are saved together in one database transaction with a row lock, so the numbers can never become inconsistent.
- Deleting a book also deletes its history. Deleting a user keeps their past transactions (shown as "Deleted user").
- Passwords need at least 8 characters with a letter and a number. An administrator cannot delete their own account or remove their own administrator role.

## 9. Troubleshooting

| Problem | Fix |
| --- | --- |
| Backend prints `Missing JWT_SECRET` | You have not created `backend/.env`, or `JWT_SECRET` is empty. |
| `Database connection FAILED (ECONNREFUSED)` | MySQL is not running. Start it (Services, XAMPP or Workbench). |
| `Database connection FAILED (ER_ACCESS_DENIED_ERROR)` | Wrong `DB_USER` / `DB_PASSWORD` in `backend/.env`. |
| `ER_BAD_DB_ERROR` / unknown database | Run `schema.sql` (step 2). |
| App shows "Cannot reach the server" | The backend is not running, or `VITE_API_URL` is wrong. Restart both servers after editing any `.env`. |
| Browser console shows a CORS error | `CLIENT_ORIGIN` in `backend/.env` must equal the address in the browser bar (e.g. `http://localhost:5173`). |
| `EADDRINUSE` port already in use | Change `PORT` in `backend/.env` (and `VITE_API_URL` in `frontend/.env`). |
| "Invalid membership ID or password" for demo users | Re-run `schema.sql` and `seed.sql`, or run `npm run reset:passwords` inside `backend`. |
| `bcrypt` fails to install | Use Node 18 or 20 LTS, delete `node_modules` and run `npm install` again. |
| Icons missing | Font Awesome loads from the internet. The app still works without it. |
| You are logged out unexpectedly | Tokens expire after 8 hours (`JWT_EXPIRES_IN`). Log in again. |

## 10. Testing notes

While building, the API was tested with real HTTP requests against a MariaDB 10.11 database (login, role checks, CRUD, duplicate and invalid input, stock rules, rollback, database-down error). The React app was tested with an automated integration run (jsdom) against the live API: login, protected routes, dashboard numbers, book add/edit/search, borrowing and stock arrival, user registration/delete, session refresh and role restrictions. The visual layout and the mobile view were **not** checked in a real browser, so please look at them yourself before your demonstration (resize the browser window to check the mobile layout).

## 11. Upload to GitHub

1. Create a new **empty** repository on https://github.com (do not add a README, `.gitignore` or licence there).
2. In the project root (`book-haven`):

```bash
git init
git add .
git commit -m "Initial commit: Book Haven library management system"
git branch -M main
git remote add origin https://github.com/<your-username>/book-haven.git
git push -u origin main
```

3. Check on GitHub that there is no `node_modules` folder and no `.env` file (the `.gitignore` already excludes them; only `.env.example` files are uploaded).

If GitHub asks for a password, use a **Personal Access Token** (Settings -> Developer settings -> Personal access tokens) or sign in through Git Credential Manager.

Later changes:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

## 12. Licence

MIT, see `LICENSE`.
