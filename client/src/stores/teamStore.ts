import { create } from 'zustand';
import { teamsAPI } from '../api/client';
import { getClientId } from '../utils/helpers';
import type { Team, TeamMember } from '../types';

interface TeamStore {
  teams: Team[];
  isLoading: boolean;
  error: string | null;

  fetchTeams: () => Promise<void>;
  createTeam: (teamName: string, members?: TeamMember[]) => Promise<Team>;
  updateTeam: (id: string, teamName: string, members: TeamMember[]) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  isLoading: false,
  error: null,

  fetchTeams: async () => {
    const clientId = getClientId();
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.getAll(clientId);
      set({
        teams: data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  createTeam: async (teamName: string, members: TeamMember[] = []) => {
    const clientId = getClientId();
    try {
      const { data } = await teamsAPI.create({
        clientId,
        teamName,
        members,
      });
      set((state) => ({
        teams: [data.data, ...state.teams],
      }));
      return data.data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTeam: async (id: string, teamName: string, members: TeamMember[]) => {
    try {
      const { data } = await teamsAPI.update(id, {
        teamName,
        members,
      });
      set((state) => ({
        teams: state.teams.map((t) => (t._id === id ? data.data : t)),
      }));
      return data.data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTeam: async (id: string) => {
    try {
      await teamsAPI.delete(id);
      set((state) => ({
        teams: state.teams.filter((t) => t._id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
