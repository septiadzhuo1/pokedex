import axios from 'axios';
import { getFromCache, setCache } from './cache.js';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const cacheKey = `pokemon-list-${limit}-${offset}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error?.message || error);
    throw error;
  }
};

export const fetchPokemonDetails = async (pokemonId) => {
  const cacheKey = `pokemon-${pokemonId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${POKEAPI_BASE}/pokemon/${pokemonId}`);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon ${pokemonId}:`, error?.message || error);
    throw error;
  }
};

export const fetchPokemonSpecies = async (pokemonId) => {
  const cacheKey = `pokemon-species-${pokemonId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${POKEAPI_BASE}/pokemon-species/${pokemonId}`);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon species ${pokemonId}:`, error?.message || error);
    throw error;
  }
};

export const fetchEvolutionChain = async (evolutionChainUrl) => {
  const cacheKey = `evolution-chain-${evolutionChainUrl}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(evolutionChainUrl);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching evolution chain:', error?.message || error);
    throw error;
  }
};

export const fetchPokemonByGeneration = async (generation = 1, limit = 20, offset = 0) => {
  // Cache key for the full sorted generation (not including pagination params)
  // Added version suffix to force cache refresh when logic changes
  const fullCacheKey = `pokemon-generation-${generation}-full-v4`;
  let sortedPokemon = getFromCache(fullCacheKey);

  if (!sortedPokemon) {
    try {
      // Get all Pokemon from the generation
      const generationResponse = await axios.get(`${POKEAPI_BASE}/generation/${generation}`);
      const allPokemonInGen = generationResponse.data.pokemon_species;

      // Fetch details and evolution info for all pokemon in generation
      const pokemonWithEvoInfo = await Promise.all(
        allPokemonInGen.map(async (pokemon) => {
          try {
            const speciesData = await fetchPokemonSpecies(pokemon.name);
            // Extract ID from the species URL (format: /pokemon-species/{id}/)
            const speciesId = parseInt(pokemon.url.split('/').filter(Boolean).pop());
            return {
              name: pokemon.name,
              url: pokemon.url,
              id: speciesId,
              evolves_from_species: speciesData.evolves_from_species,
              evolution_chain: speciesData.evolution_chain,
            };
          } catch (error) {
            console.error(`Error fetching species for ${pokemon.name}:`, error?.message);
            return {
              name: pokemon.name,
              url: pokemon.url,
              id: 999999, // fallback to high number if ID cannot be parsed
              evolves_from_species: null,
              evolution_chain: null,
            };
          }
        })
      );

      // Get base forms by finding the root of each evolution chain and track their IDs
      const baseFormMap = {};
      const baseFormIds = {}; // Track the minimum ID for each base form
      const pokemonWithoutChain = [];

      for (const pokemon of pokemonWithEvoInfo) {
        if (!pokemon.evolution_chain) {
          pokemonWithoutChain.push(pokemon);
          continue;
        }

        try {
          const chainData = await fetchEvolutionChain(pokemon.evolution_chain.url);
          const baseFormName = chainData.chain.species.name;
          
          if (!baseFormMap[baseFormName]) {
            baseFormMap[baseFormName] = [];
            baseFormIds[baseFormName] = 999999; // Initialize with high number
          }
          
          baseFormMap[baseFormName].push(pokemon);
          // Track the minimum ID for this base form (the actual base form)
          if (pokemon.id < baseFormIds[baseFormName]) {
            baseFormIds[baseFormName] = pokemon.id;
          }
        } catch (error) {
          console.error(`Error fetching evolution chain:`, error?.message);
          pokemonWithoutChain.push(pokemon);
        }
      }

      // Map of starter Pokemon by generation
      const startersByGeneration = {
        1: ['bulbasaur', 'charmander', 'squirtle'],
        2: ['chikorita', 'cyndaquil', 'totodile'],
        3: ['treecko', 'torchic', 'mudkip'],
        4: ['piplup', 'chimchar', 'turtwig'],
        5: ['snivy', 'tepig', 'oshawott'],
        6: ['chespin', 'fennekin', 'froakie'],
        7: ['rowlet', 'litten', 'popplio'],
        8: ['grookey', 'scorbunny', 'sobble'],
        9: ['sprigatito', 'fuecoco', 'quaxo'],
      };

      const starters = startersByGeneration[generation] || [];

      // Sort evolution families with starters first, then by ID for others
      const sortedFamilyNames = Object.keys(baseFormMap).sort((a, b) => {
        const aIsStarter = starters.includes(a) ? 0 : 1;
        const bIsStarter = starters.includes(b) ? 0 : 1;
        
        // If both starters, sort by their order in the starters array
        if (aIsStarter === 0 && bIsStarter === 0) {
          return starters.indexOf(a) - starters.indexOf(b);
        }
        
        // If both non-starters, sort by their ID (Pokedex number)
        if (aIsStarter === 1 && bIsStarter === 1) {
          return baseFormIds[a] - baseFormIds[b];
        }
        
        // Starters come before non-starters
        return aIsStarter - bIsStarter;
      });

      // Build sorted pokemon list with starters first
      sortedPokemon = [];
      for (const baseForm of sortedFamilyNames) {
        const family = baseFormMap[baseForm];
        // Sort within family by evolution stage (base form first)
        family.sort((a, b) => {
          const aIsBase = a.name === baseForm ? 0 : 1;
          const bIsBase = b.name === baseForm ? 0 : 1;
          return aIsBase - bIsBase;
        });
        sortedPokemon.push(...family);
      }

      // Add any pokemon without evolution chains at the end
      sortedPokemon.push(...pokemonWithoutChain);

      // Cache the full sorted list
      setCache(fullCacheKey, sortedPokemon);
    } catch (error) {
      console.error(`Error fetching Pokemon for generation ${generation}:`, error?.message || error);
      throw error;
    }
  }

  // Apply pagination to the cached sorted list
  const paginatedPokemon = sortedPokemon.slice(offset, offset + limit);

  // Map to the format we need (remove extra fields)
  const results = paginatedPokemon.map((p) => ({
    name: p.name,
    url: p.url,
  }));

  const data = {
    count: sortedPokemon.length,
    next: offset + limit < sortedPokemon.length ? true : null,
    previous: offset > 0 ? true : null,
    results,
  };

  return data;
};

// Search for Pokemon by name across all 1000+ Pokemon
export const searchPokemon = async (searchQuery, limit = 20, offset = 0) => {
  const cacheKey = `pokemon-search-${searchQuery.toLowerCase()}-${limit}-${offset}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all 1025 Pokemon from the main list
    const response = await axios.get(`${POKEAPI_BASE}/pokemon?limit=1025&offset=0`);
    const allPokemon = response.data.results;

    // Filter by search query (case-insensitive)
    const query = searchQuery.toLowerCase();
    const filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );

    // Apply pagination to filtered results
    const paginatedPokemon = filteredPokemon.slice(offset, offset + limit);

    const data = {
      count: filteredPokemon.length,
      next: offset + limit < filteredPokemon.length ? true : null,
      previous: offset > 0 ? true : null,
      results: paginatedPokemon,
    };

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error searching Pokemon:', error?.message || error);
    throw error;
  }
};
