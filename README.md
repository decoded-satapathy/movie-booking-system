# Movie Booking System

This project is a simplified, full-stack web application for a movie booking system, similar to BookMyShow. It includes a robust backend API and a dynamic frontend user interface with real-time features.

## Tech Stack

### Backend
- **Framework:** Express.js (with TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) with `bcrypt` for password hashing
- **Real-time:** Socket.IO for real-time seat concurrency
- **Caching/Temp Storage:** Redis for temporary seat locks
- **Utilities:** `express-rate-limit` for API request limiting

### Frontend
- **Framework:** React.js (with TypeScript)
- **UI Components:** ShadCN UI
- **Routing:** React Router DOM
- **State Management:** React hooks (`useState`, `useEffect`)

## Project Setup and Local Development

### 1. Prerequisites

- Node.js (v18 or higher)
- npm
- PostgreSQL
- Redis

### 2. Backend Setup

1.  Navigate to the `backend` directory.
    ```bash
    cd backend
    ```

2.  Install backend dependencies.
    ```bash
    npm install
    ```

3.  Configure your environment variables. Create a `.env` file in the `backend` directory and add your database connection URL, a JWT secret, and the Redis URL.
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/your_db_name"
    JWT_SECRET="your_very_secret_and_long_random_key"
    REDIS_URL="redis://localhost:6379"
    ```

4.  Run the Prisma migrations to create the database tables.
    ```bash
    npx prisma migrate dev
    ```

5.  Seed the database with initial data (cinemas, movies, shows, and a test admin user).
    ```bash
    npm run seed
    ```

6.  Start the backend development server.
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.

### 3. Frontend Setup

1.  Navigate to the `frontend` directory.
    ```bash
    cd frontend
    ```

2.  Install frontend dependencies.
    ```bash
    npm install
    ```

3.  Start the frontend development server.
    ```bash
    npm run dev
    ```
    The application will open in your browser, typically at `http://localhost:5173`.

### Sample Credentials
- **Email** : ``` user@example.com ```
- **Password** : ```password```

## Database Schema Explanation

The database schema is designed to support a clear, relational structure for a movie booking system.

- **`User`**: Stores user authentication details, including a hashed password and an `isAdmin` flag.
- **`Cinema`**: Represents a movie theater with a name and location.
- **`Screen`**: Manages screens within a `Cinema` (one-to-many relationship).
- **`Movie`**: Contains details about a movie, such as title and description.
- **`Show`**: Links a `Movie` and a `Screen` at a specific `showtime` (many-to-many relationship).
- **`Booking`**: A core table that links a `User` and a `Show`, storing an array of selected `seats`.

Relationships are defined with Prisma's `@relation` attribute, with **cascading deletes** implemented where logical (e.g., deleting a `Cinema` automatically deletes all its `Screen` records).

