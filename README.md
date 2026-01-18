<p align="center">
  <img src="naan/src/components/logo.svg" alt="WikiNITT Logo" width="120"/>
</p>

<h1 align="center">WikiNITT</h1>

<p align="center">
  <strong>The Ultimate Knowledge Hub for NIT Trichy</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#architecture">Architecture</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go"/>
  <img src="https://img.shields.io/badge/Next.js-16+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
  <img src="https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" alt="AWS EC2"/>
</p>

---

## Features

### Articles & Content

- **Rich Article System** — Create, edit, and publish articles with Markdown support
- **Featured Content** — Highlight important articles in a stunning carousel
- **Category Organization** — Browse content by departments, hostels, student life, and more
- **Full-Text Search** — Lightning-fast search powered by Meilisearch

### Community Platform

- **Groups** — Create public or private communities around shared interests
- **Posts & Discussions** — Share ideas, ask questions, and engage with peers
- **Threaded Comments** — Nested reply system for rich discussions
- **Voting System** — Upvote/downvote posts and comments to surface quality content
- **Real-time Channels** — Discussion channels within groups (with subscription support)

### Authentication & Users

- **Secure Auth** — NextAuth.js integration with JWT tokens
- **User Profiles** — Customizable profiles with avatars via Cloudinary
- **Role-Based Access** — User and Admin roles with GraphQL directive protection
- **Account Setup Flow** — Guided onboarding with username selection

### Admin Features

- **Content Management** — Admin-only article creation and editing
- **User Management** — Block/unblock users
- **Group Moderation** — Manage community groups and memberships

### Search & Discovery

- **Unified Search** — Search across articles, posts, comments, and groups
- **Instant Results** — Meilisearch-powered search with automatic indexing
- **Tab Navigation** — Separate tabs for Articles and Community search results

### Production-Ready

- **Rate Limiting** — IP-based rate limiting for API protection
- **Request Timeout** — Automatic request timeouts in production
- **Panic Recovery** — Graceful error handling middleware
- **Environment Aware** — Separate configs for development and production

---

## Tech Stack

### Backend (`gravy/`)

| Technology      | Purpose                                |
| --------------- | -------------------------------------- |
| **Go**          | High-performance backend language      |
| **gqlgen**      | Type-safe GraphQL server generation    |
| **MongoDB**     | NoSQL database with rich querying      |
| **Meilisearch** | Lightning-fast full-text search engine |
| **Cloudinary**  | Cloud-based image and media management |
| **Air**         | Live-reload for development            |
| **Docker**      | Containerized development environment  |

### Frontend (`naan/`)

| Technology          | Purpose                          |
| ------------------- | -------------------------------- |
| **Next.js 16**      | React framework with App Router  |
| **React 19**        | UI component library             |
| **TailwindCSS 4**   | Utility-first CSS framework      |
| **GraphQL Request** | Lightweight GraphQL client       |
| **TanStack Query**  | Powerful data fetching & caching |
| **Framer Motion**   | Smooth animations                |
| **React Hook Form** | Performant form management       |
| **NextAuth.js**     | Authentication for Next.js       |
| **Lucide React**    | Beautiful icon library           |

---

## Getting Started

### Prerequisites

- **Go** 1.21+
- **Node.js** 20+
- **Docker & Docker Compose**
- **Cloudinary Account** (for image uploads)

### Backend Setup

```bash
# Navigate to backend
cd gravy

# Create environment file, Configure you environment variables
cp .env.example .env

# Run the development server
docker compose up -d
```

### Frontend Setup

```bash
# Navigate to frontend
cd naan

# Install dependencies
npm install

# Create environment file, Configure you environment variables
cp .env.example .env

# Generate GraphQL types
npm run codegen

# Start development server
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:8080 (dev mode only)
- **GraphQL API**: http://localhost:8080/query
- **Meilisearch Dashboard**: http://localhost:7700

---

## Project Structure

```
wikinitt/
├── gravy/                    # Go GraphQL Backend
│   ├── cmd/                  # CLI utilities
│   │   └── create_admin/     # Admin user creation tool
│   ├── graph/                # GraphQL schema & resolvers
│   │   ├── *.graphqls        # Schema definitions
│   │   ├── *.resolvers.go    # Resolver implementations
│   │   └── model/            # Generated models
│   ├── internal/             # Internal packages
│   │   ├── articles/         # Article repository
│   │   ├── auth/             # Authentication middleware
│   │   ├── categories/       # Category management
│   │   ├── community/        # Groups, posts, comments
│   │   ├── db/               # Database connection
│   │   ├── ratelimit/        # Rate limiting
│   │   ├── sanitization/     # Input sanitization
│   │   ├── search/           # Meilisearch client
│   │   ├── uploader/         # Cloudinary integration
│   │   └── users/            # User repository
│   ├── docker-compose.yml    # Development services
│   ├── Dockerfile.dev        # Development container
│   ├── gqlgen.yml            # GraphQL codegen config
│   └── server.go             # Main server entry
│
└── naan/                     # Next.js Frontend
    ├── public/               # Static assets
    ├── src/
    │   ├── app/              # Next.js App Router pages
    │   │   ├── admin/        # Admin dashboard
    │   │   ├── articles/     # Article pages
    │   │   ├── c/            # Community pages (groups)
    │   │   ├── community/    # Community feed
    │   │   ├── u/            # User profiles
    │   │   └── ...           # Other routes
    │   ├── components/       # React components
    │   │   ├── community/    # Community-related components
    │   │   ├── profile/      # Profile components
    │   │   ├── ui/           # Reusable UI components
    │   │   └── ...           # Feature components
    │   ├── gql/              # GraphQL queries & generated types
    │   └── lib/              # Utilities
    └── tailwind.config.ts    # Tailwind configuration
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐ │
│  │  Next.js  │  │  React    │  │ TanStack  │  │   NextAuth    │ │
│  │ App Router│  │   Query   │  │   Query   │  │  (Auth.js)    │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───────┬───────┘ │
└────────┼──────────────┼──────────────┼────────────────┼─────────┘
         │              │              │                │
         └──────────────┴──────────────┴────────────────┘
                               │
                    GraphQL Request (HTTP/POST)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Go + gqlgen)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    GraphQL API Layer                       │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │  │
│  │  │ Articles│ │Community│ │  Users  │ │     Search      │  │  │
│  │  │Resolvers│ │Resolvers│ │Resolvers│ │    Resolvers    │  │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘  │  │
│  └───────┼───────────┼───────────┼───────────────┼───────────┘  │
│          │           │           │               │              │
│  ┌───────┴───────────┴───────────┴───────────────┘              │
│  │                                                               │
│  ▼                                                               │
│  ┌──────────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │   Repositories   │  │   Cloudinary  │  │   Rate Limiter  │   │
│  │  (Data Access)   │  │   (Uploads)   │  │   (Protection)  │   │
│  └────────┬─────────┘  └───────────────┘  └─────────────────┘   │
└───────────┼─────────────────────────────────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌────────────┐
│MongoDB │    │ Meilisearch│
│  (DB)  │    │  (Search)  │
└────────┘    └────────────┘
```

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for the NIT Trichy community
</p>
