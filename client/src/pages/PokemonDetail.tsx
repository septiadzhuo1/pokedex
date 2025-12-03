import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaughtStore } from '../stores/caughtStore';
import { pokemonAPI } from '../api/client';
import CatchModal from '../components/CatchModal';
import { getTypeColor } from '../utils/helpers';
import type { Pokemon } from '../types';

const PokemonDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCatchModal, setShowCatchModal] = useState(false);
  const { addCaughtPokemon } = useCaughtStore();

  useEffect(() => {
    loadPokemonDetail();
  }, [id]);

  const loadPokemonDetail = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        alert('Pokemon not found');
        navigate('/');
        return;
      }
      const { data } = await pokemonAPI.getDetail(id);
      setPokemon(data.data);
    } catch (error) {
      alert('Pokemon not found');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCatch = async (catchData: {
    pokemonId: number;
    pokemonName: string;
    nickname: string;
    imageUrl: string;
  }) => {
    try {
      await addCaughtPokemon({
        pokemonId: catchData.pokemonId,
        pokemonName: catchData.pokemonName,
        nickname: catchData.nickname,
        imageUrl: catchData.imageUrl,
      } as any);
      setShowCatchModal(false);
      navigate('/my-pokemon');
    } catch (error) {
      console.error('Error catching Pokemon:', error);
      alert('Failed to save caught Pokemon');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-b-yellow-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Loading Pokémon details...</p>
        </div>
      </div>
    );
  }

  if (!pokemon) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
        >
          ← Back to List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image & Quick Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 flex items-center justify-center rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-48 h-48 bg-white rounded-full blur-2xl opacity-30"></div>
                </div>
                <img
                  src={pokemon.sprites?.other?.home?.front_default}
                  alt={pokemon.name}
                  className="w-80 h-80 object-contain relative z-10 drop-shadow-xl"
                />
              </div>

              {/* ID & Name */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 font-semibold mb-1">#{String(pokemon.id).padStart(3, '0')}</p>
                <h1 className="text-5xl font-bold capitalize bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent mb-3">
                  {pokemon.name}
                </h1>
                <p className="text-gray-600">Height: {(pokemon.height / 10).toFixed(1)}m | Weight: {(pokemon.weight / 10).toFixed(1)}kg</p>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Types */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Types</h2>
              <div className="flex gap-3 flex-wrap">
                {pokemon.types &&
                  pokemon.types.map((type, idx) => (
                    <span
                      key={idx}
                      className="type-badge text-lg px-6 py-2.5 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:scale-110"
                      style={{ backgroundColor: getTypeColor(type.type.name) }}
                    >
                      {type.type.name}
                    </span>
                  ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-5 text-gray-800">Base Stats</h2>
              <div className="space-y-5">
                {pokemon.stats &&
                  pokemon.stats.map((stat, idx) => {
                    const percentage = (stat.base_stat / 160) * 100;
                    const getStatColor = (val: number) => {
                      if (val >= 120) return 'from-green-500 to-emerald-500';
                      if (val >= 100) return 'from-blue-500 to-cyan-500';
                      if (val >= 80) return 'from-yellow-500 to-orange-500';
                      return 'from-red-500 to-pink-500';
                    };

                    return (
                      <div key={idx} className="animate-fade-in" style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="capitalize text-sm font-semibold text-gray-700">{stat.stat.name}</span>
                          <span className="text-lg font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{stat.base_stat}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getStatColor(stat.base_stat)} shadow-lg transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Abilities */}
            {pokemon.abilities && pokemon.abilities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Abilities</h2>
                <div className="flex gap-3 flex-wrap">
                  {pokemon.abilities.map((ability, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-xl text-sm capitalize font-semibold text-blue-900 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      {ability.ability.name.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Catch Button */}
            <button
              onClick={() => setShowCatchModal(true)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl text-lg"
            >
              🎯 Try to Catch!
            </button>
          </div>
        </div>
      </div>

      {/* Catch Modal */}
      <CatchModal
        isOpen={showCatchModal}
        pokemonId={pokemon.id}
        pokemonName={pokemon.name}
        imageUrl={pokemon.sprites?.other?.home?.front_default || ''}
        onCatch={handleCatch}
        onClose={() => setShowCatchModal(false)}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PokemonDetail;
