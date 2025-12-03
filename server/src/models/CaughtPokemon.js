import mongoose from 'mongoose';

const { Schema } = mongoose;

const caughtPokemonSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    pokemonId: {
      type: Number,
      required: true,
    },
    pokemonName: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caughtAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CaughtPokemon = mongoose.model('CaughtPokemon', caughtPokemonSchema);
