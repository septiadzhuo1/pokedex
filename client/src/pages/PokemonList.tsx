import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { pokemonAPI } from '../api/client';
import PokemonCard from '../components/PokemonCard';

interface SimplePokemon {
  id: number | string;
  name: string;
  imageUrl?: string;
  types: string[];
}

const POKEMON_TYPES = [
  'fire', 'water', 'grass', 'electric', 'ice', 'fighting',
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock',
  'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

const GENERATIONS = [
  { value: '1', label: 'Gen 1 (Red/Blue)' },
  { value: '2', label: 'Gen 2 (Gold/Silver)' },
  { value: '3', label: 'Gen 3 (Ruby/Sapphire)' },
  { value: '4', label: 'Gen 4 (Diamond/Pearl)' },
  { value: '5', label: 'Gen 5 (Black/White)' },
  { value: '6', label: 'Gen 6 (X/Y)' },
  { value: '7', label: 'Gen 7 (Sun/Moon)' },
  { value: '8', label: 'Gen 8 (Sword/Shield)' },
  { value: '9', label: 'Gen 9 (Scarlet/Violet)' },
];

const extractPokemonId = (url: string): number => parseInt(url.split('/')[6]) || 0;

const getPokemonImageUrl = (pokemonId: number | string, fallback?: string): string =>
  fallback || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`;

const formatPokemonData = (pokemon: any, details?: any): SimplePokemon => {
  const pokemonId = details?.data?.id || extractPokemonId(pokemon.url);
  return {
    id: pokemonId,
    name: pokemon.name,
    imageUrl: getPokemonImageUrl(pokemonId, details?.data?.sprites?.other?.home?.front_default),
    types: details?.data?.types?.map((t: any) => t.type.name) || [],
  };
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const PokemonList: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [allPokemon, setAllPokemon] = useState<SimplePokemon[]>([]);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 2000);

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAllPokemon([]);
    setOffset(0);
    setHasMoreResults(true);
  }, [selectedType, selectedGeneration, debouncedSearchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMoreResults) {
          loadPokemonList();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [isLoading, hasMoreResults]);

  const loadPokemonList = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    try {
      let apiCall;
      
      if (debouncedSearchQuery) {
        apiCall = pokemonAPI.search(debouncedSearchQuery, limit, offset);
      } else {
        const generation = selectedGeneration ? parseInt(selectedGeneration) : undefined;
        apiCall = pokemonAPI.getList(limit, offset, generation);
      }
      
      const { data } = await apiCall;

      if (signal.aborted) return;

      // Fetch details for each Pokemon with retry logic
      const pokemonWithDetails = await Promise.all(
        data.data.results.map(async (pokemon: any) => {
          if (signal.aborted) return null;
          
          try {
            const { data: details } = await pokemonAPI.getDetail(pokemon.name);
            return formatPokemonData(pokemon, details);
          } catch (err) {
            // Retry once if fetch fails
            try {
              await new Promise(resolve => setTimeout(resolve, 100));
              const { data: details } = await pokemonAPI.getDetail(pokemon.name);
              return formatPokemonData(pokemon, details);
            } catch {
              // If still fails, return with basic data
              return formatPokemonData(pokemon);
            }
          }
        })
      );

      const validPokemon = pokemonWithDetails.filter((p): p is SimplePokemon => p !== null);

      if (!signal.aborted) {
        setAllPokemon((prev) => (offset === 0 ? validPokemon : [...prev, ...validPokemon]));
        setOffset((prev) => prev + limit);
        
        // Check if there are more results available
        const hasMore = data.data.next !== null && data.data.next !== undefined;
        setHasMoreResults(hasMore);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error loading Pokemon:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedGeneration, debouncedSearchQuery, offset, limit]);

  const filteredPokemon = allPokemon.filter((pokemon) => {
    const matchesType = !selectedType || pokemon.types.includes(selectedType);
    return matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent mb-1 sm:mb-2">
            Pokédex
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg">Discover and catch amazing Pokémon</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-12 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <span className="absolute left-4 top-3 sm:top-3.5 text-gray-400">🔍</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search Pokémon..."
                  className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Filter by Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {POKEMON_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Filter by Generation</label>
              <select
                value={selectedGeneration}
                onChange={(e) => setSelectedGeneration(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
              >
                <option value="">All Generations</option>
                {GENERATIONS.map((gen) => (
                  <option key={gen.value} value={gen.value}>
                    {gen.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-max">
          {filteredPokemon.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-gray-600 text-xl font-semibold">No Pokémon found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
          {filteredPokemon.map((pokemon, index) => (
            <div
              key={pokemon.id}
              className="animate-fade-in"
              style={{
                animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
              }}
            >
              <PokemonCard pokemon={pokemon} />
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-2 border-4 border-transparent border-b-yellow-500 rounded-full animate-spin"
                  style={{ animationDirection: 'reverse' }}
                ></div>
              </div>
              <p className="text-gray-600 font-semibold">Catching Pokémon...</p>
            </div>
          </div>
        )}

        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          {filteredPokemon.length > 0 && !isLoading && (
            <p className="text-gray-500 text-sm">Scroll to load more...</p>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PokemonList;
