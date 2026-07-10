# AI Interview Preparation Platform - Frontend

This is the modern React frontend for the AI Interview Preparation Platform. It features an interactive, proctored mock interview interface, statistical dashboards, detailed feedback reports, resume analysis, and administrative tools.

## Tech Stack

*   **Core:** React (Vite)
*   **Routing:** React Router v6 (Protected routes, role checks)
*   **Styling:** Tailwind CSS v4 (Light/Dark mode theme switch, Glassmorphism)
*   **Animations:** Framer Motion (Page transitions, slide overlays, toast alerts)
*   **Charts:** Recharts (Progress trends, competency radar maps, domain distributions)
*   **Forms:** React Hook Form (Valigned logins, registrations, and profile inputs)
*   **HTTP Client:** Axios (Interceptors for Bearer header injection & silent refresh tokens)
*   **Context API:** Global State managers (Auth, Theme, Toast, Notifications)

---

## Folder Structure

```
src/
├── assets/            # Global images & icons
├── components/        # Reusable UI components
│   └── common/        # Navbar, Sidebar, Layout shell, Buttons, Loaders, Toasts, Modals, Tables, Pagination
├── context/           # Global Context Providers (Auth, Theme, Notifications, Toast)
├── routes/            # Routes definition & Protected Route guards
├── services/          # API integrations (axios instance, auth, user, interview, admin)
├── pages/             # Layout pages
│   ├── auth/          # Login, Register, Forgot Password
│   ├── dashboard/     # Student stats, Recharts trend area chart, recommended weaknesses/strengths
│   ├── interview/     # Target setup selection, active proctoring screen (mock webcam + timer), score results (radar competencies)
│   ├── profile/       # Profile inputs, skill tag manager, resume PDF uploader
│   ├── history/       # Past practices log table with search query and difficulty category filters
│   └── admin/         # Admin hub (user suspension/deletions, registration bar charts, AI token usage metrics)
```

---

## Features Implemented

1.  **JWT Authentication:** Automated storage, Bearer header insertion, and interceptor-based token refreshes on 401 expiries.
2.  **Mock Proctoring Screen:** Simulated live video scanning feed, interactive timer per question, answer submission pipelines.
3.  **Analytics Center:** Radars for clarity/articulation, overall percentage dials, and domain practice counts.
4.  **Admin Controls:** Instant user activation, suspension, account deletion, Groq provider load status check.
5.  **Clean CSS Theme Switch:** Immediate toggle between a deep dark theme and light theme.

---

## Setup & Running Locally

### 1. Prerequisite
Ensure the Java backend application is running on `http://localhost:8080`.

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

The application will run on `http://localhost:5173`. Open this URL in your web browser.
To log in as an administrator, use an administrator account credential registered in the database (or register a user and elevate their role in MongoDB database to `ADMIN`).
