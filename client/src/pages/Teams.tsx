import { FC, useState, useEffect } from 'react';
import { useTeamStore } from '../stores/teamStore';
import { useCaughtStore } from '../stores/caughtStore';
import type { CaughtPokemon, Team } from '../types';

const Teams: FC = () => {
  const { teams, isLoading, fetchTeams, createTeam, updateTeam, deleteTeam } = useTeamStore();
  const { caughtPokemon, fetchCaughtPokemon } = useCaughtStore();
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    await fetchTeams();
    await fetchCaughtPokemon();
  };

  const togglePokemon = (pokemon: CaughtPokemon) => {
    if (selectedMembers.includes(pokemon._id)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== pokemon._id));
    } else if (selectedMembers.length < 6) {
      setSelectedMembers([...selectedMembers, pokemon._id]);
    } else {
      alert('Team is full! Max 6 Pokémon per team.');
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.teamName);
    setSelectedMembers(team.members.map((m) => m.caughtPokemonId));
    setShowCreateTeamModal(true);
  };

  const saveTeam = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    setIsUpdating(true);
    try {
      // Build full member objects from selected IDs
      const members = caughtPokemon
        .filter((p) => selectedMembers.includes(p._id))
        .map((p) => ({
          caughtPokemonId: p._id,
          nickname: p.nickname,
          pokemonName: p.pokemonName,
          imageUrl: p.imageUrl,
        }));

      if (editingTeam) {
        await updateTeam(editingTeam._id, teamName, members);
      } else {
        await createTeam(teamName, members);
      }

      setShowCreateTeamModal(false);
      setTeamName('');
      setSelectedMembers([]);
      setEditingTeam(null);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(id);
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Failed to delete team');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Team Builder</h1>
          <button
            onClick={() => {
              setEditingTeam(null);
              setTeamName('');
              setSelectedMembers([]);
              setShowCreateTeamModal(true);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            + Create Team
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No teams yet. Create your first team!</p>
        </div>
      )}

      {/* Teams List */}
      {!isLoading && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div key={team._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{team.teamName}</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-2 mb-4">
                {team.members.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No Pokémon in this team yet</div>
                ) : (
                  team.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <img src={member.imageUrl} alt={member.pokemonName} className="w-12 h-12 object-contain" />
                        <div>
                          <p className="font-semibold capitalize">{member.nickname || member.pokemonName}</p>
                          <p className="text-sm text-gray-600 capitalize">{member.pokemonName}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{index + 1}/6</span>
                    </div>
                  ))
                )}
              </div>

              <p className="text-sm text-gray-500">{team.members.length}/6 Members</p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-100 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{editingTeam ? 'Edit Team' : 'Create Team'}</h2>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                type="text"
                placeholder="Team Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
              />

              {/* Select Pokémon */}
              <div className="mb-4">
                <p className="font-semibold mb-2">Add Pokémon (Max 6)</p>
                {caughtPokemon.length === 0 ? (
                  <div className="text-gray-600 text-sm mb-4">
                    No caught Pokémon available. Visit the explore page to catch some!
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                    {caughtPokemon.map((pokemon) => (
                      <div
                        key={pokemon._id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedMembers.includes(pokemon._id)
                            ? 'bg-red-100 border-red-500'
                            : 'border-gray-200'
                        }`}
                        onClick={() => togglePokemon(pokemon)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(pokemon._id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <img src={pokemon.imageUrl} alt={pokemon.pokemonName} className="w-10 h-10 object-contain" />
                        <div className="flex-1">
                          <p className="font-semibold capitalize">{pokemon.nickname || pokemon.pokemonName}</p>
                          <p className="text-sm text-gray-600">ID: {pokemon._id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveTeam}
                  disabled={!teamName.trim() || isUpdating}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition"
                >
                  {isUpdating ? 'Saving...' : 'Save Team'}
                </button>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
