# Pokedex Explorer - Frontend

React + Vite frontend for the Pokedex Explorer application.

## Features

- Browse Pokémon from PokéAPI with pagination
- Search and filter Pokémon by type
- View detailed Pokémon information with stats and abilities
- Catch Pokémon with 50% success chance
- Manage caught Pokémon with rename and release options
- Build teams with caught Pokémon (max 6 per team)
- Responsive TailwindCSS design
- Zustand for global state management
- React Router for navigation

## Prerequisites

- Node.js (v14+)
- npm or pnpm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` (optional):
```bash
VITE_API_URL=http://localhost:5000/api
```

## Running

**Development**:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Build for production**:
```bash
npm run build
```

## Project Structure

```
src/
├── api/           # API client and routes
├── components/    # Reusable React components
├── pages/         # Page components
├── stores/        # Zustand stores
├── styles/        # CSS styles
├── utils/         # Helper functions
└── main.jsx       # Entry point
```

## Key Components

- **PokemonList** - Browse and search Pokémon
- **PokemonDetail** - View Pokémon stats and abilities
- **PokemonCard** - Individual Pokémon card component
- **CatchModal** - Modal for catching Pokémon
- **MyPokemon** - Manage caught Pokémon
- **Teams** - Build and manage teams

## API Integration

The frontend uses Zustand stores to manage global state and Axios for API calls:

- `pokemonStore` - Pokémon list and details
- `caughtStore` - User's caught Pokémon
- `teamStore` - User's teams

## Note

The backend server must be running on `http://localhost:5000` for the app to work properly.
