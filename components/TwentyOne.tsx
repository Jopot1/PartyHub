import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Plus, Trash2, Hash, AlertTriangle, Beer } from 'lucide-react';

export const TwentyOne: React.FC = () => {
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newRuleInput, setNewRuleInput] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem('twentyone_custom_rules');
    if (savedRules) {
      try {
        setCustomRules(JSON.parse(savedRules));
      } catch (e) {
        console.error("Failed to parse 21 rules", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('twentyone_custom_rules', JSON.stringify(customRules));
  }, [customRules]);

  const handleAddRule = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newRuleInput.trim()) {
      setCustomRules([...customRules, newRuleInput.trim()]);
      setNewRuleInput('');
    }
  };

  const handleDeleteRule = (index: number) => {
    const updatedRules = customRules.filter((_, i) => i !== index);
    setCustomRules(updatedRules);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-6 animate-fade-in pb-20 overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Le 21</h2>
        <p className="text-slate-500 text-sm">Jeu de comptage et de mémoire.</p>
      </div>

      {/* Static Rules Section - Dark Theme Forced for high contrast */}
      <Card className="bg-slate-900 text-white border-slate-800 shadow-xl mb-8 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Hash size={120} />
        </div>
        
        <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
          <AlertTriangle size={14} /> Règles Officielles
        </h3>
        
        <ul className="space-y-4 text-sm font-medium leading-relaxed">
          <li className="flex gap-3">
            <span className="text-amber-500 font-bold">1.</span>
            <span>Comptez de <span className="text-amber-300">1 à 21</span> collectivement.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-500 font-bold">2.</span>
            <span>Chaque joueur dit <span className="text-white font-bold bg-white/10 px-1 rounded">1, 2 ou 3</span> nombres à la suite.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-500 font-bold">3.</span>
            <span className="text-red-300">
              <strong className="block text-red-400 text-xs uppercase mb-1">Restriction Importante</strong>
              Interdiction de prononcer le même nombre de chiffres que le joueur précédent.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-500 font-bold">4.</span>
            <span>Celui qui prononce <span className="text-amber-300 font-bold">"21"</span> boit et invente une règle sur un chiffre.</span>
          </li>
          <li className="flex gap-3 items-center text-amber-200/80 italic mt-2 border-t border-white/10 pt-2">
            <Beer size={16} className="mr-2" />
            Toute erreur = 1 gorgée.
          </li>
        </ul>
      </Card>

      {/* Custom Rules Notepad */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-bold text-lg">Règles personnalisées</h3>
          <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-300">
            {customRules.length}
          </span>
        </div>
        <div>
          <p className="text-sm">Vous pouvez noter vos règles ici :</p>
        </div>

        <form onSubmit={handleAddRule} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newRuleInput}
            onChange={(e) => setNewRuleInput(e.target.value)}
            placeholder="Ex : Au 7, dire 'Banana'..."
            className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
          />
          <Button type="submit" size="md" disabled={!newRuleInput.trim()} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20">
            <Plus size={20} />
          </Button>
        </form>

        <div className="space-y-3">
          {customRules.length === 0 && (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
              <p className="text-sm">Aucune règle ajoutée pour le moment.</p>
            </div>
          )}
          
          {customRules.map((rule, index) => (
            <div key={index} className="flex items-start justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-amber-500 shadow-sm animate-slide-up">
              <p className="text-slate-800 dark:text-slate-200 font-medium pr-4 leading-snug">{rule}</p>
              <button 
                onClick={() => handleDeleteRule(index)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};