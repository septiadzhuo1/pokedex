import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTypeColor } from '../utils/helpers';

interface PokemonCardProps {
  pokemon: {
    id: number | string;
    name: string;
    imageUrl?: string;
    types?: string[];
  };
}

const PokemonCard: FC<PokemonCardProps> = ({ pokemon }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const placeholderUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160"%3E%3Crect fill="%23FED7AA" width="160" height="160"/%3E%3C/svg%3E';
  const fallbackUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/1.png';
  const imageUrl = pokemon.imageUrl || fallbackUrl;

  return (
    <div
      className="h-full group cursor-pointer"
      onClick={() => navigate(`/pokemon/${pokemon.name}`)}
    >
      <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105 hover:-translate-y-1 flex flex-col">
        {/* Image Container */}
        <div className="relative h-36 sm:h-48 bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 flex items-center justify-center overflow-hidden group-hover:from-red-200 group-hover:via-orange-200 group-hover:to-yellow-200 transition-all duration-300">
          {/* Decorative background circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-24 sm:w-32 h-24 sm:h-32 bg-white rounded-full blur-xl opacity-20"></div>
          </div>
          
          <img
            src={placeholderUrl}
            data-src={imageUrl}
            alt={pokemon.name}
            className={`w-32 sm:w-40 h-32 sm:h-40 object-contain relative z-10 group-hover:scale-110 transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-50'
            }`}
            loading="lazy"
            onLoad={(e) => {
              setImageLoaded(true);
              if (e.currentTarget.dataset.src) {
                e.currentTarget.src = e.currentTarget.dataset.src;
              }
            }}
            onError={(e) => {
              e.currentTarget.src = fallbackUrl;
            }}
          />
        </div>

        {/* Content Container */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col">
          <h3 className="text-base sm:text-lg font-bold capitalize mb-2 sm:mb-3 text-gray-800 group-hover:text-red-600 transition-colors duration-200 line-clamp-1">
            {pokemon.name}
          </h3>

          {/* Types */}
          <div className="flex gap-2 flex-wrap mb-3 sm:mb-4 flex-1">
            {pokemon.types && pokemon.types.length > 0 ? (
              pokemon.types.map((type, idx) => (
                <span
                  key={idx}
                  className="type-badge text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-white font-bold shadow-md hover:shadow-lg transition-shadow duration-200"
                  style={{
                    backgroundColor: getTypeColor(typeof type === 'string' ? type : type),
                    textTransform: 'capitalize',
                  }}
                >
                  {typeof type === 'string' ? type : type}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">No type info</span>
            )}
          </div>

          {/* Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pokemon/${pokemon.name}`);
            }}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-2 sm:py-2.5 text-sm rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            ✨ View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
