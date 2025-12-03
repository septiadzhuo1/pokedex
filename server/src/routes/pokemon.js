import { Router } from 'express';
import {
  fetchPokemonList,
  fetchPokemonDetails,
  fetchPokemonSpecies,
  fetchEvolutionChain,
  fetchPokemonByGeneration,
  searchPokemon,
} from '../utils/pokeapi.js';

const router = Router();

// GET /api/pokemon/search - Search Pokemon by name
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!query || query.length < 1) {
      res.status(400).json({
        success: false,
        message: 'Search query is required and must be at least 1 character',
      });
      return;
    }

    const data = await searchPokemon(query, limit, offset);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/pokemon - Get paginated Pokemon list (with optional generation filter)
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const generation = req.query.generation ? parseInt(req.query.generation) : null;

    let data;
    if (generation && generation >= 1 && generation <= 9) {
      // Fetch by generation if specified
      data = await fetchPokemonByGeneration(generation, limit, offset);
    } else {
      // Fetch regular list if no generation specified
      data = await fetchPokemonList(limit, offset);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/pokemon/:id - Get Pokemon details
router.get('/:id', async (req, res, next) => {
  try {
    const pokemonId = String(req.params.id).toLowerCase();
    const pokemonData = await fetchPokemonDetails(pokemonId);

    // Fetch species for evolution chain
    const speciesData = await fetchPokemonSpecies(pokemonId);
    let evolutionChain = null;

    if (speciesData && speciesData.evolution_chain) {
      evolutionChain = await fetchEvolutionChain(speciesData.evolution_chain.url);
    }

    res.json({
      success: true,
      data: {
        ...pokemonData,
        evolutionChain,
      },
    });
  } catch (error) {
    if (error && error.response && error.response.status === 404) {
      res.status(404).json({
        success: false,
        message: 'Pokemon not found',
      });
      return;
    }
    next(error);
  }
});

export default router;
