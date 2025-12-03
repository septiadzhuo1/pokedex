import { FC, useState } from 'react';
import { calculateCatchSuccess } from '../utils/helpers';

interface CatchModalProps {
  isOpen: boolean;
  pokemonId: number;
  pokemonName: string;
  imageUrl: string;
  onCatch: (data: { pokemonId: number; pokemonName: string; nickname: string; imageUrl: string }) => void;
  onClose: () => void;
}

const CatchModal: FC<CatchModalProps> = ({
  isOpen,
  pokemonId,
  pokemonName,
  imageUrl,
  onCatch,
  onClose,
}) => {
  const [showResult, setShowResult] = useState(false);
  const [catchSuccess, setCatchSuccess] = useState(false);
  const [isAttempting, setIsAttempting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [nickname, setNickname] = useState('');

  const attemptCatch = () => {
    setIsAttempting(true);
    setTimeout(() => {
      const success = calculateCatchSuccess();
      setCatchSuccess(success);
      setShowResult(true);
      setIsAttempting(false);
    }, 1500);
  };

  const confirmCatch = async () => {
    setIsConfirming(true);
    onCatch({
      pokemonId,
      pokemonName,
      nickname,
      imageUrl,
    });
    setIsConfirming(false);
  };

  const close = () => {
    setShowResult(false);
    setNickname('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Catch Pokémon!</h2>
            <button onClick={close} className="text-gray-500 hover:text-gray-700 text-xl">
              ✕
            </button>
          </div>

          {!showResult ? (
            <div className="text-center">
              <p className="mb-4 text-lg">{pokemonName}</p>
              <button
                onClick={attemptCatch}
                disabled={isAttempting}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                {isAttempting ? 'Attempting...' : 'Throw Pokéball'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              {catchSuccess ? (
                <div className="mb-4">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-lg font-bold text-green-600">Pokémon Caught!</p>
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    type="text"
                    placeholder="Give it a nickname (optional)"
                    className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-3xl mb-2">😅</p>
                  <p className="text-lg font-bold text-red-600">The Pokémon escaped!</p>
                </div>
              )}

              {catchSuccess ? (
                <button
                  onClick={confirmCatch}
                  disabled={isConfirming}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition mt-4"
                >
                  {isConfirming ? 'Saving...' : 'Confirm'}
                </button>
              ) : null}
              <button
                onClick={close}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition mt-2"
              >
                {catchSuccess ? 'Later' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatchModal;
