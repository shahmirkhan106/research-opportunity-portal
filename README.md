# Research Opportunity Portal

A full-stack web application where faculty can post, view, update, close and delete research
opportunities. Students can browse open positions, view full details and see application deadlines
at a glance.

**GitHub repository:** https://github.com/shahmirkhan106/research-opportunity-portal

## Tech stack

| Layer    | Technology                                             |
|----------|--------------------------------------------------------|
| Backend  | Node.js + Express (REST API)                           |
| Database | MySQL 8 via `mysql2` connection pool                   |
| Frontend | HTML, CSS, vanilla JavaScript, Bootstrap 5 (CDN)       |
| Config   | `dotenv` (`.env` is git-ignored, `.env.example` committed) |
| Testing  | Postman collection (committed to `postman/`)           |

The Express server also serves the frontend statically, so the whole app runs with one command
(`npm start`) on `http://localhost:3000`.

## Prerequisites

- **Node.js 18+**
- **MySQL 8** (a local install or a Docker container)
- npm

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/shahmirkhan106/research-opportunity-portal.git
cd research-opportunity-portal

# 2. Create the database and table
mysql -u <user> -p < database/schema.sql

# 3. Install backend dependencies
cd backend
npm install

# 4. Configure the environment
cp .env.example .env
#    then edit .env and fill in your MySQL credentials

# 5. Start the server
npm start

# 6. Open the app
#    http://localhost:3000
```

Optional: load sample rows for manual testing only (never used by the app):

```bash
mysql -u <user> -p < database/seed.sql
```

## API documentation

Base path: `/api/opportunities` — JSON in and out, snake_case field names.

| Method | Endpoint                 | Success             | Errors                                       |
|--------|--------------------------|---------------------|----------------------------------------------|
| POST   | `/api/opportunities`     | 201 + created object| 400 validation, 500                          |
| GET    | `/api/opportunities`     | 200 + array         | 500                                          |
| GET    | `/api/opportunities/:id` | 200 + object        | 400 invalid id, 404 not found, 500           |
| PUT    | `/api/opportunities/:id` | 200 + updated object| 400 invalid id/data, 404, 500                |
| DELETE | `/api/opportunities/:id` | 200 + `{message}`   | 400 invalid id, 404, 500                     |
| GET    | `/api/health`            | 200 `{status:"ok"}` | —                                            |

Error body format:

```json
{ "error": "Human readable message", "details": ["field x is required"] }
```

### Example: create an opportunity

```bash
curl -X POST http://localhost:3000/api/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Machine Learning for Medical Imaging",
    "description": "Deep learning models for early detection of retinal diseases.",
    "research_area": "Artificial Intelligence",
    "faculty_name": "Dr. Ayesha Khan",
    "department": "Computer Science",
    "required_skills": "Python, TensorFlow, CNN",
    "positions_available": 3,
    "application_deadline": "2026-12-15",
    "status": "Open"
  }'
```

Response — `201 Created`:

```json
{
  "id": 1,
  "title": "Machine Learning for Medical Imaging",
  "description": "Deep learning models for early detection of retinal diseases.",
  "research_area": "Artificial Intelligence",
  "faculty_name": "Dr. Ayesha Khan",
  "department": "Computer Science",
  "required_skills": "Python, TensorFlow, CNN",
  "positions_available": 3,
  "application_deadline": "2026-12-15",
  "status": "Open",
  "created_at": "2026-10-07 10:15:00",
  "updated_at": "2026-10-07 10:15:00"
}
```

### Example: close an opportunity (partial update)

```bash
curl -X PUT http://localhost:3000/api/opportunities/1 \
  -H "Content-Type: application/json" \
  -d '{ "status": "Closed" }'
```

Response — `200 OK` with the updated object. `PUT` accepts any subset of fields; an empty body
returns `400`.

## Postman collection

The collection lives at `postman/research-portal.postman_collection.json` and covers all CRUD
operations, a 404 on a deleted id and a 400 validation failure.

1. Open Postman → **Import** → select the file above.
2. The collection variable `baseUrl` defaults to `http://localhost:3000`; change it if needed.
3. Run the whole collection with **Run** (requests must run in order — later requests reuse the id
   created by request #1).

## Folder structure

```
research-opportunity-portal/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/opportunityController.js
│   │   ├── middleware/errorHandler.js
│   │   ├── middleware/validateOpportunity.js
│   │   ├── routes/opportunityRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── database/
│   ├── schema.sql
│   └── seed.sql            (sample rows for manual testing only)
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js          (fetch wrappers)
│       ├── ui.js           (rendering, alerts)
│       └── app.js          (event handlers, validation)
├── postman/
│   └── research-portal.postman_collection.json
├── .gitignore
└── README.md
```

## Student details

| Field       | Value             |
|-------------|-------------------|
| Name        | M. Shahmir Khan   |
| Reg. no.    | 24P-0506          |
| Class       | BCS-5A            |
