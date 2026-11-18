# Book Haven: Viva Notes (in simple language)

Read this before your demonstration. If you can explain these pages, you can explain the project.

---

## 1. The big picture

```
Browser (React)  --fetch (JSON)-->  Express API  --SQL-->  MySQL
 pages + components                 routes -> controllers       users, books, transactions
```

- **React** draws the screens and keeps what you type in memory (state).
- **Express** receives HTTP requests, checks who you are and what you may do, validates the data and talks to MySQL.
- **MySQL** stores all the data permanently. The browser only remembers the login (user + token).

---

## 2. Frontend concepts

**What is React?** A JavaScript library for building user interfaces out of small reusable pieces. When data changes, React updates only the parts of the page that need it.

**What are components?** Functions that return a piece of the page. Examples in my project: `Navbar`, `BookList`, `AddBookForm`, `UserForm`, `StatCard`. Small components can be reused and combined into pages (`Books.jsx` uses `AddBookForm`, `SearchBar`, `BookList`, `Modal` and `ConfirmDialog`). This is called **component composition**.

**What is JSX?** The HTML-like syntax inside JavaScript, e.g. `<button onClick={save}>Save</button>`. The build tool (Vite) turns it into normal JavaScript. `{ }` lets me put JavaScript values inside it.

**What does `useState` do?** It gives a component a piece of memory. `const [books, setBooks] = useState([])` gives the current value and a function to change it. Calling `setBooks` makes React draw the component again with the new value.

**What does `useEffect` do?** It runs code after the component is drawn, for things outside React such as loading data or timers. The dependency array (`[reload]`) says when to run it again. A function returned from the effect is the **cleanup** (e.g. cancel a timer).

**Other hooks I used:** `useContext` (read the logged-in user from `AuthContext`), `useCallback`/`useMemo` (keep a function or value stable), `useId` (unique ids for form labels), `useSearchParams` (read `?search=` from the URL). I also wrote two **custom hooks**: `useAsync` (load data and track loading/error) and `useDebounce` (wait until the user stops typing).

**What does React Router do?** It shows a different page for each URL without reloading the browser: `/` Dashboard, `/books`, `/transactions`, `/users`, `/login`. `ProtectedRoute` redirects to `/login` if you are not logged in and to `/` if your role is not allowed.

**What are controlled forms?** Forms where React state is the single source of truth: each input has `value={state}` and an `onChange` that updates the state. This lets me validate and clear the form easily.

**What is validation?** Checking data before accepting it (required fields, ISBN format, quantity at least 1, matching passwords). I validate in the browser for quick feedback **and again on the server**, because anyone can send requests without using my page.

**Where do fetch calls live?** All in `frontend/src/services/api.js`. Components call functions like `getBooks()`. That file adds the JWT token to each request and turns errors into readable messages.

**Where is the logged-in user stored?** In `AuthContext` (shared with all components) and `localStorage` (so a page refresh keeps you logged in). After a refresh the app asks `GET /auth/me` to check the token is still valid.

---

## 2b. Backend and database concepts

**What is an API?** A set of URLs that a program can call to get or change data. My React app is the client; Express is the server.

**What does REST mean?** A style of API design: each kind of data is a resource with a URL (`/books`) and the HTTP method says the action: GET = read, POST = create, PUT = update, DELETE = remove. Responses are JSON with status codes (200 OK, 201 created, 400 bad input, 401 not logged in, 403 not allowed, 404 not found, 409 conflict).

**What does Express.js do?** It is the web framework for Node.js. It matches the URL and method to a function. Folders:
- `routes/` - which URL goes to which controller (and which middleware runs first)
- `controllers/` - the logic for each endpoint (runs the SQL)
- `middleware/` - code that runs before controllers (authentication, role check, validation, errors)
- `config/db.js` - the MySQL connection pool

**What is middleware?** A function that runs between the request and the controller. A request to `POST /books` passes through: `cors` -> `express.json()` -> `authenticate` (valid token?) -> `requireRole` (staff?) -> `validateBody` (valid data?) -> controller. If any step fails, the request stops there with an error.

**What does MySQL do?** It stores the data in tables with rules (constraints):
- `users` (membership_id is UNIQUE, password is a hash)
- `books` (isbn is UNIQUE, `available_quantity >= 0`, `initial_quantity >= 1`)
- `transactions` (links to a book and a user with FOREIGN KEYS)

**How does the frontend talk to the backend?** React calls `fetch('http://localhost:5000/books', { headers: { Authorization: 'Bearer <token>' } })`. Express answers with JSON. React puts the JSON in state and draws it. `cors()` is needed because the two apps run on different ports (5173 and 5000) and browsers block that by default.

**What is SQL injection and how do I prevent it?** Attackers typing SQL into a form. I always use parameterised queries (`WHERE id = ?` with the values passed separately), so input is never executed as SQL.

---

## 3. Security

**What is JWT authentication?** After a correct login the server creates a signed token (JSON Web Token) containing the user's id and role. The browser sends it on every request. The server checks the signature with `JWT_SECRET`; if it is valid the user is "logged in", with no session stored on the server. Tokens expire after 8 hours.

**How are passwords protected?** They are never stored as plain text. `bcrypt` turns a password into a salted one-way hash (`$2b$10$...`). At login, `bcrypt.compare` hashes the typed password the same way and compares. Nobody, including me, can read the original password from the database. Hashes are never sent to the browser. Login errors use one generic message ("Invalid membership ID or password") so attackers cannot tell which part was wrong.

**How are roles enforced?** The frontend hides links and pages, but the real protection is in the backend: `requireRole('administrator')` returns 403 if the role is wrong. Members cannot call transaction or user endpoints even if they use another tool.

**Where are secrets kept?** In `backend/.env` (not uploaded to GitHub). `.env.example` shows the variable names without real values.

---

## 4. How book quantities are updated

`books.available_quantity` is the current stock. Only `POST /transactions` changes it (or an editor correcting it in the Edit Book form).

**Borrow:** check the book has enough copies -> reduce `available_quantity` -> insert a `BORROW` row.
**Stock arrival:** increase `available_quantity` -> insert a `STOCK_ARRIVAL` row.

These two writes happen in one **database transaction** (`beginTransaction` ... `commit`, or `rollback` on any error). Either both happen or neither does, so stock and history cannot disagree. `SELECT ... FOR UPDATE` locks the book row during the transaction, so two people cannot borrow the last copy at the same time. The database also has `CHECK (available_quantity >= 0)` as a last safety net. The dashboard simply counts and sums the rows with SQL, so the numbers are always real.

---

## 5. How the pages work together

1. **Login** -> `POST /auth/login` -> token + user saved -> go to Dashboard.
2. **Dashboard** -> `GET /dashboard` -> stat cards, low-stock table (< 2 copies, red) and recent transactions.
3. **Books** -> `GET /books?search=` / `POST` / `PUT` / `DELETE`. The navbar search box sends you here with the search word filled in.
4. **Transactions** -> `POST /transactions` changes stock. The Books page and Dashboard then show the new numbers.
5. **Users** -> `/users` endpoints (admin only). New users can then log in and appear in the "Borrowing user" list.

**Follow one request: borrowing a book.** Click *Confirm borrowing* -> `TransactionForm` validates -> `createTransaction()` in `api.js` sends `POST /transactions` with the token -> Express runs `authenticate`, `requireRole`, `validateBody` -> `transactionController` opens a database transaction, checks and updates stock, inserts history, commits -> JSON `201` comes back -> the page shows a green message and reloads books and history.

---

## 6. Possible lecturer questions and simple answers

1. **Why React instead of plain HTML/JS?** Components make the code reusable and organised, and React updates the screen automatically when state changes.
2. **What is the virtual DOM?** React keeps a lightweight copy of the page in memory, compares it with the new version and updates only what changed in the real page.
3. **What is the difference between props and state?** Props are values a parent passes to a child (read-only). State is a component's own memory that can change.
4. **Why do list items need a `key`?** So React can identify each item and update, add or remove the right ones efficiently.
5. **What is "lifting state up"?** Keeping shared data in the parent. `Books.jsx` owns the book list and the forms only tell it "something changed" (`onAdded`), then it reloads.
6. **Why do you validate on the server as well?** The browser can be bypassed, so the server must never trust it.
7. **Why a connection pool?** It reuses open database connections instead of opening a new one for every request, which is faster.
8. **What is `express.json()`?** Middleware that reads a JSON request body and puts it in `req.body`.
9. **What is `asyncHandler`?** Express 4 does not catch errors from async functions; this wrapper passes them to the error handler.
10. **What is the difference between authentication and authorization?** Authentication = proving who you are (login/JWT). Authorization = what you are allowed to do (roles).
11. **What stops negative stock?** Three layers: the form check, the controller check inside the transaction, and the database `CHECK` constraint.
12. **What happens to history when a book or user is deleted?** Deleting a book also deletes its transactions (`ON DELETE CASCADE`). Deleting a user keeps the history and sets the user to NULL (`ON DELETE SET NULL`).
13. **Why is the ISBN stored without dashes?** So uniqueness works: `978-0-306-40615-7` and `9780306406157` are the same book.
14. **How is low stock decided?** `available_quantity < 2`, in the dashboard query and in the table styling.
15. **What would you improve next?** Add a "return book" transaction with due dates, pagination for long tables, password reset, and automated tests.
16. **Why is the token in localStorage?** To survive a page refresh. The trade-off is that scripts on the page can read it, so a production system would use secure httpOnly cookies.

---

## 7. Demo checklist (about 5 minutes)

1. Log in as `ADM001` / `Admin@123`. Show the dashboard and the red low-stock books.
2. Books: try to add an empty form (validation), add a real book, search for it, edit it, delete it (confirmation dialog).
3. Transactions: borrow more copies than available (error), borrow a valid amount, add a stock arrival, show the history and the changed numbers on the dashboard.
4. Users: register a user (show password confirmation), change their role, delete them.
5. Log out, log in as `MEM001` / `Member@123`: only Dashboard and Books (read-only).
6. Refresh the browser (still logged in) and shrink the window to show the mobile layout.
