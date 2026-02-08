import React, { useState, useEffect } from 'react';
import { Player, WerewolfRole } from '../types';
import { PlayerManager } from './PlayerManager';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { 
  Moon, User, Search, FlaskConical, Crown, Eye, Plus, Minus, 
  Crosshair, Heart, AlertCircle, Shield, Baby, Ghost, X, Info,
  Sun, MoonStar, Skull, Medal, RefreshCw, Users, Trash2, Gavel, Check, Trophy,
  Skull as DeadIcon, ChevronRight, HeartOff, XCircle, Target
} from 'lucide-react';

interface WerewolfProps {
  players: Player[];
  setPlayers: (p: Player[]) => void;
}

type Phase = 'SETUP' | 'ROLE_SELECTION' | 'REVEAL' | 'GM_TRANSFER' | 'GM_VIEW' | 'GAME_OVER' | 'FINAL_REVEAL';

// Workflow steps for the GM
type WorkflowStep = 'IDLE' | 'ASK_NIGHT_DEATH' | 'SELECT_NIGHT_DEATH' | 'SELECT_MAYOR' | 'SELECT_VILLAGE_VOTE' | 'SELECT_LOVERS' | 'ANNOUNCE_LOVER_DEATH' | 'CONFIRM_END' | 'SELECT_HUNTER_SHOT';

interface DeadRecord {
  id: string;
  name: string;
  role: WerewolfRole;
  cause?: string;
}

interface KillResult {
  mayorDied: boolean;
  loverToFollowId: string | null;
  hunterDied: boolean;
}

const ROLE_DETAILS: Record<WerewolfRole, { description: string; action: string }> = {
  [WerewolfRole.VILLAGER]: {
    description: "Votre but est d'éliminer tous les Loups-Garous. Vous n'avez pas de pouvoir particulier, mais votre vote compte !",
    action: "Reste endormi."
  },
  [WerewolfRole.WEREWOLF]: {
    description: "Chaque nuit, vous dévorez un villageois avec vos compères. Cachez bien votre identité le jour.",
    action: "Désignez ensemble une victime à dévorer."
  },
  [WerewolfRole.WHITE_WEREWOLF]: {
    description: "Vous jouez avec les loups, mais votre but est d'être le seul survivant. Une nuit sur deux, vous pouvez dévorer un loup.",
    action: "Peut choisir de dévorer un autre Loup-Garou (une nuit sur deux)."
  },
  [WerewolfRole.SEER]: {
    description: "Chaque nuit, vous pouvez découvrir le véritable rôle d'un joueur en sondant son esprit.",
    action: "Désigne un joueur pour découvrir sa véritable identité."
  },
  [WerewolfRole.WITCH]: {
    description: "Vous possédez deux potions : une de vie pour sauver une victime, et une de mort pour éliminer un suspect.",
    action: "Utilise ses potions de Vie ou de Mort si elle le souhaite."
  },
  [WerewolfRole.HUNTER]: {
    description: "Si vous vous faites éliminer, vous avez le pouvoir de tirer une dernière balle pour emporter quelqu'un avec vous.",
    action: "Si éliminé, désigne immédiatement une ultime victime."
  },
  [WerewolfRole.GUARDIAN]: {
    description: "Chaque nuit, vous proégez un joueur contre l'attaque des loups. Vous pouvez vous protéger vous-même.",
    action: "Désigne un joueur à protéger pour le reste de la nuit."
  },
  [WerewolfRole.LITTLE_GIRL]: {
    description: "Vous pouvez entrouvrir les yeux pendant que les loups choisissent leur victime... mais ne vous faites pas prendre !",
    action: "Peut espionner les Loups discrètement pendant leur tour."
  },
  [WerewolfRole.CUPID]: {
    description: "Au début de la partie, vous liez le destin de deux joueurs. S'il l'un meurt, l'autre succombe de chagrin.",
    action: "Désigne les deux amoureux de la partie (Tour 1 uniquement)."
  },
  [WerewolfRole.VILLAGE_IDIOT]: {
    description: "Si le village vote contre vous, vous révélez votre identité et restez en vie, mais vous perdez votre droit de vote.",
    action: "Reste endormi. Si banni, il survit mais ne vote plus."
  }
};

export const Werewolf: React.FC<WerewolfProps> = ({ players, setPlayers }) => {
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [workflow, setWorkflow] = useState<WorkflowStep>('IDLE');
  
  const [assignments, setAssignments] = useState<{playerId: string; role: WerewolfRole}[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Game State
  const [nightNumber, setNightNumber] = useState(1);
  const [isDay, setIsDay] = useState(false);
  const [aliveIds, setAliveIds] = useState<string[]>([]);
  const [deadPlayers, setDeadPlayers] = useState<DeadRecord[]>([]);
  const [mayorId, setMayorId] = useState<string | null>(null);
  const [loversIds, setLoversIds] = useState<string[]>([]); 
  const [loverGriefId, setLoverGriefId] = useState<string | null>(null);
  const [showNarration, setShowNarration] = useState(true);
  const [winner, setWinner] = useState<{ title: string; desc: string; icon: React.ReactNode } | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedDeathIds, setSelectedDeathIds] = useState<string[]>([]);

  const [selectedRoles, setSelectedRoles] = useState<Record<WerewolfRole, number>>({
    [WerewolfRole.VILLAGER]: 0,
    [WerewolfRole.WEREWOLF]: 0,
    [WerewolfRole.WHITE_WEREWOLF]: 0,
    [WerewolfRole.SEER]: 0,
    [WerewolfRole.WITCH]: 0,
    [WerewolfRole.HUNTER]: 0,
    [WerewolfRole.GUARDIAN]: 0,
    [WerewolfRole.LITTLE_GIRL]: 0,
    [WerewolfRole.CUPID]: 0,
    [WerewolfRole.VILLAGE_IDIOT]: 0,
  });

  const MIN_PLAYERS = 6;

  const getRoleIcon = (role: WerewolfRole, size = 48) => {
    switch(role) {
        case WerewolfRole.WEREWOLF: return <Moon className="text-red-600" size={size} />;
        case WerewolfRole.WHITE_WEREWOLF: return <MoonStar className="text-slate-400" size={size} />;
        case WerewolfRole.SEER: return <Search className="text-purple-500" size={size} />;
        case WerewolfRole.WITCH: return <FlaskConical className="text-green-500" size={size} />;
        case WerewolfRole.HUNTER: return <Crosshair className="text-orange-500" size={size} />;
        case WerewolfRole.CUPID: return <Heart className="text-pink-500" size={size} />;
        case WerewolfRole.GUARDIAN: return <Shield className="text-blue-600" size={size} />;
        case WerewolfRole.LITTLE_GIRL: return <Baby className="text-yellow-500" size={size} />;
        case WerewolfRole.VILLAGE_IDIOT: return <Ghost className="text-teal-500" size={size} />;
        default: return <User className="text-blue-400" size={size} />;
    }
  };

  const isBadRole = (role: WerewolfRole) => 
    role === WerewolfRole.WEREWOLF || role === WerewolfRole.WHITE_WEREWOLF;

  const isRoleAlive = (role: WerewolfRole) => {
    return assignments.some(a => a.role === role && aliveIds.includes(a.playerId));
  };

  const initDefaultRoles = () => {
    const count = players.length;
    const wolfCount = Math.max(1, Math.floor(count / 4)); 
    const newRoles: Record<WerewolfRole, number> = {
        [WerewolfRole.VILLAGER]: Math.max(0, count - wolfCount - 2),
        [WerewolfRole.WEREWOLF]: wolfCount,
        [WerewolfRole.WHITE_WEREWOLF]: 0,
        [WerewolfRole.SEER]: 1,
        [WerewolfRole.WITCH]: 1,
        [WerewolfRole.HUNTER]: 0,
        [WerewolfRole.GUARDIAN]: 0,
        [WerewolfRole.LITTLE_GIRL]: 0,
        [WerewolfRole.CUPID]: 0,
        [WerewolfRole.VILLAGE_IDIOT]: 0,
    };
    setSelectedRoles(newRoles);
    setPhase('ROLE_SELECTION');
  };

  const handleRestart = () => {
    setAliveIds([]);
    setDeadPlayers([]);
    setMayorId(null);
    setLoversIds([]);
    setLoverGriefId(null);
    setNightNumber(1);
    setIsDay(false);
    setGameEnded(false);
    setWinner(null);
    setWorkflow('IDLE');
    setAssignments([]);
    setRevealIndex(0);
    setIsRevealed(false);
    setPhase('ROLE_SELECTION');
  };

  const confirmRoles = () => {
    let rolePool: WerewolfRole[] = [];
    Object.entries(selectedRoles).forEach(([role, count]) => {
        for(let i=0; i < count; i++) rolePool.push(role as WerewolfRole);
    });
    rolePool = rolePool.sort(() => Math.random() - 0.5);

    const newAssignments = players.map((p, i) => ({
        playerId: p.id,
        role: rolePool[i]
    }));

    setAssignments(newAssignments);
    setAliveIds(players.map(p => p.id));
    setDeadPlayers([]);
    setMayorId(null);
    setLoversIds([]);
    setNightNumber(1);
    setIsDay(false);
    setGameEnded(false);
    setWinner(null);
    setRevealIndex(0);
    setIsRevealed(false);
    setPhase('REVEAL');
  };

  useEffect(() => {
    if (phase !== 'GM_VIEW' || aliveIds.length === 0 || gameEnded) return;

    const survivors = assignments.filter(a => aliveIds.includes(a.playerId));
    const werewolves = survivors.filter(s => s.role === WerewolfRole.WEREWOLF || s.role === WerewolfRole.WHITE_WEREWOLF);
    const villagers = survivors.filter(s => !isBadRole(s.role));
    const whiteWolf = survivors.find(s => s.role === WerewolfRole.WHITE_WEREWOLF);

    if (survivors.length === 2 && survivors.every(s => loversIds.includes(s.playerId))) {
        setWinner({ 
          title: "Les Amoureux", 
          desc: "L'amour a triomphé. Ils vécurent heureux...", 
          icon: <Heart size={80} className="text-pink-500 animate-pulse" /> 
        });
        setGameEnded(true);
        setPhase('GAME_OVER');
        return;
    }

    if (survivors.length === 1 && whiteWolf) {
        setWinner({ title: "Loup-Blanc", desc: "Le loup solitaire gagne seul !", icon: <MoonStar size={80} className="text-slate-300" /> });
        setGameEnded(true);
        setPhase('GAME_OVER');
        return;
    }

    if (werewolves.length >= villagers.length && !whiteWolf) {
        setWinner({ title: "Loups-Garous", desc: "Le village est tombé !", icon: <Moon size={80} className="text-red-500" /> });
        setGameEnded(true);
        setPhase('GAME_OVER');
        return;
    }

    if (werewolves.length === 0) {
        setWinner({ title: "Le Village", desc: "Tous les loups sont éliminés !", icon: <Sun size={80} className="text-yellow-500" /> });
        setGameEnded(true);
        setPhase('GAME_OVER');
        return;
    }
  }, [aliveIds, phase, gameEnded, assignments, loversIds]);

  const killPlayer = (playerId: string, cause?: string): KillResult => {
    const assignment = assignments.find(a => a.playerId === playerId);
    const p = players.find(pl => pl.id === playerId);
    
    if (!assignment || !p || !aliveIds.includes(playerId)) {
        return { mayorDied: false, loverToFollowId: null, hunterDied: false };
    }

    const wasMayor = mayorId === playerId;
    const wasHunter = assignment.role === WerewolfRole.HUNTER;
    let partnerId: string | null = null;

    if (loversIds.includes(playerId)) {
        const otherLoverId = loversIds.find(id => id !== playerId);
        if (otherLoverId && aliveIds.includes(otherLoverId)) {
            partnerId = otherLoverId;
        }
    }
    
    setAliveIds(prev => prev.filter(id => id !== playerId));
    setDeadPlayers(prev => [...prev, { id: p.id, name: p.name, role: assignment.role, cause }]);
    
    if (wasMayor) setMayorId(null);

    return { mayorDied: wasMayor, loverToFollowId: partnerId, hunterDied: wasHunter };
  };

  const handleKillChain = (res: KillResult) => {
    if (res.hunterDied) {
      setWorkflow('SELECT_HUNTER_SHOT');
    } else if (res.loverToFollowId) {
      setLoverGriefId(res.loverToFollowId);
      setWorkflow('ANNOUNCE_LOVER_DEATH');
    } else if (res.mayorDied || (!mayorId && aliveIds.length > 0)) {
      setWorkflow('SELECT_MAYOR');
    } else {
      setWorkflow('IDLE');
    }
  };

  const handleSunrise = () => {
    if (nightNumber === 1 && selectedRoles[WerewolfRole.CUPID] > 0 && loversIds.length < 2) {
      setWorkflow('SELECT_LOVERS');
    } else {
      setWorkflow('ASK_NIGHT_DEATH');
    }
  };

  const handleSunset = () => {
    setWorkflow('SELECT_VILLAGE_VOTE');
  };

  if (phase === 'SETUP') {
    return <PlayerManager players={players} setPlayers={setPlayers} minPlayers={MIN_PLAYERS} onStart={initDefaultRoles} gameName="Loup-Garou" />;
  }

  if (phase === 'ROLE_SELECTION') {
    const totalSelected = Object.values(selectedRoles).reduce((a, b) => a + b, 0);
    return (
        <div className="flex flex-col h-[calc(100vh-60px)] animate-fade-in pb-24">
            <div className="p-6 text-center">
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Le Deck</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${totalSelected === players.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {totalSelected} / {players.length} rôles
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-2">
                {(Object.keys(selectedRoles) as WerewolfRole[]).map(role => (
                    <div key={role} className="flex items-center gap-3">
                        <div className="flex-1 flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">{getRoleIcon(role, 20)}</div>
                                <span className="font-bold text-sm">{role}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedRoles(p => ({...p, [role]: Math.max(0, p[role]-1)}))} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Minus size={16}/></button>
                                <span className="w-4 text-center font-black">{selectedRoles[role]}</span>
                                <button onClick={() => setSelectedRoles(p => ({...p, [role]: p[role]+1}))} className="w-8 h-8 rounded-full bg-ios-blue text-white flex items-center justify-center"><Plus size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ios-bg to-transparent dark:from-ios-darkBg">
                <Button fullWidth size="lg" onClick={confirmRoles} disabled={totalSelected !== players.length}>Distribuer</Button>
            </div>
        </div>
    );
  }

  if (phase === 'REVEAL') {
    const current = assignments[revealIndex];
    const p = players.find(pl => pl.id === current.playerId);
    return (
        <div className="flex flex-col items-center justify-start min-h-[calc(100vh-60px)] px-4 animate-fade-in overflow-y-auto pt-8 pb-12 w-full">
            <h2 className="text-4xl font-black mb-8 break-words text-center w-full">{p?.name}</h2>
            <Card 
                className={`w-full max-w-sm aspect-[3/4] flex flex-col items-center justify-center mb-8 transition-all duration-500 cursor-pointer flex-shrink-0 ${isRevealed ? 'bg-slate-900 text-white shadow-2xl scale-100' : 'bg-ios-blue shadow-lg scale-105'}`}
                onClick={() => !isRevealed && setIsRevealed(true)}
                interactive={!isRevealed}
            >
                {isRevealed ? (
                    <div className="text-center animate-fade-in flex flex-col items-center gap-4 px-6">
                        {getRoleIcon(current.role, 80)}
                        <h3 className="text-4xl font-black uppercase tracking-tighter">{current.role}</h3>
                        <p className="text-sm text-slate-300 font-medium leading-tight">
                          {ROLE_DETAILS[current.role].description}
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-white/90">
                        <Eye size={80} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold text-2xl uppercase tracking-widest">Révéler</p>
                    </div>
                )}
            </Card>
            {isRevealed && (
              <div className="w-full max-w-sm mt-auto animate-slide-up">
                <Button size="lg" fullWidth className="shadow-xl" onClick={() => { 
                    setIsRevealed(false); 
                    if(revealIndex < players.length-1) setRevealIndex(i=>i+1); 
                    else setPhase('GM_TRANSFER'); 
                }}>
                    {revealIndex === players.length-1 ? "Terminer" : "Suivant"}
                </Button>
              </div>
            )}
        </div>
    );
  }

  if (phase === 'GM_TRANSFER') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-6 text-center animate-fade-in pt-10 pb-10">
            <div className="w-24 h-24 bg-ios-blue/10 rounded-full flex items-center justify-center mb-6 text-ios-blue flex-shrink-0">
                <Users size={50} />
            </div>
            <h2 className="text-3xl font-black mb-4">Prêt à jouer ?</h2>
            <p className="text-slate-500 mb-10 text-lg leading-snug">Donnez le téléphone au <br/><span className="text-ios-blue font-black uppercase tracking-widest">Maître du Jeu</span></p>
            <Button fullWidth size="lg" className="max-w-sm shadow-xl" onClick={() => setPhase('GM_VIEW')}>Accéder à la narration</Button>
        </div>
    );
  }

  if (phase === 'GAME_OVER') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-6 text-center animate-fade-in pt-10 pb-10">
            <div className="mb-10 p-10 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex-shrink-0">
                {winner?.icon}
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Victoire de</h1>
            <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter">{winner?.title}</h2>
            <p className="text-slate-500 mb-14 text-xl font-medium leading-relaxed max-w-xs">{winner?.desc}</p>
            
            <div className="w-full max-w-sm space-y-4">
                <Button fullWidth size="lg" className="shadow-2xl" onClick={handleRestart}>
                    <RefreshCw className="mr-2" size={20} /> Recommencer
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setPhase('FINAL_REVEAL')}>
                    Voir les rôles finaux
                </Button>
            </div>
        </div>
    );
  }

  if (phase === 'FINAL_REVEAL') {
    return (
        <div className="flex flex-col h-[calc(100vh-60px)] animate-fade-in bg-ios-bg dark:bg-ios-darkBg">
            <div className="p-8 text-center flex-shrink-0">
                <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
                <h2 className="text-3xl font-black uppercase">Rôles Finaux</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                <div className="space-y-2">
                    {assignments.map(a => {
                        const p = players.find(pl => pl.id === a.playerId);
                        const isAlive = aliveIds.includes(a.playerId);
                        return (
                            <div key={a.playerId} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${!isAlive ? 'opacity-50 bg-slate-100 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isAlive ? 'bg-ios-blue text-white' : 'bg-slate-300 text-slate-600'}`}>
                                        {p?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className={`font-bold ${!isAlive ? 'line-through' : ''}`}>{p?.name}</span>
                                          {loversIds.includes(a.playerId) && <Heart size={14} className="text-pink-500" fill="currentColor" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-ios-blue">{a.role}</span>
                                    </div>
                                </div>
                                <div className="opacity-50">{getRoleIcon(a.role, 24)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ios-bg to-transparent dark:from-ios-darkBg">
                <Button fullWidth size="lg" onClick={handleRestart}>Recommencer une partie</Button>
            </div>
        </div>
    );
  }

  const alivePlayers = players.filter(p => aliveIds.includes(p.id));

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] animate-fade-in overflow-hidden relative bg-ios-bg dark:bg-ios-darkBg">
        {/* WORKFLOW OVERLAY INLINED TO PREVENT FLICKERING */}
        {workflow !== 'IDLE' && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <Card className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-0">
                    <div className="p-6">
                        {workflow === 'SELECT_LOVERS' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart size={32} className="text-pink-500" fill="currentColor" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-1">Cupidon</h3>
                                <p className="text-slate-500 text-xs mb-6">Sélectionnez les deux amoureux ({loversIds.length}/2)</p>
                                <div className="max-h-[30vh] overflow-y-auto space-y-2 mb-6">
                                    {alivePlayers.map(p => {
                                      const isSelected = loversIds.includes(p.id);
                                      return (
                                        <button 
                                            key={p.id}
                                            disabled={!isSelected && loversIds.length >= 2}
                                            onClick={() => { 
                                              if (isSelected) setLoversIds(prev => prev.filter(id => id !== p.id));
                                              else setLoversIds(prev => [...prev, p.id]);
                                            }}
                                            className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${isSelected ? 'bg-pink-50 border-pink-500 dark:bg-pink-900/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent opacity-80'}`}
                                        >
                                            <span className={`font-bold ${isSelected ? 'text-pink-700 dark:text-pink-300' : ''}`}>{p.name}</span>
                                            {isSelected && <Check size={18} className="text-pink-500" />}
                                        </button>
                                      );
                                    })}
                                </div>
                                <Button fullWidth disabled={loversIds.length !== 2} onClick={() => setWorkflow('ASK_NIGHT_DEATH')}>
                                    Sceller leur destin
                                </Button>
                            </div>
                        )}

                        {workflow === 'ASK_NIGHT_DEATH' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Skull size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-2">Morts de la nuit</h3>
                                <p className="text-slate-500 text-sm mb-8">Y a-t-il eu des victimes cette nuit ?</p>
                                <div className="flex gap-3">
                                    <Button variant="secondary" fullWidth onClick={() => {
                                        setIsDay(true);
                                        if (!mayorId && aliveIds.length > 0) setWorkflow('SELECT_MAYOR');
                                        else setWorkflow('IDLE');
                                    }}>Non</Button>
                                    <Button fullWidth onClick={() => { 
                                      setSelectedDeathIds([]);
                                      setWorkflow('SELECT_NIGHT_DEATH');
                                    }}>Oui</Button>
                                </div>
                            </div>
                        )}

                        {workflow === 'SELECT_NIGHT_DEATH' && (
                            <div>
                                <h3 className="text-lg font-black uppercase mb-1 text-center">Sélectionner les victimes</h3>
                                <p className="text-center text-slate-500 text-[10px] mb-4">Sélectionnez tous les joueurs éliminés (Loup + Sorcière)</p>
                                <div className="max-h-[30vh] overflow-y-auto space-y-2 mb-6">
                                    {alivePlayers.map(p => {
                                      const isSelected = selectedDeathIds.includes(p.id);
                                      return (
                                        <button 
                                            key={p.id}
                                            onClick={() => { 
                                                setSelectedDeathIds(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                                            }}
                                            className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${isSelected ? 'bg-red-50 border-red-500 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent opacity-80'}`}
                                        >
                                            <span className={`font-bold ${isSelected ? 'text-red-700 dark:text-red-300' : ''}`}>{p.name}</span>
                                            {isSelected && <Skull size={18} className="text-red-500" />}
                                        </button>
                                      );
                                    })}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button 
                                    fullWidth 
                                    disabled={selectedDeathIds.length === 0} 
                                    onClick={() => {
                                      setIsDay(true);
                                      let mergedRes: KillResult = { mayorDied: false, loverToFollowId: null, hunterDied: false };
                                      selectedDeathIds.forEach(id => {
                                        const res = killPlayer(id, "Victime de la nuit");
                                        if (res.hunterDied) mergedRes.hunterDied = true;
                                        if (res.mayorDied) mergedRes.mayorDied = true;
                                        if (res.loverToFollowId) mergedRes.loverToFollowId = res.loverToFollowId;
                                      });
                                      handleKillChain(mergedRes);
                                    }}
                                  >
                                    Confirmer {selectedDeathIds.length > 0 && `(${selectedDeathIds.length})`}
                                  </Button>
                                  <Button variant="ghost" fullWidth onClick={() => setWorkflow('IDLE')}>Annuler</Button>
                                </div>
                            </div>
                        )}

                        {workflow === 'SELECT_HUNTER_SHOT' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target size={32} className="text-orange-600" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-1">Dernier tir du Chasseur</h3>
                                <p className="text-slate-500 text-xs mb-6">Le chasseur est tombé, il entraîne quelqu'un avec lui...</p>
                                <div className="max-h-[30vh] overflow-y-auto space-y-2 mb-6">
                                    {alivePlayers.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => { 
                                                const res = killPlayer(p.id, "Abattu par le chasseur");
                                                handleKillChain(res);
                                            }}
                                            className="w-full p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl flex items-center justify-between border border-transparent active:border-orange-500 transition-all"
                                        >
                                            <span className="font-bold">{p.name}</span>
                                            <Crosshair size={18} className="text-orange-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {workflow === 'ANNOUNCE_LOVER_DEATH' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HeartOff size={32} className="text-pink-600" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-1 text-pink-600">Mort de Chagrin</h3>
                                <p className="text-slate-700 font-bold text-lg mb-2">
                                    {players.find(p => p.id === loverGriefId)?.name}
                                </p>
                                <p className="text-slate-500 text-sm mb-8 italic">Ne pouvant supporter la perte de son amour, il/elle s'éteint à son tour...</p>
                                <Button fullWidth onClick={() => {
                                    if (loverGriefId) {
                                        const res = killPlayer(loverGriefId, "Mort de chagrin");
                                        setLoverGriefId(null);
                                        handleKillChain(res);
                                    }
                                }}>
                                    Confirmer la mort
                                </Button>
                            </div>
                        )}

                        {workflow === 'SELECT_MAYOR' && (
                            <div>
                                <h3 className="text-lg font-black uppercase mb-1 text-center">
                                    {!mayorId && nightNumber > 1 ? "Succession du Maire" : "Élection du Maire"}
                                </h3>
                                <p className="text-center text-slate-500 text-xs mb-4">Désignez le capitaine du village</p>
                                <div className="max-h-[30vh] overflow-y-auto space-y-2 mb-6">
                                    {alivePlayers.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => { 
                                                setMayorId(p.id); 
                                                setWorkflow('IDLE'); 
                                            }}
                                            className="w-full p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-between border border-transparent active:border-amber-400 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Medal size={18} className="text-amber-500" />
                                                <span className="font-bold">{p.name}</span>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {workflow === 'SELECT_VILLAGE_VOTE' && (
                            <div>
                                <h3 className="text-lg font-black uppercase mb-1 text-center">Vote du Village</h3>
                                <p className="text-center text-slate-500 text-xs mb-4">Qui a été condamné ?</p>
                                <div className="max-h-[30vh] overflow-y-auto space-y-2 mb-6">
                                    <button 
                                        onClick={() => { setIsDay(false); setNightNumber(n => n + 1); setWorkflow('IDLE'); }}
                                        className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between italic text-slate-500"
                                    >
                                        <span>Personne (Égalité)</span>
                                        <X size={18} />
                                    </button>
                                    {alivePlayers.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => { 
                                                setIsDay(false); 
                                                setNightNumber(n => n + 1);
                                                const res = killPlayer(p.id, "Banni par le village"); 
                                                handleKillChain(res);
                                            }}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-transparent active:border-red-500 transition-all"
                                        >
                                            <span className="font-bold">{p.name}</span>
                                            <Skull size={18} className="text-red-500" />
                                        </button>
                                    ))}
                                </div>
                                <Button variant="ghost" fullWidth onClick={() => setWorkflow('IDLE')}>Annuler</Button>
                            </div>
                        )}

                        {workflow === 'CONFIRM_END' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle size={32} className="text-red-600" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-1">Arrêter la partie ?</h3>
                                <p className="text-slate-500 text-sm mb-8">Voulez-vous vraiment interrompre la partie en cours et révéler tous les rôles ?</p>
                                <div className="space-y-3">
                                    <Button fullWidth variant="danger" onClick={() => setPhase('FINAL_REVEAL')}>
                                        Confirmer l'arrêt
                                    </Button>
                                    <Button fullWidth variant="ghost" onClick={() => setWorkflow('IDLE')}>
                                        Continuer à jouer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        )}
        
        {/* Header MJ */}
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
                <Crown className="text-yellow-500" size={20}/>
                <h2 className="font-black text-xs uppercase tracking-widest">Assistant MJ</h2>
                <button 
                  onClick={() => setWorkflow('CONFIRM_END')}
                  className="ml-4 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
                >
                  Fin
                </button>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 shadow-sm ${isDay ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'}`}>
                {isDay ? <Sun size={12}/> : <MoonStar size={12}/>}
                <span>{isDay ? 'Jour' : 'Nuit'} {nightNumber}</span>
            </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-3 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => setShowNarration(true)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showNarration ? 'bg-white dark:bg-slate-700 shadow-md scale-[1.02]' : 'text-slate-400 opacity-60'}`}>Narration</button>
            <button onClick={() => setShowNarration(false)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!showNarration ? 'bg-white dark:bg-slate-700 shadow-md scale-[1.02]' : 'text-slate-400 opacity-60'}`}>Rôle des Joueurs</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-40">
            {showNarration ? (
                <div className="space-y-4 pt-4 pb-10">
                    {isDay ? (
                        <div className="space-y-4">
                            <Card className="border-l-4 border-l-amber-500 p-4 shadow-sm bg-white dark:bg-slate-800/80">
                                <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><Sun size={16}/> Réveil du village</h4>
                                <p className="text-xs text-slate-500 italic">"Annoncez les victimes de la nuit."</p>
                            </Card>
                            {mayorId && (
                                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/30 p-4 shadow-sm">
                                    <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><Medal size={16}/> Maire : {players.find(p => p.id === mayorId)?.name}</h4>
                                </Card>
                            )}
                            {loversIds.length === 2 && (
                                <Card className="border-l-4 border-l-pink-500 bg-pink-50/30 p-4 shadow-sm">
                                    <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><Heart size={16} className="text-pink-500" fill="currentColor" /> Couple lié</h4>
                                </Card>
                            )}
                            <Card className="border-l-4 border-l-slate-400 p-4 shadow-sm bg-white dark:bg-slate-800/80 relative overflow-hidden">
                                <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><Gavel size={16}/> Débat & Vote</h4>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] pl-1 mb-2">Cycle Nocturne</h3>
                            {nightNumber === 1 && isRoleAlive(WerewolfRole.CUPID) && (
                                <Card className={`p-3 border-l-4 border-l-pink-500 bg-white dark:bg-slate-800/80 shadow-sm ${loversIds.length < 2 ? 'ring-2 ring-pink-500 ring-offset-2' : ''}`}>
                                    <h5 className="font-bold text-xs flex justify-between">Cupidon</h5>
                                    <p className="text-[10px] text-slate-500 italic mt-1">{ROLE_DETAILS[WerewolfRole.CUPID].action}</p>
                                    {loversIds.length < 2 && (
                                      <button onClick={() => setWorkflow('SELECT_LOVERS')} className="mt-2 text-[8px] font-bold bg-pink-500 text-white px-2 py-1 rounded">Désigner maintenant</button>
                                    )}
                                </Card>
                            )}
                            {isRoleAlive(WerewolfRole.GUARDIAN) && (
                                <Card className="p-3 border-l-4 border-l-blue-500 bg-white dark:bg-slate-800/80 shadow-sm">
                                  <h5 className="font-bold text-xs">Gardien</h5>
                                  <p className="text-[10px] text-slate-500 italic mt-1">{ROLE_DETAILS[WerewolfRole.GUARDIAN].action}</p>
                                </Card>
                            )}
                            {isRoleAlive(WerewolfRole.SEER) && (
                                <Card className="p-3 border-l-4 border-l-purple-500 bg-white dark:bg-slate-800/80 shadow-sm">
                                  <h5 className="font-bold text-xs">Voyante</h5>
                                  <p className="text-[10px] text-slate-500 italic mt-1">{ROLE_DETAILS[WerewolfRole.SEER].action}</p>
                                </Card>
                            )}
                            {(isRoleAlive(WerewolfRole.WEREWOLF) || isRoleAlive(WerewolfRole.WHITE_WEREWOLF)) && (
                                <Card className="p-3 border-l-4 border-l-red-500 bg-white dark:bg-slate-800/80 shadow-sm">
                                  <h5 className="font-bold text-xs text-red-600">Loups-Garous</h5>
                                  <p className="text-[10px] text-slate-500 italic mt-1">{ROLE_DETAILS[WerewolfRole.WEREWOLF].action}</p>
                                  {isRoleAlive(WerewolfRole.WHITE_WEREWOLF) && (
                                    <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold border-t pt-1 border-slate-100 dark:border-slate-700">Loup-Blanc : {ROLE_DETAILS[WerewolfRole.WHITE_WEREWOLF].action}</p>
                                  )}
                                </Card>
                            )}
                            {isRoleAlive(WerewolfRole.WITCH) && (
                                <Card className="p-3 border-l-4 border-l-green-500 bg-white dark:bg-slate-800/80 shadow-sm">
                                  <h5 className="font-bold text-xs">Sorcière</h5>
                                  <p className="text-[10px] text-slate-500 italic mt-1">{ROLE_DETAILS[WerewolfRole.WITCH].action}</p>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Tableau de Bord</h3>
                        {assignments.map(a => {
                            const p = players.find(pl => pl.id === a.playerId);
                            const isAlive = aliveIds.includes(a.playerId);
                            const isMayor = mayorId === a.playerId;
                            const isLover = loversIds.includes(a.playerId);
                            return (
                                <div key={a.playerId} className={`flex items-center justify-between p-3 rounded-2xl border shadow-sm transition-all duration-300 ${!isAlive ? 'bg-slate-100/50 dark:bg-slate-900/50 opacity-40 grayscale' : 'bg-white dark:bg-slate-800'} ${isMayor ? 'border-yellow-400 ring-2 ring-yellow-400/20' : ''}`}>
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shadow-inner ${!isAlive ? 'bg-slate-300 text-white' : isMayor ? 'bg-yellow-400 text-white' : isLover ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                            {!isAlive ? <DeadIcon size={12}/> : isLover ? <Heart size={12} fill="currentColor" /> : p?.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <div className="flex items-center gap-2">
                                              <span className={`font-black text-sm truncate uppercase tracking-tight ${!isAlive ? 'line-through text-slate-400' : ''}`}>{p?.name}</span>
                                              {isLover && isAlive && <Heart size={10} className="text-pink-500" fill="currentColor" />}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${isBadRole(a.role) ? 'text-red-500' : 'text-ios-blue/60'}`}>{a.role}</span>
                                                {isMayor && <Medal size={10} className="text-yellow-500" />}
                                            </div>
                                        </div>
                                    </div>
                                    {!isAlive && <div className="text-[10px] font-black uppercase text-slate-300 px-3 italic tracking-widest">Mort</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg p-4 bg-gradient-to-t from-ios-bg via-ios-bg/95 to-transparent dark:from-ios-darkBg dark:via-ios-darkBg/95 flex z-40">
            <Button fullWidth className={`shadow-2xl py-4 ${isDay ? "bg-slate-900 dark:bg-slate-200 dark:text-slate-900" : "bg-amber-500"}`} onClick={() => isDay ? handleSunset() : handleSunrise()}>
                {isDay ? "Coucher du Soleil" : "Lever du Jour"}
            </Button>
        </div>
    </div>
  );
};