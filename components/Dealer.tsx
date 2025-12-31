import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ArrowRight, RotateCcw, Spade, Club, Heart, Diamond, Droplets, Gift } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: "Rouge ou Noir ?",
    desc: "Devine la couleur de la carte.",
    drink: "Tu bois 1 gorgée.",
    give: "Tu distribues 1 gorgée.",
    color: "bg-red-500"
  },
  {
    id: 2,
    title: "Plus ou Moins ?",
    desc: "La carte sera-t-elle plus grande, plus petite ou égale à la précédente ?",
    drink: "Tu bois 2 gorgées.",
    give: "Tu distribues 2 gorgées.",
    color: "bg-blue-500"
  },
  {
    id: 3,
    title: "Intérieur ou Extérieur ?",
    desc: "La valeur sera-t-elle comprise entre tes deux cartes ou à l'extérieur ?",
    drink: "Tu bois 3 gorgées.",
    give: "Tu distribues 3 gorgées.",
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Quelle Famille ?",
    desc: "Cœur, Carreau, Pique ou Trèfle ?",
    drink: "Tu bois 4 gorgées (Cul sec).",
    give: "Tu distribues 4 gorgées.",
    color: "bg-emerald-500"
  }
];

export const Dealer: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Loop or finish? Let's finish.
      setStepIndex(4); // 4 is "Finished" state
    }
  };

  const reset = () => {
    setStepIndex(0);
  };

  if (stepIndex === 4) {
    return (
        <div className="flex flex-col h-[70vh] items-center justify-center px-6 animate-fade-in">
             <h2 className="text-4xl font-black mb-4">Tour Terminé !</h2>
             <p className="text-slate-500 mb-8 text-center">Passe le paquet au joueur suivant.</p>
             <Button size="lg" onClick={reset}>
                <RotateCcw className="mr-2" size={20} />
                Nouveau Joueur
             </Button>
        </div>
    );
  }

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / 4) * 100;

  return (
    <div className="flex flex-col h-full px-4 pt-6 animate-fade-in pb-20">
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
        <div 
            className="h-full bg-ios-blue transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="text-center mb-8">
        <span className="uppercase text-xs font-bold tracking-widest text-slate-400">
            Étape {stepIndex + 1} / 4
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <Card className="mb-6 border-none shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <h1 className="text-4xl font-black text-center mb-4 text-slate-900 dark:text-white leading-tight">
                {currentStep.title}
            </h1>
            <p className="text-center text-slate-500 dark:text-slate-400 font-medium text-lg px-2">
                {currentStep.desc}
            </p>
            
            {stepIndex === 3 && (
                <div className="flex justify-center gap-4 mt-6 text-slate-400">
                    <Heart className="text-red-500" fill="currentColor" />
                    <Diamond className="text-red-500" fill="currentColor" />
                    <Spade className="text-slate-900 dark:text-white" fill="currentColor" />
                    <Club className="text-slate-900 dark:text-white" fill="currentColor" />
                </div>
            )}
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center mb-2">
                    <Droplets size={20} />
                </div>
                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase mb-1">Tu perds</h3>
                <p className="text-sm font-medium">{currentStep.drink}</p>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 flex items-center justify-center mb-2">
                    <Gift size={20} />
                </div>
                <h3 className="font-bold text-green-700 dark:text-green-400 text-sm uppercase mb-1">Tu gagnes</h3>
                <p className="text-sm font-medium">{currentStep.give}</p>
            </Card>
        </div>
      </div>

      <div className="mt-auto pt-4 space-y-3">
        <Button size="lg" fullWidth onClick={nextStep} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            Étape suivante
            <ArrowRight className="ml-2" size={20} />
        </Button>
        <Button variant="ghost" fullWidth onClick={reset} className="text-xs text-slate-400">
            Recommencer le tour
        </Button>
      </div>
    </div>
  );
};