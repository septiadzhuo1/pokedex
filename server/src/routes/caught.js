import { Router } from 'express';
import { CaughtPokemon } from '../models/CaughtPokemon.js';

const router = Router();

// GET /api/caught - Get all caught Pokemon for a client
router.get('/', async (req, res, next) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      res.status(400).json({
        success: false,
        message: 'clientId is required',
      });
      return;
    }

    const caughtPokemon = await CaughtPokemon.find({ clientId }).sort({ caughtAt: -1 });

    res.json({
      success: true,
      data: caughtPokemon,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/caught - Create a new caught Pokemon record
router.post('/', async (req, res, next) => {
  try {
    const { clientId, pokemonId, pokemonName, nickname, imageUrl } = req.body;

    if (!clientId || !pokemonId || !pokemonName || !imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: clientId, pokemonId, pokemonName, imageUrl',
      });
      return;
    }

    const caughtPokemon = new CaughtPokemon({
      clientId,
      pokemonId,
      pokemonName,
      nickname,
      imageUrl,
    });

    await caughtPokemon.save();

    res.status(201).json({
      success: true,
      data: caughtPokemon,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/caught/:id - Update a caught Pokemon (rename)
router.put('/:id', async (req, res, next) => {
  try {
    const { nickname } = req.body;

    const caughtPokemon = await CaughtPokemon.findByIdAndUpdate(
      req.params.id,
      { nickname },
      { new: true, runValidators: true }
    );

    if (!caughtPokemon) {
      res.status(404).json({
        success: false,
        message: 'Pokemon not found',
      });
      return;
    }

    res.json({
      success: true,
      data: caughtPokemon,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/caught/:id - Release a caught Pokemon
router.delete('/:id', async (req, res, next) => {
  try {
    const caughtPokemon = await CaughtPokemon.findByIdAndDelete(req.params.id);

    if (!caughtPokemon) {
      res.status(404).json({
        success: false,
        message: 'Pokemon not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Pokemon released',
      data: caughtPokemon,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
