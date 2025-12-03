import { FC, useState, useEffect } from 'react';
import { useCaughtStore } from '../stores/caughtStore';

type SortType = 'newest' | 'oldest' | 'alphabetical';

const MyPokemon: FC = () => {
  const { caughtPokemon, isLoading, fetchCaughtPokemon, updateCaughtPokemon, releasePokemon, sortPokemon } =
    useCaughtStore();
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortType>('newest');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCaughtPokemon();
  }, []);

  const loadCaughtPokemon = async () => {
    await fetchCaughtPokemon();
    sortPokemon('newest');
  };

  const handleSort = (sortBy: SortType) => {
    setCurrentSort(sortBy);
    sortPokemon(sortBy);
  };

  const handleRename = (pokemonId: string, currentName: string) => {
    setSelectedPokemonId(pokemonId);
    setRenameInput(currentName);
    setShowRenameModal(true);
  };

  const confirmRename = async () => {
    if (!renameInput.trim() || !selectedPokemonId) return;
    setIsUpdating(true);
    try {
      await updateCaughtPokemon(selectedPokemonId, renameInput);
      setShowRenameModal(false);
    } catch (error) {
      console.error('Error renaming Pokemon:', error);
      alert('Failed to rename Pokemon');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRelease = async (id: string) => {
    if (window.confirm('Are you sure you want to release this Pokémon?')) {
      try {
        await releasePokemon(id);
      } catch (error) {
        console.error('Error releasing Pokemon:', error);
        alert('Failed to release Pokemon');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Pokémon</h1>
          <div className="space-x-2">
            <button
              onClick={() => handleSort('newest')}
              className={`px-4 py-2 rounded-lg transition ${
                currentSort === 'newest' ? 'bg-red-600 text-white' : 'bg-gray-200'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => handleSort('oldest')}
              className={`px-4 py-2 rounded-lg transition ${
                currentSort === 'oldest' ? 'bg-red-600 text-white' : 'bg-gray-200'
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => handleSort('alphabetical')}
              className={`px-4 py-2 rounded-lg transition ${
                currentSort === 'alphabetical' ? 'bg-red-600 text-white' : 'bg-gray-200'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && caughtPokemon.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">You haven't caught any Pokémon yet!</p>
          <a href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Start Exploring
          </a>
        </div>
      )}

      {/* Caught Pokémon List */}
      {!isLoading && caughtPokemon.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {caughtPokemon.map((pokemon) => (
            <div key={pokemon._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <img src={pokemon.imageUrl} alt={pokemon.pokemonName} className="w-32 h-32 object-contain" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold capitalize mb-1">{pokemon.nickname || pokemon.pokemonName}</h3>
                {pokemon.nickname && (
                  <p className="text-sm text-gray-600 capitalize mb-2">{pokemon.pokemonName}</p>
                )}
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(pokemon.caughtAt).toLocaleDateString()}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleRename(pokemon._id, pokemon.nickname || pokemon.pokemonName)}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleRelease(pokemon._id)}
                    className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    Release
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">Rename Pokémon</h2>
            <input
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              type="text"
              placeholder="Enter new nickname"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <div className="flex gap-2">
              <button
                onClick={confirmRename}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPokemon;
