import React, { useState, useEffect } from 'react';
import { Player, UndercoverWordPair } from '../types';
import { PlayerManager } from './PlayerManager';
import { generateUndercoverWords } from '../services/geminiService';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loader2, Eye, RefreshCw, VenetianMask, Ghost, HelpCircle } from 'lucide-react';

interface UndercoverProps {
  players: Player[];
  setPlayers: (p: Player[]) => void;
}

type Role = 'Civilian' | 'Undercover' | 'MrWhite';
type GamePhase = 'SETUP' | 'LOADING' | 'REVEAL' | 'PLAYING';

interface Assignment {
  playerId: string;
  word: string;
  role: Role;
}

interface GameState {
  turnOrder: Assignment[];
  currentRevealerIndex: number;
  isRevealing: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const Undercover: React.FC<UndercoverProps> = ({ players, setPlayers }) => {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [category, setCategory] = useState('Général');
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [numMrWhites, setNumMrWhites] = useState(0);
  const [words, setWords] = useState<UndercoverWordPair | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    turnOrder: [],
    currentRevealerIndex: 0,
    isRevealing: false,
  });

  const MIN_PLAYERS = 3;

  useEffect(() => {
    const totalImpostors = numUndercovers + numMrWhites;
    const maxPossible = Math.max(1, players.length - 2);
    if (totalImpostors > maxPossible) {
      setNumUndercovers(1);
      setNumMrWhites(0);
    }
  }, [players.length, numUndercovers, numMrWhites]);

  const startGame = async () => {
    try {
      setPhase('LOADING');
      const pair = await generateUndercoverWords(category);
      if (!pair) throw new Error("Aucun mot n'a été généré");
      setWords(pair);

      const rolesPool: { role: Role; word: string }[] = [];
      
      for (let i = 0; i < numUndercovers; i++) {
        rolesPool.push({ role: 'Undercover', word: pair.undercover });
      }
      for (let i = 0; i < numMrWhites; i++) {
        rolesPool.push({ role: 'MrWhite', word: '???' });
      }
      const numCivilians = players.length - rolesPool.length;
      for (let i = 0; i < numCivilians; i++) {
        rolesPool.push({ role: 'Civilian', word: pair.civilian });
      }

      // Shuffle roles first
      const shuffledRoles = shuffleArray(rolesPool);
      
      // Assign roles to players in their current order
      const assignments: Assignment[] = players.map((player, index) => ({
        playerId: player.id,
        role: shuffledRoles[index].role,
        word: shuffledRoles[index].word
      }));

      // Shuffle the entire assignment list to randomize turn order (Mr White won't be always last)
      const shuffledTurnOrder = shuffleArray(assignments);

      setGameState({
        turnOrder: shuffledTurnOrder,
        currentRevealerIndex: 0,
        isRevealing: false
      });
      
      setShowResults(false);
      setPhase('REVEAL');
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de génération. Retour au menu.");
      setPhase('SETUP');
    }
  };

  const handleNextReveal = () => {
    if (gameState.currentRevealerIndex < players.length - 1) {
      setGameState(prev => ({ 
        ...prev, 
        currentRevealerIndex: prev.currentRevealerIndex + 1,
        isRevealing: false
      }));
    } else {
      setPhase('PLAYING');
    }
  };

  const handleReset = () => {
    setPhase('SETUP');
    setWords(null);
    setShowResults(false);
  };

  if (phase === 'SETUP') {
    const maxImpostors = Math.max(1, players.length - 2);
    
    return (
      <div className="w-full pb-32 pt-6">
        <PlayerManager 
          players={players} 
          setPlayers={setPlayers} 
          minPlayers={MIN_PLAYERS} 
          onStart={startGame} 
          gameName="Undercover"
        />
        
        <div className="mt-4 px-6 max-w-md mx-auto space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Catégorie</label>
            <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold shadow-sm"
            >
                <option value="Général">Général</option>
                <option value="Nourriture">Nourriture</option>
                <option value="Animaux">Animaux</option>
                <option value="Lieux">Lieux</option>
                <option value="Célébrités">Célébrités</option>
                <option value="Objets">Objets</option>
                <option value="Adultes (18+)">Adultes (18+)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imposteurs</label>
              <select 
                  value={numUndercovers}
                  onChange={(e) => setNumUndercovers(Number(e.target.value))}
                  className="w-full mt-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold shadow-sm"
              >
                  {Array.from({ length: maxImpostors - numMrWhites + 1 }, (_, i) => i).map(num => (
                      <option key={num} value={num}>{num}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mister White</label>
              <select 
                  value={numMrWhites}
                  onChange={(e) => setNumMrWhites(Number(e.target.value))}
                  className="w-full mt-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold shadow-sm"
              >
                  {Array.from({ length: maxImpostors - numUndercovers + 1 }, (_, i) => i).map(num => (
                      <option key={num} value={num}>{num}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <div className="relative">
          <Loader2 className="animate-spin text-ios-blue mb-4" size={64} />
          <VenetianMask className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-ios-blue/20" size={24} />
        </div>
        <p className="text-xl font-black uppercase tracking-tighter">Infiltration en cours...</p>
      </div>
    );
  }

  if (phase === 'REVEAL') {
    const currentTurn = gameState.turnOrder[gameState.currentRevealerIndex];
    const currentPlayer = players.find(p => p.id === currentTurn.playerId);
    const isMrWhite = currentTurn.role === 'MrWhite';

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 animate-fade-in pb-12 pt-5">
        <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                Joueur {gameState.currentRevealerIndex + 1} / {players.length}
            </span>
            <h2 className="text-4xl font-black mt-4 uppercase tracking-tighter">{currentPlayer?.name}</h2>
            <p className="text-slate-500 mt-2 font-medium">
                {gameState.isRevealing ? (isMrWhite ? "Vous n'avez pas de mot !" : "Mémorisez votre mot secret") : "Prenez le téléphone"}
            </p>
        </div>

        <Card 
            className={`w-full max-w-[280px] aspect-[4/5] flex flex-col items-center justify-center mb-10 transition-all duration-700 transform shadow-2xl ${gameState.isRevealing ? 'bg-white dark:bg-slate-900 ring-4 ring-ios-blue/10' : 'bg-ios-blue dark:bg-blue-600 scale-105'}`}
            onClick={() => !gameState.isRevealing && setGameState(prev => ({ ...prev, isRevealing: true }))}
            interactive={!gameState.isRevealing}
        >
            {gameState.isRevealing ? (
                <div className="text-center animate-fade-in p-6">
                    {isMrWhite ? (
                      <div className="flex flex-col items-center">
                        <Ghost size={64} className="text-slate-300 mb-6 animate-pulse" />
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Mister White</h3>
                        <p className="mt-4 text-slate-400 text-xs font-medium">Écoutez les autres pour deviner le mot...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ios-blue mb-4">Votre mot secret</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white break-words uppercase tracking-tight">
                            {currentTurn.word}
                        </h3>
                      </>
                    )}
                </div>
            ) : (
                <div className="text-center text-white/90">
                    <Eye size={64} className="mx-auto mb-6 opacity-50" />
                    <p className="font-black text-2xl uppercase tracking-widest">Révéler</p>
                </div>
            )}
        </Card>

        {gameState.isRevealing && (
          <Button 
              size="md" 
              fullWidth 
              className="max-w-[280px] py-4 shadow-xl animate-fade-in"
              onClick={handleNextReveal}
          >
              {gameState.currentRevealerIndex === players.length - 1 ? "Lancer la partie" : "Cacher et Suivant"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 pt-4 animate-fade-in overflow-hidden">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{showResults ? "Démasqués !" : "Débats en cours"}</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {showResults ? "Voici les identités de chacun." : "Éliminez les intrus un par un."}
            </p>
        </div>

        {showResults ? (
           <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in">
               <Card className="flex flex-col items-center justify-center p-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                   <span className="text-[9px] font-black uppercase text-slate-400 mb-0.5 tracking-widest">Civil</span>
                   <span className="text-lg font-black uppercase tracking-tighter">{words?.civilian}</span>
               </Card>
               <Card className="flex flex-col items-center justify-center p-3 border-ios-blue/50 bg-ios-blue/5">
                   <span className="text-[9px] font-black uppercase text-ios-blue mb-0.5 tracking-widest">Undercover</span>
                   <span className="text-lg font-black text-ios-blue uppercase tracking-tighter">{words?.undercover}</span>
               </Card>
           </div>
        ) : (
            <Card className="mb-6 p-6 flex flex-col items-center justify-center text-center bg-slate-100 dark:bg-slate-800 border-none shadow-inner">
                <VenetianMask className="text-slate-300 mb-1" size={32} />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Les mots restent secrets</p>
            </Card>
        )}

        <div className="flex-1 overflow-hidden flex flex-col mb-24">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 pl-2">Liste des Joueurs</h3>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 pb-4">
                {players.map(p => {
                    const assignment = gameState.turnOrder.find(a => a.playerId === p.id);
                    const role = assignment?.role;
                    const isCivilian = role === 'Civilian';
                    const isUndercover = role === 'Undercover';
                    const isMrWhite = role === 'MrWhite';
                    
                    return (
                        <div key={p.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${showResults ? (isUndercover ? 'bg-ios-blue/10 border-ios-blue' : isMrWhite ? 'bg-slate-200 dark:bg-slate-700 border-slate-400' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700') : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${showResults ? (isUndercover ? 'bg-ios-blue text-white' : isMrWhite ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400') : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                    {isMrWhite && showResults ? <Ghost size={16} /> : p.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={`font-bold text-sm uppercase tracking-tight ${showResults && !isCivilian ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {p.name}
                                </span>
                            </div>
                            {showResults && (
                                <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm ${isUndercover ? 'bg-ios-blue text-white' : isMrWhite ? 'bg-slate-900 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                    {isUndercover ? 'Undercover' : isMrWhite ? 'Mr White' : 'Civil'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ios-bg via-ios-bg/95 to-transparent dark:from-ios-darkBg dark:via-ios-darkBg/95 z-40 max-w-lg mx-auto">
            {!showResults ? (
                <Button onClick={() => setShowResults(true)} variant="primary" fullWidth size="md" className="py-4 shadow-xl">
                    <VenetianMask className="mr-2" size={18}/>
                    Révéler les identités
                </Button>
            ) : (
                <Button onClick={handleReset} variant="secondary" fullWidth size="md" className="py-4">
                    <RefreshCw className="mr-2" size={18}/>
                    Nouvelle Partie
                </Button>
            )}
        </div>
    </div>
  );
};