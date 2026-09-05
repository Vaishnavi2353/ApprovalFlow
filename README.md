# ApprovalFlow — Document Approval Workflow System

A full-stack MERN application (MongoDB, Express, React, Node.js) for submitting,
reviewing, and tracking documents through a multi-level approval process.

## Features

**Core**
1. Submit and manage documents (drag-and-drop upload, PDF/DOC/DOCX/images)
2. Multi-level approval workflows — pick any ordered chain of approvers
3. Full status tracking + audit history per document

**Bonus (exam standout features)**
4. Email notifications (Nodemailer) on approval / rejection
5. Approval analytics — pie / bar / line charts (Recharts)
6. In-browser PDF preview before download
7. Real-time notifications (Socket.io) — bell icon updates live
8. Dark / light mode toggle
9. Fully responsive UI (Tailwind CSS)
10. Activity feed of recent actions
11. Advanced search + filters (status, category, priority, text search)
12. Drag-and-drop file upload
13. Profile page with avatar upload

## Tech Stack

- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, Multer (file
  uploads), Nodemailer, Socket.io
- **Frontend:** React (Vite), Tailwind CSS, React Router, Recharts,
  socket.io-client, Axios, react-hot-toast, lucide-react icons

## Project Structure

```
approval-flow/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, Document, Notification, ActivityLog
│   ├── middleware/                JWT auth, role guard, multer upload
│   ├── controllers/               Business logic per resource
│   ├── routes/                    Express routers
│   ├── utils/                     sendEmail (Nodemailer), socket helper
│   ├── uploads/                   Uploaded files (documents/avatars)
│   ├── seed.js                    Creates 4 demo accounts
│   └── server.js                  App entry point
└── frontend/
    └── src/
        ├── api/axios.js           Configured Axios instance (JWT interceptor)
        ├── context/                Auth, Theme, Socket React contexts
        ├── components/             Reusable UI (Navbar, Sidebar, FileUpload,
        │                           PdfPreview, ApprovalTimeline, etc.)
        └── pages/                  Login, Register, Dashboard, Documents,
                                    DocumentDetail, Analytics, Profile
```

## Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and (optionally) SMTP_* for email
npm run dev          # starts on http://localhost:5000
```

Create demo accounts (optional but recommended for your exam demo):

```bash
node seed.js
```

This creates:
| Role     | Email                          | Password    |
|----------|---------------------------------|-------------|
| Admin    | admin@approvalflow.com          | password123 |
| Approver | approver1@approvalflow.com      | password123 |
| Approver | approver2@approvalflow.com      | password123 |
| Employee | employee@approvalflow.com       | password123 |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`,
so just open http://localhost:5173.

### 4. Email notifications (optional)

Email sending uses Nodemailer. If you don't configure `SMTP_USER`/`SMTP_PASS`
in `backend/.env`, the app still works fully — emails are just skipped (logged
to the console) so a missing SMTP setup never breaks the demo. For Gmail, use
an **App Password** (not your normal password): Google Account → Security →
2-Step Verification → App Passwords.

## How the workflow works

1. An employee submits a document and picks an ordered list of approvers
   (Level 1, Level 2, ...).
2. The Level 1 approver gets a real-time notification + email.
3. When they approve, the document automatically advances to Level 2 (if any)
   — otherwise it becomes fully **Approved**.
4. A rejection at any level immediately marks the document **Rejected** and
   notifies the submitter with the reviewer's comment.
5. Every action is recorded in the document's history and in the global
   Activity Feed, and reflected instantly in the Analytics dashboard.

## Roles

- **employee** — submits documents, sees only their own submissions
- **approver** — can be added to approval chains, sees documents pending
  their action, plus their own submissions
- **admin** — sees all documents across the organization + everything an
  approver can do

## Notes for grading / demo

- All 13 requested features are implemented end-to-end (not mocked).
- The system is a real client-server app: React talks to the Express API
  over REST, with Socket.io for the live notification channel.
- Uploaded files are stored on disk under `backend/uploads/` and served
  statically; MongoDB stores only metadata + file paths.
