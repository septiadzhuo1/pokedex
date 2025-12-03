import { FC, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Dynamic imports - components load only when needed
const PokemonList = lazy(() => import('./pages/PokemonList'));
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'));
const MyPokemon = lazy(() => import('./pages/MyPokemon'));
const Teams = lazy(() => import('./pages/Teams'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-2 border-4 border-transparent border-b-yellow-500 rounded-full animate-spin"
          style={{ animationDirection: 'reverse' }}
        ></div>
      </div>
      <p className="text-white font-semibold">Loading...</p>
    </div>
  </div>
);

const App: FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        {/* Navigation */}
        <nav className="bg-white shadow-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
                <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent hover:scale-105 transition-transform">
                  🔴 Pokedex
                </span>
              </Link>
              <div className="flex space-x-1 sm:space-x-2">
                <Link
                  to="/"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-100 transition-all font-semibold text-xs sm:text-sm text-gray-700 hover:text-red-600 hover:shadow-md"
                >
                  Explore
                </Link>
                <Link
                  to="/my-pokemon"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-100 transition-all font-semibold text-xs sm:text-sm text-gray-700 hover:text-red-600 hover:shadow-md"
                >
                  My Pokémon
                </Link>
                <Link
                  to="/teams"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-100 transition-all font-semibold text-xs sm:text-sm text-gray-700 hover:text-red-600 hover:shadow-md"
                >
                  Teams
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<PokemonList />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/my-pokemon" element={<MyPokemon />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
