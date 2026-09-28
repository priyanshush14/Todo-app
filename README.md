# Todo App

A full-stack Todo application built to practice and demonstrate core web development fundamentals, including RESTful API design, stateless JWT authentication, MongoDB schema modeling, and dynamic vanilla JavaScript DOM manipulation.

---

## Overview

This project is a lightweight, responsive task management application featuring end-to-end user isolation, real-time interface updates, and multi-layered validation. Key highlights include:

- **User Authentication**: Secure user signup and signin powered by JWT and bcrypt.
- **Full CRUD Operations**: Create, read, update, and delete todos with persistent storage.
- **Task Status Persistence**: Toggle tasks between pending and completed states.
- **Data Isolation**: Per-user todo scoping ensuring users only access their own tasks.
- **Duplicate Prevention**: Case-insensitive and whitespace-trimmed duplicate detection on both frontend and backend.
- **User Profile Display**: Dynamically displays the authenticated user's name and username.
- **Theme Customization**: Light/Dark theme toggle with persistent preference stored in `localStorage`.
- **Responsive Interface**: Clean, mobile-friendly design without relying on frontend frameworks.
- **Polished UX**: Real-time validation checklists, password visibility toggles, and async loading states with double-submit prevention.

---

## Tech Stack

### Frontend
- **HTML5 & CSS3**: Semantic layout, responsive CSS Grid/Flexbox, and CSS custom properties (variables) for theme management.
- **Vanilla JavaScript (ES6+)**: Direct DOM manipulation, event handling, and state synchronization without external frameworks.
- **Fetch API**: Asynchronous HTTP client communicating with the REST backend.

### Backend
- **Node.js**: Server-side runtime environment.
- **Express.js**: RESTful API routing and custom middleware.
- **JSON Web Tokens (`jsonwebtoken`)**: Stateless token issuance and verification.
- **bcrypt**: Password hashing with salt rounds.
- **Zod**: Declarative schema validation for request payloads.
- **CORS**: Cross-origin resource sharing middleware.

### Database
- **MongoDB**: NoSQL document database.
- **Mongoose**: Object Data Modeling (ODM) for schema definitions and queries.
- **MongoDB Atlas**: Cloud-hosted database cluster.

### Deployment
- **Render**: Cloud hosting for both backend Web Service and frontend Static Site.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│               Frontend (Client Browser)                 │
│         Vanilla JS (ES6+) • HTML5 • Modern CSS          │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ HTTPS / REST (Fetch API)
                             │ Headers: { token: "<jwt>" }
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Backend API (Express.js)                  │
│  ├─ Input Validation Middleware (Zod)                   │
│  ├─ Authentication Middleware (JWT verification)        │
│  ├─ Password Hashing (bcrypt)                           │
│  └─ Route Handlers (Signup, Signin, Me, Todos)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Database (MongoDB Atlas)                   │
│  ├─ Users Collection (username, password, name)         │
│  └─ Todos Collection (title, done, userid -> ObjectId)  │
└─────────────────────────────────────────────────────────┘
```

### Request Flow & Data Scoping
1. **Public Routes**: Client sends registration or credentials to `/signup` or `/signin`. Inputs are validated via Zod schemas, passwords are automatically hashed with bcrypt, and on login, a signed JWT token containing the user's `ObjectId` is returned.
2. **Authenticated Routes**: For protected routes (`/me`, `/create_todo`, `/retrive_todo`, `/update_todo/:id`, `/delete_todo/:id`, `/update_todo_status/:id`), the client attaches the JWT token in the `token` request header.
3. **Middleware Extraction**: Custom `auth` middleware verifies the token signature against `JWT_SECRET` and attaches `req.userid = decodeddata.id`.
4. **Data Isolation**: All database operations scope queries with `{ userid: req.userid }`, ensuring zero cross-tenant data leakage.

---

## Authentication & Security

- **Password Hashing**: User passwords are never stored in plaintext; they are hashed using `bcrypt` (8 salt rounds) before persistence.
- **Stateless Tokens**: Authentication uses JWT tokens signed with a server-side secret key (`JWT_SECRET`).
- **Protected Endpoints**: Core endpoints require valid token validation via Express middleware before executing controller logic.
- **Environment Configuration**: Sensitive configuration details (`MONGO_URI`, `JWT_SECRET`) are loaded through environment variables (`dotenv`) and strictly excluded from version control.
- **Security Note (Learning Project)**: In this project, tokens are stored in the browser's `localStorage` for straightforward client-side state management in vanilla JavaScript. For production applications, storing tokens in `HttpOnly`, `Secure`, `SameSite` cookies alongside CSRF protection is recommended.

---

## API Endpoints

| Method | Endpoint | Access | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/signup` | Public | `{ username, password, name }` | Registers a new user account |
| `POST` | `/signin` | Public | `{ username, password }` | Authenticates credentials and returns a JWT token |
| `GET` | `/me` | Authenticated | *None* | Retrieves the authenticated user's profile (`name`, `username`) |
| `POST` | `/create_todo` | Authenticated | `{ title }` | Creates a new todo (enforces duplicate prevention) |
| `GET` | `/retrive_todo` | Authenticated | *None* | Retrieves all todos belonging to the authenticated user |
| `PUT` | `/update_todo/:id` | Authenticated | `{ newtitle }` | Updates the title of an existing todo |
| `DELETE` | `/delete_todo/:id` | Authenticated | *None* | Deletes a todo item by ID |
| `PUT` | `/update_todo_status/:id` | Authenticated | `{ done }` | Updates completion status (`true` / `false`) |

---

## Frontend Features

- **Centralized API Base**: All frontend requests flow through a single configuration constant pointing to the production backend (`https://sluglist.onrender.com`).
- **Dynamic Validation Feedback**: The signup view provides a live requirement checklist that verifies username length, password complexity, and name rules as the user types.
- **Password Visibility Toggle**: Allows users to show/hide passwords on both login and signup forms with synchronized icon indicators.
- **Async Action Loading States**: Submit and action buttons provide immediate feedback ("Logging in...", "Signing up...", "Adding...", "Saving...", "Deleting...") and disable during pending requests to prevent duplicate submissions.
- **Input Reset & Autofocus**: The todo input field clears and regains focus immediately upon successful todo creation, preserving text if an error occurs.
- **Client & Server Duplicate Protection**: Checks for duplicates on the client before making network calls, while the server enforces a case-insensitive check and returns HTTP `409 Conflict`.
- **Persistent Theme Toggle**: Light and dark themes switch cleanly using CSS variables, persisted in `localStorage`, and checked in an early `<script>` in the document `<head>` to prevent flash-of-unstyled-theme.
- **Token Handling**: Automatic redirection to `index.html` if the token is missing or expired, and cleanup upon user logout.

---

## Validation Rules

Input validation is enforced using **Zod** on the backend and paired with real-time feedback on the frontend:

- **Username**: Must be a string between `6` and `12` characters.
- **Password**: Must be between `8` and `20` characters, containing at least one uppercase letter (`[A-Z]`) and at least one special character (`[^A-Za-z0-9]`).
- **Name**: Must be at least `3` characters.
- **Todo Title**: Must be between `2` and `300` characters (trimmed of leading/trailing whitespace).
- **Todo Status**: Must be a boolean (`done: true | false`).
- **Duplicate Prevention**: Case-insensitive and trimmed check per user. Duplicate titles return HTTP `409 Conflict` with `"Todo already exists"`.

---

## Design & Development

This project was built as an educational portfolio application to strengthen practical full-stack fundamentals:

- **Core Engineering**: The backend architecture, REST API design, Mongoose database modeling, JWT authentication flow, duplicate prevention logic, and vanilla JavaScript DOM operations were designed and implemented by **Priyanshu Shah**.
- **UI & Styling Collaboration**: AI assistance was utilized as a pair-programming resource for CSS styling polish, visual aesthetic design, and responsive layout refinements.

---

## Project Structure

```text
todo-app/
├── backend/
│   ├── Db.js               # Mongoose connection schemas (User & Todo models)
│   ├── index.js            # Express server, routes, auth middleware & Zod validation
│   ├── package.json        # Dependencies (express, jsonwebtoken, mongoose, bcrypt, zod, cors)
│   └── .env                # Local environment variables (ignored in Git)
├── frontend/
│   ├── index.html          # Authentication view (Login & Signup modal cards)
│   ├── todo.html           # Main dashboard view (Todo CRUD, profile, theme toggle)
│   ├── app.js              # Auth controller, live validation & login/signup requests
│   ├── todo.js             # Todo CRUD controller, DOM rendering & status toggles
│   ├── style.css           # Global theme variables, animations & responsive styling
│   └── sluglist-logo-bw.png# Application brand asset
├── .gitignore              # Ignores node_modules/ and .env
└── README.md               # Project documentation
```

---

## Learning Outcomes

- Designing and structuring a RESTful API with Express.js and modular routing.
- Implementing stateless authentication using JWT and secure password hashing with bcrypt.
- Working with MongoDB and Mongoose for relational data modeling (`ObjectId` references).
- Performing synchronous DOM updates and managing frontend state without modern UI libraries.
- Enforcing strict multi-layer validation with Zod and building real-time UX validation indicators.
- Deploying decoupled full-stack applications with production environment configurations on Render.

---

## Deployment

- **Backend API**: Deployed as an Express Web Service on [Render](https://render.com) (`https://sluglist.onrender.com`).
- **Database**: Cloud cluster managed on [MongoDB Atlas](https://www.mongodb.com/atlas).
- **Frontend**: Deployed as a Static Site on Render connected to the frontend directory.

---

## Future Improvements

- Add category tags and priority indicators (High, Medium, Low).
- Implement due dates and calendar sorting.
- Add search and filtering options (Active, Completed, All).
- Migrate token storage to `HttpOnly` cookies with CSRF mitigation.
- Add pagination or infinite scrolling for large task lists.

---

## Author

**Priyanshu Shah**  
GitHub: [@priyanshush14](https://github.com/priyanshush14)  
Repository: [Todo-app](https://github.com/priyanshush14/Todo-app)
