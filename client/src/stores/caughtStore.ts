import { create } from 'zustand';
import { caughtAPI } from '../api/client';
import { getClientId } from '../utils/helpers';
import type { CaughtPokemon } from '../types';

interface CaughtStore {
  caughtPokemon: CaughtPokemon[];
  isLoading: boolean;
  error: string | null;

  fetchCaughtPokemon: () => Promise<void>;
  addCaughtPokemon: (pokemonData: Omit<CaughtPokemon, '_id' | 'clientId' | 'createdAt' | 'updatedAt'>) => Promise<CaughtPokemon>;
  updateCaughtPokemon: (id: string, nickname: string) => Promise<CaughtPokemon>;
  releasePokemon: (id: string) => Promise<void>;
  sortPokemon: (sortBy: 'newest' | 'oldest' | 'alphabetical') => void;
}

export const useCaughtStore = create<CaughtStore>((set) => ({
  caughtPokemon: [],
  isLoading: false,
  error: null,

  fetchCaughtPokemon: async () => {
    const clientId = getClientId();
    set({ isLoading: true, error: null });
    try {
      const { data } = await caughtAPI.getAll(clientId);
      set({
        caughtPokemon: data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  addCaughtPokemon: async (pokemonData) => {
    const clientId = getClientId();
    try {
      const { data } = await caughtAPI.create({
        ...pokemonData,
        clientId,
      });
      set((state) => ({
        caughtPokemon: [data.data, ...state.caughtPokemon],
      }));
      return data.data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateCaughtPokemon: async (id: string, nickname: string) => {
    try {
      const { data } = await caughtAPI.update(id, { nickname });
      set((state) => ({
        caughtPokemon: state.caughtPokemon.map((p) =>
          p._id === id ? data.data : p
        ),
      }));
      return data.data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  releasePokemon: async (id: string) => {
    try {
      await caughtAPI.delete(id);
      set((state) => ({
        caughtPokemon: state.caughtPokemon.filter((p) => p._id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  sortPokemon: (sortBy: 'newest' | 'oldest' | 'alphabetical') => {
    set((state) => {
      let sorted = [...state.caughtPokemon];
      if (sortBy === 'newest') {
        sorted.sort((a, b) => new Date(b.caughtAt).getTime() - new Date(a.caughtAt).getTime());
      } else if (sortBy === 'oldest') {
        sorted.sort((a, b) => new Date(a.caughtAt).getTime() - new Date(b.caughtAt).getTime());
      } else if (sortBy === 'alphabetical') {
        sorted.sort((a, b) =>
          (a.nickname || a.pokemonName).localeCompare(
            b.nickname || b.pokemonName
          )
        );
      }
      return { caughtPokemon: sorted };
    });
  },
}));
