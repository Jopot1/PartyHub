import React, { useState } from 'react';
import { Player } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Plus, X, Users } from 'lucide-react';

interface PlayerManagerProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  minPlayers: number;
  onStart: () => void;
  gameName: string;
  secondaryAction?: React.ReactNode;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({ 
  players, 
  setPlayers, 
  minPlayers, 
  onStart,
  gameName,
  secondaryAction
}) => {
  const [newName, setNewName] = useState('');

  const addPlayer = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newName.trim()) {
      setPlayers([...players, { id: crypto.randomUUID(), name: newName.trim() }]);
      setNewName('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-md mx-auto">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{gameName}</h2>
        <p className="text-slate-500 dark:text-slate-400">Ajoutez les joueurs pour commencer</p>
      </div>

      <Card>
        <form onSubmit={addPlayer} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du joueur"
            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ios-blue transition-all"
          />
          <Button type="submit" size="md" disabled={!newName.trim()} className="rounded-xl">
            <Plus size={20} />
          </Button>
        </form>

        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
          {players.length === 0 && (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>Aucun joueur</p>
            </div>
          )}
          
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl animate-slide-up">
              <span className="font-medium">{player.name}</span>
              <button 
                onClick={() => removePlayer(player.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 w-full flex flex-col gap-3 pb-8">
        <div>
            <Button 
            fullWidth 
            size="lg" 
            onClick={onStart}
            disabled={players.length < minPlayers}
            >
            Commencer ({players.length})
            </Button>
            {players.length < minPlayers && (
            <p className="text-center text-xs text-slate-400 mt-2">
                Minimum {minPlayers} joueurs requis
            </p>
            )}
        </div>
        
        {secondaryAction && (
            <div className="animate-fade-in">
                {secondaryAction}
            </div>
        )}
      </div>
    </div>
  );
};