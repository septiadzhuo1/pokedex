import { Router } from 'express';
import { Team } from '../models/Team.js';

const router = Router();

// GET /api/teams - Get all teams for a client
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

    const teams = await Team.find({ clientId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/teams - Create a new team
router.post('/', async (req, res, next) => {
  try {
    const { clientId, teamName, members } = req.body;

    if (!clientId || !teamName) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: clientId, teamName',
      });
      return;
    }

    if (members && members.length > 6) {
      res.status(400).json({
        success: false,
        message: 'Team cannot have more than 6 members',
      });
      return;
    }

    const team = new Team({
      clientId,
      teamName,
      members: members || [],
    });

    await team.save();

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/teams/:id - Update a team
router.put('/:id', async (req, res, next) => {
  try {
    const { teamName, members } = req.body;

    if (members && members.length > 6) {
      res.status(400).json({
        success: false,
        message: 'Team cannot have more than 6 members',
      });
      return;
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        teamName,
        members: members || [],
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/teams/:id - Delete a team
router.delete('/:id', async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Team deleted',
      data: team,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
