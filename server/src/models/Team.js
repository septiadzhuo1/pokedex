import mongoose from 'mongoose';

const { Schema } = mongoose;

const teamMemberSchema = new Schema({
  caughtPokemonId: {
    type: Schema.Types.ObjectId,
    ref: 'CaughtPokemon',
    required: true,
  },
  nickname: String,
  pokemonName: String,
  imageUrl: String,
});

const teamSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    members: [teamMemberSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.model('Team', teamSchema);
