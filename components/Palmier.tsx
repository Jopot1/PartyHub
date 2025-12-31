import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PalmierRule } from '../types';
import { Settings, Check, ArrowLeft, Beer, RotateCcw } from 'lucide-react';

// Default rules for the Palm Tree game
const DEFAULT_RULES: PalmierRule[] = [
  { cardValue: 'A', rule: 'Dans les yeux : Tu distribues 1 gorgée.' },
  { cardValue: '2', rule: 'Dans les yeux : Tu distribues 2 gorgées.' },
  { cardValue: '3', rule: 'Dans les yeux : Tu distribues 3 gorgées.' },
  { cardValue: '4', rule: 'Au sol : Le dernier à toucher le sol boit.' },
  { cardValue: '5', rule: 'En l\'air : Le dernier à lever la main boit.' },
  { cardValue: '6', rule: 'Dans ma valise : Jeu de mémoire.' },
  { cardValue: '7', rule: 'Dans ma poche : J\'ai déjà (Never have I ever).' },
  { cardValue: '8', rule: 'Thème : Choisis un thème, on tourne. Le premier qui sèche boit.' },
  { cardValue: '9', rule: 'Rime : Choisis un mot, on tourne en rime.' },
  { cardValue: '10', rule: 'Freeze : Tu es le maître du freeze. Quand tu figes, tout le monde doit figer.' },
  { cardValue: 'J', rule: 'Règle perso : Invente une règle qui dure jusqu\'au prochain Valet.' },
  { cardValue: 'Q', rule: 'La Pute : Tu deviens la Pute. Dès que quelqu\'un te parle, il boit.' },
  { cardValue: 'K', rule: 'Waterfall : Tout le monde boit à la suite du joueur.' },
];

export const Palmier: React.FC = () => {
  const [rules, setRules] = useState<PalmierRule[]>(DEFAULT_RULES);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PalmierRule | null>(null);

  // Load rules from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem('palmier_rules');
    if (savedRules) {
      try {
        setRules(JSON.parse(savedRules));
      } catch (e) {
        console.error("Failed to parse palmier rules", e);
      }
    }
  }, []);

  // Save rules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('palmier_rules', JSON.stringify(rules));
  }, [rules]);

  const handleRuleChange = (index: number, newText: string) => {
    const newRules = [...rules];
    newRules[index].rule = newText;
    setRules(newRules);
  };

  const handleResetRules = () => {
    if (confirm("Réinitialiser les règles par défaut ?")) {
        setRules(DEFAULT_RULES);
    }
  };

  if (isEditing) {
    return (
      <div className="px-4 pb-24 pt-4 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Personnaliser</h2>
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-ios-blue">
                Terminer
            </Button>
        </div>
        
        <div className="space-y-3">
            {rules.map((item, index) => (
                <div key={item.cardValue} className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg font-bold text-lg font-serif">
                        {item.cardValue}
                    </div>
                    <input 
                        type="text" 
                        value={item.rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                    />
                </div>
            ))}
        </div>

        <div className="mt-8">
            <Button variant="secondary" fullWidth onClick={handleResetRules} className="text-red-500 border-red-200 dark:border-red-900/30">
                <RotateCcw size={18} className="mr-2" />
                Rétablir les règles par défaut
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 pt-4 animate-fade-in pb-20 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold">Le Palmier</h2>
            <span className="text-slate-400 text-xs">Touchez une carte pour voir la règle</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              <Settings size={18} />
          </Button>
      </div>

      {/* SVG Diagram */}
      <Card className="mb-8 p-6 flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20">
        <div className="relative w-48 h-48">
            {/* Bottle */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
                <defs>
                    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
                {/* Bottle Shape */}
                <path d="M85 60 L85 20 L115 20 L115 60 C135 70, 140 90, 140 180 L60 180 C60 90, 65 70, 85 60 Z" fill="url(#bottleGrad)" />
                <rect x="90" y="100" width="20" height="40" rx="2" fill="white" opacity="0.8" />
                <text x="100" y="125" fontSize="10" textAnchor="middle" fill="#064E3B" fontWeight="bold">PALMIER</text>
                
                {/* Cards Circle - Abstract */}
                <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-300 dark:text-slate-600" />
                <circle cx="100" cy="25" r="5" fill="#EF4444" />
                <circle cx="175" cy="100" r="5" fill="#EF4444" />
                <circle cx="100" cy="175" r="5" fill="#3B82F6" />
                <circle cx="25" cy="100" r="5" fill="#3B82F6" />
            </svg>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2 font-medium">
            Disposez les cartes en cercle autour d'une bouteille.
        </p>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {rules.map((rule) => (
            <button
                key={rule.cardValue}
                onClick={() => setSelectedCard(rule)}
                className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
                <span className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">
                    {rule.cardValue}
                </span>
            </button>
        ))}
      </div>

      {/* Rule Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCard(null)}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <div className="w-16 h-20 mx-auto bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center mb-6 shadow-md">
                        <span className="text-4xl font-serif font-bold text-slate-900 dark:text-white">{selectedCard.cardValue}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                        {selectedCard.rule.split(':')[0]}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                        {selectedCard.rule.includes(':') ? selectedCard.rule.split(':')[1] : selectedCard.rule}
                    </p>

                    <Button fullWidth onClick={() => setSelectedCard(null)}>
                        <Check className="mr-2" size={20} />
                        Compris
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};