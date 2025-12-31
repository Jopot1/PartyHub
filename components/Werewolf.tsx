import React, { useState } from 'react';
import { Player, WerewolfRole } from '../types';
import { PlayerManager } from './PlayerManager';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Moon, User, Search, FlaskConical, Crown, Eye, EyeOff } from 'lucide-react';

interface WerewolfProps {
  players: Player[];
  setPlayers: (p: Player[]) => void;
}

type Phase = 'SETUP' | 'REVEAL' | 'GM_VIEW';

export const Werewolf: React.FC<WerewolfProps> = ({ players, setPlayers }) => {
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [assignments, setAssignments] = useState<{playerId: string; role: WerewolfRole}[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const MIN_PLAYERS = 6;

  const getRoleIcon = (role: WerewolfRole) => {
    switch(role) {
        case WerewolfRole.WEREWOLF: return <Moon className="text-red-500" size={48} />;
        case WerewolfRole.SEER: return <Search className="text-purple-500" size={48} />;
        case WerewolfRole.WITCH: return <FlaskConical className="text-green-500" size={48} />;
        default: return <User className="text-blue-500" size={48} />;
    }
  };

  const startGame = () => {
    // Basic balancing logic
    const count = players.length;
    let roles: WerewolfRole[] = [];
    
    // Always 1 Seer, 1 Witch (if > 7), Wolves = ~1/3
    const wolfCount = Math.max(1, Math.floor(count / 3));
    
    for(let i=0; i<wolfCount; i++) roles.push(WerewolfRole.WEREWOLF);
    roles.push(WerewolfRole.SEER);
    if(count > 6) roles.push(WerewolfRole.WITCH);
    
    // Fill rest with Villagers
    while(roles.length < count) {
        roles.push(WerewolfRole.VILLAGER);
    }

    // Shuffle roles
    roles = roles.sort(() => Math.random() - 0.5);

    // Assign
    const newAssignments = players.map((p, i) => ({
        playerId: p.id,
        role: roles[i]
    }));

    setAssignments(newAssignments);
    setRevealIndex(0);
    setIsRevealed(false);
    setPhase('REVEAL');
  };

  const handleNextReveal = () => {
    if (isRevealed) {
        setIsRevealed(false);
    } else {
        if (revealIndex < players.length - 1) {
            setRevealIndex(prev => prev + 1);
        } else {
            setPhase('GM_VIEW');
        }
    }
  };

  if (phase === 'SETUP') {
    return (
        <PlayerManager 
            players={players} 
            setPlayers={setPlayers} 
            minPlayers={MIN_PLAYERS} 
            onStart={startGame} 
            gameName="Loup-Garou"
        />
    );
  }

  if (phase === 'REVEAL') {
    const currentAssignment = assignments[revealIndex];
    const currentPlayer = players.find(p => p.id === currentAssignment.playerId);

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] px-4 animate-fade-in">
            <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Distribution des rôles
                </span>
                <h2 className="text-4xl font-bold mt-2">{currentPlayer?.name}</h2>
            </div>

            <Card 
                className={`w-full max-w-sm aspect-[3/4] flex flex-col items-center justify-center mb-8 transition-all duration-500 cursor-pointer ${isRevealed ? 'bg-slate-900 text-white' : 'bg-ios-card'}`}
                onClick={() => !isRevealed && setIsRevealed(true)}
            >
                {isRevealed ? (
                    <div className="text-center animate-fade-in flex flex-col items-center gap-4">
                        {getRoleIcon(currentAssignment.role)}
                        <h3 className="text-3xl font-bold">{currentAssignment.role}</h3>
                        <p className="text-sm opacity-70 px-4">
                            {currentAssignment.role === WerewolfRole.WEREWOLF && "Mangez les villageois la nuit."}
                            {currentAssignment.role === WerewolfRole.VILLAGER && "Démasquez les loups le jour."}
                            {currentAssignment.role === WerewolfRole.SEER && "Découvrez le rôle d'un joueur chaque nuit."}
                            {currentAssignment.role === WerewolfRole.WITCH && "Vous avez une potion de vie et une de mort."}
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <Eye size={48} className="mx-auto mb-4" />
                        <p className="font-bold text-xl">Révéler mon rôle</p>
                    </div>
                )}
            </Card>

            <Button size="lg" fullWidth className="max-w-sm" onClick={handleNextReveal}>
                {isRevealed ? (revealIndex === players.length - 1 ? "Voir le Récapitulatif" : "Cacher et Suivant") : "Révéler"}
            </Button>
        </div>
    );
  }

  return (
    <div className="pb-20 px-4 animate-fade-in">
        <div className="text-center py-6">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Crown className="text-yellow-500" /> 
                Maître du Jeu
            </h2>
            <p className="text-sm text-slate-500">Utilisez cette liste pour narrer la partie.</p>
        </div>

        <div className="space-y-3">
            {assignments.map((assignment) => {
                const p = players.find(pl => pl.id === assignment.playerId);
                return (
                    <div key={assignment.playerId} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-lg">{p?.name}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${assignment.role === WerewolfRole.WEREWOLF ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                              assignment.role === WerewolfRole.VILLAGER ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                            {assignment.role}
                        </span>
                    </div>
                );
            })}
        </div>
        
        <div className="fixed bottom-8 left-0 right-0 px-6 max-w-md mx-auto">
            <Button onClick={() => setPhase('SETUP')} variant="secondary" fullWidth size="lg">
                Nouvelle Partie
            </Button>
        </div>
    </div>
  );
};