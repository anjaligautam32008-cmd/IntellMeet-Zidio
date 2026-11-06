# IntellMeet – AI-Powered Enterprise Meeting & Collaboration Platform

[![Node.js CI](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19.x-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-v8.x-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.x-38bdf8.svg)](https://tailwindcss.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-orange.svg)](https://webrtc.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-black.svg)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20v7.0-47A248.svg)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)
[![Kubernetes](https://img.shields.io/badge/K8s-Production--Grade-326CE5.svg)](https://kubernetes.io)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics%20Enabled-E6522C.svg)](https://prometheus.io)

**IntellMeet** is an enterprise-grade, real-time video conferencing and meeting intelligence platform. It couples ultra-low latency WebRTC peer-to-peer audio/video streaming with automated AI meeting assistance (automated speech-to-text transcription, executive summaries, decision extraction, and Kanban task conversion).

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Seeding](#database-seeding)
  - [Running Locally](#running-locally)
- [Pre-Seeded Demo Credentials](#-pre-seeded-demo-credentials)
- [REST API Specifications](#-rest-api-specifications)
- [WebRTC & Real-Time Signaling](#-webrtc--real-time-signaling)
- [Docker & Containerized Deployment](#-docker--containerized-deployment)
- [Kubernetes & Helm Orchestration](#-kubernetes--helm-orchestration)
- [Monitoring & Observability](#-monitoring--observability)
- [Security & Testing](#-security--testing)

---

## 🌟 Key Features

1. **Ultra-Low Latency Video Conferencing (WebRTC)**:
   - Full mesh peer-to-peer WebRTC connections with STUN server resolution.
   - Dynamic video grid layout supporting multi-party video, audio, and active presenter indicators.
   - Screen sharing with seamless track replacement and real-time state broadcasts.
   - Local in-browser session recording using `MediaRecorder` API with instant WebM download.
   - Media controls: Mute/unmute microphone, enable/disable camera, device switching, and meeting status.

2. **AI-Powered Post-Meeting Intelligence**:
   - **Automated Transcription**: Generates timestamped, speaker-attributed transcripts (OpenAI Whisper with deterministic local demo fallback).
   - **Executive Summaries**: Synthesizes key discussion points, consensus decisions, and conversational sentiment.
   - **Action Item Extraction**: Identifies deliverables, assigns priority levels, and maps assignees.
   - **1-Click Kanban Conversion**: Convert extracted action items directly into active workspace tasks.

3. **Workspace Collaboration & Task Management**:
   - Real-time interactive Kanban task board synchronized across clients via Socket.io.
   - Filterable meeting history repository with search and status tags.
   - Action Items registry with completion tracking and due dates.
   - Team Analytics dashboard with real-time meeting durations, attendance, and task resolution metrics.

4. **Enterprise Grade Security & Operations**:
   - JWT authentication with secure HTTP-only refresh tokens and Bcrypt password hashing.
   - Granular role-based access control (Admin / Member).
   - Helmet HTTP header security, CORS whitelisting, and brute-force rate limiting.
   - Prometheus metrics endpoint (`/metrics`) and Kubernetes liveness/readiness probes (`/health`, `/ready`).

---

## 🏗 Architecture & Tech Stack

```
                                 ┌──────────────────────────────────────────────┐
                                 │            Client (React 19 + Vite)          │
                                 │  - Tailwind CSS + Lucide Icons               │
                                 │  - Zustand State + TanStack React Query      │
                                 │  - Native WebRTC RTCPeerConnection           │
                                 └──────────────┬───────────────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       │ REST HTTP Requests              Socket.io Events │
                       │ (/api/*)                        (WebRTC Signal)  │
                       ▼                                                 ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                          Express.js Server (TypeScript)                       │
│  - Middleware: Helmet, CORS, Rate Limit, Auth JWT, Prometheus Metrics          │
│  - Controllers: Auth, Meetings, Chat, AI, Action Items, Tasks, Workspaces     │
│  - Services: OpenAI Integration (Demo Fallback), Storage, MetricsService      │
│  - Socket.io: WebRTC Mesh Signaling, Chat Relay, Workspace Task Broadcast     │
└───────────────────────┬───────────────────────────────┬───────────────────────┘
                        │                               │
                        ▼                               ▼
       ┌─────────────────────────────────┐   ┌──────────────────────────────────┐
       │             MongoDB             │   │       Redis (Optional Cache)     │
       │  - Users, Meetings, Transcripts │   │  - In-memory fallback built-in   │
       │  - ActionItems, Tasks, Messages │   └──────────────────────────────────┘
       └─────────────────────────────────┘
```

### Technology Highlights
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack Query, Lucide React, Socket.io Client.
- **Backend**: Node.js 22, Express 4.x, TypeScript (ESM modules), Mongoose (MongoDB 7.x), Redis 7.x, Socket.io 4.8.
- **AI Engine**: OpenAI API (Whisper + GPT-4o-mini) with built-in zero-configuration Demo Mode fallback.
- **DevOps**: Docker, Docker Compose, Kubernetes, Helm v3, Prometheus, Grafana, GitHub Actions.

---

## 📂 Repository Structure

```
IntellMeet-Zidio/
├── client/                     # Frontend Single Page Application (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI, Layout, and WebRTC Meeting components
│   │   │   ├── layout/         # AppLayout, Header, Sidebar
│   │   │   ├── meeting/        # VideoTile, MeetingControls, MeetingChat, ParticipantList
│   │   │   └── ui/             # Badge, Button, Card, Input, Modal
│   │   ├── hooks/              # useWebRTC (PeerConnection, MediaRecorder, Signaling)
│   │   ├── pages/              # LandingPage, Dashboard, MeetingRoom, Lobby, Kanban, etc.
│   │   ├── services/           # Typed REST API client
│   │   ├── store/              # Zustand stores (Auth, Meeting, Theme)
│   │   └── index.css           # Design tokens, variables & dark mode styles
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend API & Real-time WebSocket Signaling
│   ├── src/
│   │   ├── config/             # Environment, MongoDB connection, Redis cache fallback
│   │   ├── controllers/        # Domain controllers (Auth, Meetings, AI, Tasks, etc.)
│   │   ├── middleware/         # Auth JWT, Rate limiting, Error handling
│   │   ├── models/             # Mongoose schemas (User, Meeting, Task, Transcript, etc.)
│   │   ├── routes/             # Express API route modules
│   │   ├── scripts/            # Database seed script (seed.ts)
│   │   ├── services/           # AI Service, Metrics Service (Prometheus), Storage
│   │   ├── socket/             # WebRTC signaling, Chat, and Task event handlers
│   │   ├── tests/              # Automated node:test API test suite
│   │   ├── app.ts              # Express application factory & middleware setup
│   │   └── server.ts           # Server entry point & graceful shutdown
│   └── package.json
├── shared/                     # Shared TypeScript interface definitions & DTOs
│   └── types/index.ts
├── docker/                     # Multi-stage production Dockerfiles
│   ├── Dockerfile.client       # Nginx static server for client build
│   └── Dockerfile.server       # Lightweight Node.js server container
├── k8s/                        # Kubernetes production manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongodb-deployment.yaml
│   ├── ingress.yaml
│   ├── namespace.yaml
│   └── configmap-secrets.yaml
├── helm/                       # Helm chart for Kubernetes deployment
│   └── intellmeet/
├── monitoring/                 # Observability configurations
│   ├── prometheus.yml          # Prometheus scrape target configuration
│   └── grafana-dashboard.json  # Grafana dashboard panels for request duration & gauges
├── security/                   # Application security documentation
│   └── OWASP-ZAP-SCAN.md       # Automated DAST testing procedure
├── jmeter/                     # Performance & load testing suite
│   ├── intellmeet-load-test.jmx
│   └── README.md
├── .github/workflows/          # Automated CI/CD pipelines
│   ├── ci.yml                  # Test, lint, and build validation
│   └── cd.yml                  # Container image build and push to GHCR
├── docker-compose.yml          # Full-stack local container orchestration
├── .env.example                # Example environment configuration
└── package.json                # Root monorepo scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **npm**: v10.x or v11.x
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas connection string.
- *(Optional)* **Redis**: Local Redis on port `6379` (an in-memory store automatically activates if Redis is absent).

### Environment Setup
Create the root `.env` configuration file:
```bash
cp .env.example .env
```

Key configuration variables in `.env`:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/intellmeet
JWT_SECRET=super_secret_jwt_key_for_development_change_in_production_32chars
DEMO_MODE=true
REDIS_ENABLED=false
PROMETHEUS_METRICS_ENABLED=true
```

> **Note**: `DEMO_MODE=true` allows full functionality (transcriptions, summaries, action item generation) without requiring an OpenAI API key. To enable production OpenAI models, set `DEMO_MODE=false` and provide your `OPENAI_API_KEY`.

### Database Seeding
Populate the database with demo users, active meetings, transcripts, and Kanban tasks:
```bash
npm run seed --prefix server
```

### Running Locally
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run each service individually:
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend Client (port 5173)
npm run dev:client
```

Open your browser at **`http://localhost:5173`**.

---

## 👥 Pre-Seeded Demo Credentials

The database seeder provisions the following accounts:

| Role | Email | Password | Pre-seeded Context |
| :--- | :--- | :--- | :--- |
| **Admin** | `alex.admin@intellmeet.io` | `Password123!` | Host privileges, Workspace owner |
| **Member** | `sarah.dev@intellmeet.io` | `Password123!` | Core Engineering team member |
| **Member** | `marcus.ops@intellmeet.io` | `Password123!` | DevOps & Reliability engineer |
| **Member** | `priya.sec@intellmeet.io` | `Password123!` | Security & Compliance engineer |

> **Quick 1-Click Access**: The login page provides 1-click quick login buttons for both Admin and Member roles without needing to type credentials manually.

### Demo Meeting Rooms
- **Active Meeting**: `INT-101-202` (Ready for live joining and testing WebRTC)
- **Completed Meeting**: `INT-492-810` (Includes AI transcripts, summaries, decisions, and action items)

---

## 📡 REST API Specifications

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register a new user account.
- `POST /api/auth/login` – Authenticate with email/password and obtain JWT token.
- `GET /api/auth/me` – Retrieve profile and role of authenticated user.
- `POST /api/auth/logout` – Clear session tokens.

### Meetings (`/api/meetings`)
- `GET /api/meetings` – List scheduled and historical meetings with search/status filters.
- `POST /api/meetings` – Create a new meeting room (generates unique formatted meeting code).
- `GET /api/meetings/:id` – Retrieve meeting details by database ID.
- `GET /api/meetings/code/:code` – Retrieve meeting details by room code (e.g. `INT-101-202`).
- `PATCH /api/meetings/:id/end` – Conclude an active meeting and record duration.

### AI Intelligence Pipeline (`/api/ai`)
- `POST /api/ai/meetings/:meetingId/transcribe` – Generate speaker-attributed transcript.
- `POST /api/ai/meetings/:meetingId/summarize` – Generate executive summary & key takeaways.
- `POST /api/ai/meetings/:meetingId/action-items` – Extract action items directly from session.
- `GET /api/ai/meetings/:meetingId/summary` – Retrieve computed summary.
- `GET /api/ai/meetings/:meetingId/transcript` – Retrieve full transcript.

### Action Items (`/api/action-items`)
- `GET /api/action-items` – Query action items by meeting, assignee, or status.
- `POST /api/action-items` – Create a new action item.
- `PATCH /api/action-items/:id` – Update status (`pending`, `in_progress`, `completed`).
- `POST /api/action-items/:id/convert-to-task` – Promote action item to a workspace Kanban task.
- `DELETE /api/action-items/:id` – Remove action item.

### Tasks & Kanban (`/api/tasks`)
- `GET /api/tasks` – List all workspace tasks.
- `POST /api/tasks` – Create a new task.
- `PATCH /api/tasks/:id` – Update task status (`todo`, `in_progress`, `done`) or priority.
- `DELETE /api/tasks/:id` – Remove task.

### Analytics & System Probes
- `GET /api/analytics/dashboard` – Fetch aggregated productivity and meeting metrics.
- `GET /health` – Liveness probe returning status of database, cache, and AI mode.
- `GET /ready` – Readiness probe for Kubernetes traffic routing.
- `GET /metrics` – Prometheus exposition metrics endpoint.

---

## 🔌 WebRTC & Real-Time Signaling

IntellMeet implements a full mesh WebRTC topology coordinated via Socket.io:

| Socket Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ meetingCode, userId, userName, isHost }` | Joins socket room and registers participant |
| `room-users` | Server ➔ Client | `{ users: [...] }` | Sends list of existing participants to initiate peer offers |
| `user-connected` | Server ➔ Room | `{ participant }` | Notifies peers of a new participant joining |
| `signal` | Bi-directional | `{ to, type, signal }` | Relays SDP offers, answers, and ICE candidates |
| `participant-media-changed`| Server ➔ Room | `{ socketId, isMuted, isVideoOff }` | Syncs mute / camera states across tiles |
| `toggle-screen-share` | Client ➔ Server | `{ isSharing }` | Relays screen share state to peer tiles |
| `send-message` | Client ➔ Server | `{ meetingCode, message, senderName }` | In-room real-time chat broadcast |
| `task-updated` | Server ➔ Workspace | `{ task }` | Live updates across Kanban boards |

---

## 🐳 Docker & Containerized Deployment

Run the entire IntellMeet platform (MongoDB, Redis, Backend, Frontend) with a single command:

```bash
docker compose up --build -d
```

### Services Started:
- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

To view container logs:
```bash
docker compose logs -f backend
```

---

## ☸️ Kubernetes & Helm Orchestration

Production manifests are located in the `k8s/` and `helm/` directories.

### Applying Kubernetes Manifests Directly
```bash
# 1. Create Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply ConfigMaps and Secrets
kubectl apply -f k8s/configmap-secrets.yaml

# 3. Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# 4. Deploy Backend & Frontend Pods
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 5. Configure Ingress Controller
kubectl apply -f k8s/ingress.yaml
```

### Deploying via Helm
```bash
helm install intellmeet ./helm/intellmeet --namespace intellmeet --create-namespace
```

---

## 📊 Monitoring & Observability

- **Prometheus Metrics**: Available at `http://localhost:5000/metrics`.
  - Gauges: `intellmeet_active_meetings`, `intellmeet_connected_sockets`.
  - Histograms: `http_request_duration_seconds` (bucketed latencies).
  - Counters: `http_requests_total` partitioned by HTTP method, route, and status code.
- **Grafana Dashboard**: Import `monitoring/grafana-dashboard.json` into Grafana to visualize server latency, active meetings, and connected sockets in real time.
- **Scrape Configuration**: `monitoring/prometheus.yml` provides standard 15-second scraping intervals against the backend service.

---

## 🛡️ Security & Testing

### Automated Test Suite
Run the backend test suite verifying authentication, route authorization, meeting code generation, action items, and Kanban tasks:
```bash
npm run test:server
```

### Apache JMeter Concurrency Testing
Execute headless load tests evaluating p95 response latencies under concurrent user loads:
```bash
jmeter -n -t jmeter/intellmeet-load-test.jmx -l results.jtl -e -o ./report
```

### OWASP ZAP Dynamic Security Baseline
Follow instructions in `security/OWASP-ZAP-SCAN.md` to execute automated vulnerability scans checking against NoSQL injection, cross-site scripting (XSS), and CORS misconfigurations.

---

## 📄 License
This project is licensed under the ISC License.
