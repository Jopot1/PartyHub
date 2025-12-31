import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PlayerManager } from './PlayerManager';
import { Timer, Eye, CheckCircle2, AlertTriangle, Stethoscope, Users, Zap, User, PenLine, Dices } from 'lucide-react';
import { PSYCHIATRIST_RULES } from '../data/psychiatristRules';
import { PsychiatristRule, PsychiatristCategory, Player } from '../types';

interface PsychiatristProps {
  players: Player[];
  setPlayers: (p: Player[]) => void;
}

type Phase = 'INPUT' | 'ASSIGNMENT' | 'RULE_SELECTION' | 'REVEAL' | 'PLAYING';

export const Psychiatrist: React.FC<PsychiatristProps> = ({ players, setPlayers }) => {
  const [phase, setPhase] = useState<Phase>('INPUT');
  const [currentRule, setCurrentRule] = useState<PsychiatristRule | null>(null);
  const [psychiatristId, setPsychiatristId] = useState<string | null>(null);
  const [customRuleText, setCustomRuleText] = useState('');
  
  const [showSolution, setShowSolution] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const MIN_PLAYERS = 3;

  // Timer logic: Runs only during PLAYING phase and stops if solution is shown
  useEffect(() => {
    if (phase === 'PLAYING' && !showSolution) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, showSolution]);

  // Start game with random psychiatrist selection if players exist
  const handleStartWithPlayers = () => {
    if (players.length < MIN_PLAYERS) return;
    setSeconds(0);
    // Pick a random psychiatrist
    const randomIndex = Math.floor(Math.random() * players.length);
    setPsychiatristId(players[randomIndex].id);
    setPhase('ASSIGNMENT');
  };

  // Skip name entry
  const handleQuickPlay = () => {
    setSeconds(0);
    setPsychiatristId(null); // No specific ID
    setPhase('ASSIGNMENT');
  };

  const handlePsyOut = () => {
    setPhase('RULE_SELECTION');
    setCustomRuleText('');
  };

  const generateRandomRule = () => {
    const randomIndex = Math.floor(Math.random() * PSYCHIATRIST_RULES.length);
    setCurrentRule(PSYCHIATRIST_RULES[randomIndex]);
    goToReveal();
  };

  const validateCustomRule = () => {
    if (!customRuleText.trim()) return;
    
    const customRule: PsychiatristRule = {
        id: 'custom-' + Date.now(),
        name: 'Règle Personnalisée',
        description: customRuleText,
        category: 'VERBAL', // Default category for custom rules
        hint: '' // No hint for custom rules
    };
    setCurrentRule(customRule);
    goToReveal();
  };

  const goToReveal = () => {
    setPhase('REVEAL');
    setShowSolution(false);
  };

  const handleReplay = () => {
      setSeconds(0);
      if (psychiatristId && players.length >= MIN_PLAYERS) {
          // If we are in named mode, pick a NEW psychiatrist if possible
          let availablePlayers = players.filter(p => p.id !== psychiatristId);
          if (availablePlayers.length === 0) availablePlayers = players; // Should not happen with min 3
          
          const nextPsyIndex = Math.floor(Math.random() * availablePlayers.length);
          setPsychiatristId(availablePlayers[nextPsyIndex].id);
          setPhase('ASSIGNMENT');
      } else {
          // Quick mode or staying with same players config
          setPhase('ASSIGNMENT');
      }
  };

  const confirmReady = () => {
    setPhase('PLAYING');
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryLabel = (cat: PsychiatristCategory) => {
    switch(cat) {
        case 'BEHAVIOR': return 'Comportemental';
        case 'IDENTITY': return 'Identitaire';
        case 'VERBAL': return 'Verbal';
        default: return 'Autre';
    }
  };

  const getPsychiatristName = () => {
      if (!psychiatristId) return null;
      return players.find(p => p.id === psychiatristId)?.name || "Inconnu";
  };

  // 1. INPUT PHASE (Optional)
  if (phase === 'INPUT') {
      const quickPlayButton = (
        <div>
             <div className="relative flex items-center py-3 opacity-60">
                 <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                 <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">OU</span>
                 <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
            </div>
            <Button 
                variant="secondary"
                fullWidth 
                onClick={handleQuickPlay}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-amber-600 hover:border-amber-400 dark:hover:text-amber-400 transition-colors"
            >
                <Zap size={18} className="mr-2 text-amber-500" />
                Mode Rapide (Sans noms)
            </Button>
        </div>
      );

      return (
        <div className="flex flex-col h-full pt-4 animate-fade-in pb-20">
            <PlayerManager 
                players={players} 
                setPlayers={setPlayers} 
                minPlayers={MIN_PLAYERS} 
                onStart={handleStartWithPlayers} 
                gameName="Le Psychiatre"
                secondaryAction={quickPlayButton}
            />
        </div>
      );
  }

  // 2. ASSIGNMENT PHASE
  if (phase === 'ASSIGNMENT') {
    const psyName = getPsychiatristName();

    return (
      <div className="flex flex-col h-full px-6 pt-10 animate-fade-in pb-12">
        <div className="text-center mb-8">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 text-ios-blue shadow-inner relative">
                <Stethoscope size={48} />
                {psyName && (
                    <div className="absolute -bottom-2 bg-ios-blue text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                        C'est toi
                    </div>
                )}
            </div>

            {psyName ? (
                 <>
                    <h2 className="text-xl font-medium text-slate-500">Le Psychiatre désigné est</h2>
                    <h1 className="text-4xl font-black tracking-tight mt-2 text-slate-900 dark:text-white break-words">
                        {psyName}
                    </h1>
                 </>
            ) : (
                <>
                    <h2 className="text-3xl font-bold tracking-tight">Le Psychiatre</h2>
                    <p className="text-slate-500 mt-2 font-medium">Désignez un joueur au hasard.</p>
                </>
            )}

            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                <p className="text-red-600 dark:text-red-400 font-bold text-lg mb-1">
                    {psyName ? `${psyName}, sors de la pièce !` : "Le Psychiatre doit sortir !"}
                </p>
                <p className="text-xs text-red-400 dark:text-red-300/70 uppercase tracking-widest">
                    Ou se boucher les oreilles
                </p>
            </div>
        </div>

        <Card className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50 border-none">
            <div className="flex gap-3 mb-2 text-amber-500 font-bold uppercase text-xs tracking-widest">
                <Users size={14} />
                Pour les autres
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Une fois le psychiatre parti, les "Patients" doivent définir leur pathologie.
            </p>
        </Card>

        <div className="mt-6">
            <Button 
                fullWidth 
                size="lg" 
                onClick={handlePsyOut} 
                className="bg-ios-blue hover:bg-blue-600 shadow-blue-500/30"
            >
                C'est bon, il est parti
            </Button>
        </div>
      </div>
    );
  }

  // 3. RULE SELECTION PHASE (New)
  if (phase === 'RULE_SELECTION') {
    return (
        <div className="flex flex-col h-full px-4 pt-6 animate-fade-in pb-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choix de la Maladie</h2>
                <p className="text-slate-500 text-sm">Définissez la règle que tous les patients devront suivre.</p>
            </div>

            <div className="space-y-6">
                <Button 
                    fullWidth 
                    size="lg" 
                    variant="secondary"
                    onClick={generateRandomRule}
                    className="py-6 border-2 border-ios-blue/20 bg-blue-50/50 dark:bg-blue-900/10 hover:border-ios-blue text-ios-blue dark:text-blue-300"
                >
                    <Dices className="mr-3" size={24} />
                    <div className="text-left">
                        <div className="font-bold text-lg">Générer au hasard</div>
                        <div className="text-xs opacity-70 font-normal">Une règle issue de notre liste</div>
                    </div>
                </Button>

                <div className="relative flex items-center py-2 opacity-60">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">OU CRÉER</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                </div>

                <Card className="p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
                    <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-500">
                        <PenLine size={18} />
                        <span className="font-bold uppercase tracking-wider text-xs">Inventer une règle</span>
                    </div>
                    <textarea 
                        className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none min-h-[100px]"
                        placeholder="Ex: On doit tous finir nos phrases par 'Cornichon'..."
                        value={customRuleText}
                        onChange={(e) => setCustomRuleText(e.target.value)}
                    />
                </Card>

                <Button 
                    fullWidth 
                    size="lg" 
                    disabled={!customRuleText.trim()}
                    onClick={validateCustomRule}
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30"
                >
                    Valider ma règle personnalisée
                </Button>
            </div>
        </div>
    );
  }

  // 4. REVEAL PHASE
  if (phase === 'REVEAL') {
    return (
        <div className="flex flex-col h-full px-4 pt-6 animate-fade-in pb-8 overflow-y-auto">
            <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                    {getCategoryLabel(currentRule!.category)}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentRule?.name}
                </h2>
            </div>

            <Card className="p-6 mb-6 bg-white dark:bg-slate-800 border-2 border-ios-blue/20 shadow-lg">
                <h3 className="text-xs font-black uppercase text-ios-blue mb-2 tracking-widest">Symptôme à respecter</h3>
                <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap">
                    {currentRule?.description}
                </p>
            </Card>

            <Card className="p-4 mb-8 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-xl rounded-l-none">
                <h3 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
                    <AlertTriangle size={14}/> Règle Spéciale
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                    Si un patient se trompe ou oublie la règle, tout le monde doit crier <strong>"PSYCHIATRE !"</strong> et tout le monde change de place.
                </p>
            </Card>

            <div className="mt-auto space-y-4">
                <p className="text-center text-xs text-slate-400 italic">
                    Cachez l'écran avant de rappeler le psychiatre.
                </p>
                <Button 
                    size="lg" 
                    fullWidth 
                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    onClick={confirmReady}
                >
                    <CheckCircle2 className="mr-2" size={20} />
                    Cacher la règle
                </Button>
            </div>
        </div>
    );
  }

  // 5. PLAYING PHASE
  return (
    <div className="flex flex-col h-full px-4 pt-8 animate-fade-in pb-20">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className={`bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-full flex items-center gap-3 mb-6 transition-colors ${showSolution ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                <Timer className={showSolution ? 'text-green-600' : 'text-slate-400'} size={20} />
                <span className={`text-3xl font-mono font-bold tabular-nums ${showSolution ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {formatTime(seconds)}
                </span>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Stethoscope className="text-ios-blue" />
                {showSolution ? "Diagnostic final" : "Consultation en cours"}
            </h2>
            
            {psychiatristId ? (
                <div className="mt-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                         <User size={24} className="text-slate-500 dark:text-slate-300" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Psychiatre</p>
                    <p className="font-bold">{getPsychiatristName()}</p>
                </div>
            ) : (
                 <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">
                    Le psychiatre pose des questions aux patients.
                </p>
            )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-4">
            {/* SOLUTION SECTION */}
            {showSolution && (
                <div className="w-full animate-fade-in mt-4">
                     <Card className="p-5 border-2 border-green-500/30 bg-green-50 dark:bg-green-900/10">
                        <p className="text-xs uppercase tracking-widest text-green-600 dark:text-green-400 text-center mb-2">La règle était</p>
                        <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">
                            {currentRule?.name}
                        </h3>
                        <p className="text-center text-sm text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">
                            {currentRule?.description}
                        </p>
                    </Card>
                </div>
            )}
        </div>

        <div className="mt-auto pt-8 space-y-3">
            {!showSolution ? (
                <Button 
                    fullWidth 
                    size="lg" 
                    variant="secondary"
                    onClick={() => setShowSolution(true)}
                >
                    <Eye className="mr-2" size={20} />
                    Voir la solution / Fin
                </Button>
            ) : (
                <div className="space-y-3">
                    <Button 
                        fullWidth 
                        size="lg" 
                        onClick={handleReplay}
                        className="bg-ios-blue hover:bg-blue-600"
                    >
                        Nouvelle Partie {psychiatristId ? "(Nouveau Psy)" : ""}
                    </Button>
                    <Button 
                        fullWidth 
                        variant="ghost"
                        onClick={() => setPhase('INPUT')}
                        className="text-xs text-slate-400"
                    >
                        Changer les joueurs
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
};