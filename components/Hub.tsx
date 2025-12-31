import React from 'react';
import { View } from '../types';
import { Card } from './ui/Card';
import { VenetianMask, Moon, BookOpen, Stethoscope, Hash, Beer, KeyRound } from 'lucide-react';

interface HubProps {
  onNavigate: (view: View) => void;
}

export const Hub: React.FC<HubProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 pt-12 animate-fade-in max-w-lg mx-auto pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">
            Party<span className="text-ios-blue">Hub</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
            Le compagnon de vos soirées.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {/* Undercover */}
        <Card 
            interactive 
            onClick={() => onNavigate(View.UNDERCOVER)}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 border-none text-white shadow-purple-500/30"
        >
            <div className="flex items-start justify-between mb-4">
                <VenetianMask size={32} className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Undercover</h3>
            <p className="opacity-80 text-sm">Démasquez l'imposteur parmi les civils.</p>
        </Card>

        {/* Loup-Garou */}
        <Card 
            interactive 
            onClick={() => onNavigate(View.WEREWOLF)}
            className="bg-gradient-to-br from-slate-700 to-slate-900 border-none text-white shadow-slate-900/30"
        >
            <div className="flex items-start justify-between mb-4">
                <Moon size={32} className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Loup-Garou</h3>
            <p className="opacity-80 text-sm">Assistant de jeu et distribution de rôles.</p>
        </Card>

        {/* Le Psychiatre */}
        <Card 
            interactive 
            onClick={() => onNavigate(View.PSYCHIATRIST)}
            className="bg-gradient-to-br from-sky-500 to-blue-600 border-none text-white shadow-blue-500/30"
        >
            <div className="flex items-start justify-between mb-4">
                <Stethoscope size={32} className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Le Psychiatre</h3>
            <p className="opacity-80 text-sm">Diagnostiquez la pathologie collective.</p>
        </Card>

        {/* Le 21 */}
        <Card 
            interactive 
            onClick={() => onNavigate(View.TWENTY_ONE)}
            className="bg-gradient-to-br from-amber-500 to-orange-600 border-none text-white shadow-orange-500/30 relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-4">
                <Hash size={32} className="opacity-90" />
                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <Beer size={14} className="text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Jeu à boire</span>
                </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">Le 21</h3>
            <p className="opacity-80 text-sm">Jeu de comptage, mémoire et gages.</p>
        </Card>

        {/* Mot de Passe */}
        <Card 
            interactive 
            onClick={() => onNavigate(View.PASSWORD)}
            className="bg-gradient-to-br from-pink-500 to-rose-600 border-none text-white shadow-pink-500/30"
        >
            <div className="flex items-start justify-between mb-4">
                <KeyRound size={32} className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Mot de Passe</h3>
            <p className="opacity-80 text-sm">Faites deviner des mots en 3 indices.</p>
        </Card>

        {/* Jeux de Cartes */}
        <Card 
            interactive 
            onClick={() => onNavigate(View.RULES)}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-white shadow-teal-500/30"
        >
            <div className="flex items-start justify-between mb-4">
                <BookOpen size={32} className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Jeux de Cartes</h3>
            <p className="opacity-80 text-sm">Règles du Palmier, Président, Dealer, etc.</p>
        </Card>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400">
        <p>Pass-and-play • v1.7</p>
      </footer>
    </div>
  );
};