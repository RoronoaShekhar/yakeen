# NEET Study Hub

## Overview

NEET Study Hub is a full-stack web application designed to help students prepare for the National Eligibility cum Entrance Test (NEET). The application provides access to live lectures, recorded video content, and study materials across four core NEET subjects: Physics, Chemistry, Botany, and Zoology.

## System Architecture

The application follows a monorepo structure with a clear separation between frontend and backend components:

- **Frontend**: React-based SPA using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for API data fetching and caching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Data Persistence**: In-memory storage with PostgreSQL schema ready
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Database Schema
The application defines two main entities:
- **Live Lectures**: Real-time streaming lectures with viewer counts and scheduling
- **Recorded Lectures**: On-demand video content with bookmarking and view tracking

Both entities support the four NEET subjects and include YouTube integration for video content.

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **Server Processing**: Express routes handle requests and interact with storage layer
3. **Data Storage**: Currently uses in-memory storage (MemStorage) with PostgreSQL schema defined
4. **Real-time Updates**: Automatic cleanup for expired live lectures via intervals

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

The application is configured for deployment with:
- **Build Process**: Vite builds the frontend, ESBuild bundles the backend
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Production Mode**: Serves static files from Express in production
- **Development Mode**: Hot module replacement with Vite dev server

The deployment strategy supports both development and production environments with appropriate middleware and static file serving.

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```