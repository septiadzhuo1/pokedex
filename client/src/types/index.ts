// Pokemon types from PokéAPI
export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprite {
  other: {
    home: {
      front_default: string;
    };
  };
  front_default: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprite;
  types: Array<{
    slot: number;
    type: PokemonType;
  }>;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  base_experience: number;
}

export interface EvolutionChain {
  id: number;
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolves_to: EvolutionChain['chain'][];
  };
}

// Caught Pokemon types
export interface CaughtPokemon {
  _id: string;
  clientId: string;
  pokemonId: number;
  pokemonName: string;
  nickname: string;
  imageUrl: string;
  caughtAt: string;
  createdAt: string;
  updatedAt: string;
}

// Team Member type
export interface TeamMember {
  caughtPokemonId: string;
  nickname: string;
  pokemonName: string;
  imageUrl: string;
}

// Team types
export interface Team {
  _id: string;
  clientId: string;
  teamName: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface ApiError {
  message: string;
  status: number;
}
