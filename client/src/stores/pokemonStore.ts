import { create } from 'zustand';
import { pokemonAPI } from '../api/client';
import type { Pokemon } from '../types';

interface PokemonStore {
  pokemonList: Pokemon[];
  selectedPokemon: Pokemon | null;
  total: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPokemonList: (pokemon: Pokemon[]) => void;
  setSelectedPokemon: (pokemon: Pokemon | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearSelectedPokemon: () => void;
  fetchPokemonList: (limit?: number, offset?: number) => Promise<void>;
  fetchPokemonDetail: (id: number) => Promise<Pokemon>;
}

export const usePokemonStore = create<PokemonStore>((set) => ({
  pokemonList: [],
  selectedPokemon: null,
  total: 0,
  isLoading: false,
  error: null,

  // Actions
  setPokemonList: (pokemon) => set({ pokemonList: pokemon }),
  setSelectedPokemon: (pokemon) => set({ selectedPokemon: pokemon }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearSelectedPokemon: () => set({ selectedPokemon: null }),

  fetchPokemonList: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await pokemonAPI.getList(limit, offset);
      set({
        pokemonList: data.data.results,
        total: data.data.count,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  fetchPokemonDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await pokemonAPI.getDetail(id);
      set({
        selectedPokemon: data.data,
        isLoading: false,
      });
      return data.data;
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },
}));
