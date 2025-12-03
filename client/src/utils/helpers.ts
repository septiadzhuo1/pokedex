export const POKEMON_TYPES: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export const getTypeColor = (type: string | undefined): string => {
  return POKEMON_TYPES[type?.toLowerCase() ?? ''] || '#A8A878';
};

export const getClientId = (): string => {
  let clientId = localStorage.getItem('pokemonClientId');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pokemonClientId', clientId);
  }
  return clientId;
};

export const calculateCatchSuccess = (): boolean => {
  return Math.random() < 0.5;
};

export const formatPokemonName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
