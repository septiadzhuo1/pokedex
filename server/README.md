# Pokedex Explorer - Backend

Express.js backend for the Pokedex Explorer application.

## Features

- RESTful API for Pokemon data (with caching)
- MongoDB integration with Mongoose
- CRUD operations for caught Pokemon
- Team management system
- CORS enabled for frontend integration

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas URI)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI

### Running

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

## API Routes

### Pokemon
- `GET /api/pokemon?limit=20&offset=0` - Get paginated Pokemon list
- `GET /api/pokemon/:id` - Get Pokemon details with evolution chain

### Caught Pokemon
- `GET /api/caught?clientId=xxx` - Get all caught Pokemon for a client
- `POST /api/caught` - Create a new caught Pokemon record
- `PUT /api/caught/:id` - Update caught Pokemon (rename)
- `DELETE /api/caught/:id` - Release a caught Pokemon

### Teams
- `GET /api/teams?clientId=xxx` - Get all teams for a client
- `POST /api/teams` - Create a new team
- `PUT /api/teams/:id` - Update a team
- `DELETE /api/teams/:id` - Delete a team

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
