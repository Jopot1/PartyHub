import React, { useState } from 'react';
import { CardRule, View } from '../types';
import { Card } from './ui/Card';
import { ChevronRight, BookOpen, PlayCircle, Palmtree, Dices, Crown, Gavel, Swords, Cat, Beer } from 'lucide-react';

interface CardRulesProps {
  onNavigate: (view: View) => void;
}

const GAMES: CardRule[] = [
  {
    id: 'palmier',
    title: 'Le Palmier',
    isDrinking: true,
    targetView: View.PALMIER,
    sections: [
        {
            title: "But du jeu",
            content: "Ne pas faire tomber la bouteille et suivre les gages des cartes."
        },
        {
            title: "Installation",
            content: "Placez une bouteille vide (le Palmier) au centre. Étalez les cartes en cercle autour de la bouteille, face cachée."
        }
    ]
  },
  {
    id: 'dealer',
    title: 'Le Dealer',
    isDrinking: true,
    targetView: View.DEALER,
    sections: [
        {
            title: "But du jeu",
            content: "Deviner ses cartes, bluffer sur la pyramide et mémoriser sa main."
        }
    ]
  },
  {
    id: 'president',
    title: 'Président',
    sections: [
        {
            title: "But du jeu",
            content: "Se débarrasser de toutes ses cartes avant les autres pour monter dans la hiérarchie sociale."
        },
        {
            title: "Hiérarchie des cartes",
            content: "2 (Invincible) > As > Roi > Dame > Valet > 10 > ... > 3 (Le plus faible)."
        },
        {
            title: "Rôles",
            content: `1. Président (1er)
2. Vice-Président (2ème)
3. Neutre(s)
4. Vice-Trouduc (Avant-dernier)
5. Trouduc (Dernier)`
        },
        {
            title: "Échanges (Début de manche)",
            content: `- Le Trouduc donne ses 2 meilleures cartes au Président. Le Président donne 2 cartes de son choix au Trouduc.
- Le Vice-Trouduc donne sa meilleure carte au Vice-Président. Le VP donne 1 carte de son choix au Vice-Trouduc.`
        },
        {
            title: "Déroulement",
            content: `Le joueur qui a la main lance 1, 2, 3 ou 4 cartes de même valeur.
Les suivants doivent surenchérir avec le même nombre de cartes d'une valeur supérieure ou passer.
Si tout le monde passe, le dernier joueur ayant posé remporte la main et relance.`
        }
    ]
  },
  {
    id: 'mao',
    title: 'Mao',
    sections: [
        {
            title: "But du jeu",
            content: "Se débarrasser de ses cartes. Ne jamais expliquer les règles aux nouveaux joueurs."
        },
        {
            title: "Principe unique",
            content: `Les règles sont secrètes et évolutives.

Règle de base connue : On joue une carte de même valeur ou couleur.
- On ne parle pas.
- On ne pose pas de questions.
- Erreur = Pénalité (Le joueur fautif pioche une carte).
- Le vainqueur du tour invente une nouvelle règle secrète pour la manche suivante.`
        }
    ]
  },
  {
    id: 'deutsch',
    title: 'Deutsch',
    sections: [
        {
            title: "But du jeu",
            content: "Avoir le moins de points possible dans sa main. La partie s'arrête lorsqu'un joueur annonce \"Deutch\"."
        },
        {
            title: "Valeur des points",
            content: `Roi = 0
As = 1
2 à 10 = Valeur nominale
Valet & Dame = 10`
        },
        {
            title: "Pouvoirs",
            content: `S'activent uniquement si la carte est piochée puis jetée immédiatement :
- Dame : Regarder l'une de vos propres cartes.
- 10 : Regarder la carte d'un adversaire.
- Valet : Échanger une de vos cartes avec un adversaire.`
        }
    ]
  },
  {
    id: 'pouilleux',
    title: 'Le Pouilleux',
    sections: [
        {
            title: "But du jeu",
            content: "Ne pas finir avec le Valet de Pique (le Pouilleux) en main."
        },
        {
            title: "Déroulement",
            content: `Le premier joueur tire une carte au hasard dans la main de son voisin de gauche.
- Si cela forme une paire : Il pose la paire.
- Sinon : Il garde la carte.

Le jeu continue jusqu'à ce qu'il ne reste que le Valet de Pique.`
        }
    ]
  }
];

export const CardRules: React.FC<CardRulesProps> = ({ onNavigate }) => {
  const [selectedGame, setSelectedGame] = useState<CardRule | null>(null);

  const handleGameClick = (game: CardRule) => {
    if (game.targetView) {
      onNavigate(game.targetView);
    } else {
      setSelectedGame(game);
    }
  };

  if (selectedGame) {
    return (
      <div className="p-4 animate-fade-in pb-20">
        <button 
            onClick={() => setSelectedGame(null)}
            className="mb-6 text-ios-blue text-lg font-medium hover:underline flex items-center"
        >
            ← Jeux de cartes
        </button>
        
        <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold">{selectedGame.title}</h2>
            {selectedGame.isDrinking && (
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 p-2 rounded-full">
                    <Beer size={20} />
                </div>
            )}
        </div>
        
        <div className="space-y-8">
            {selectedGame.sections.map((section, index) => (
                <section key={index} className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm uppercase tracking-wider text-ios-blue font-bold mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                        {section.title}
                    </h3>
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-base">
                        {section.content}
                    </p>
                </section>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6 px-2">
            <BookOpen className="text-ios-blue" />
            <h2 className="text-2xl font-bold">Règles & Jeux</h2>
        </div>
        <div className="grid gap-3">
            {GAMES.map(game => (
                <Card 
                    key={game.id} 
                    className={`flex items-center justify-between p-5 transition-colors ${game.targetView ? 'bg-white dark:bg-slate-800 border-l-4 border-l-ios-blue' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    onClick={() => handleGameClick(game)}
                    interactive
                >
                    <div className="flex items-center gap-4">
                        {game.id === 'palmier' && <Palmtree size={24} className="text-emerald-500" />}
                        {game.id === 'dealer' && <Dices size={24} className="text-red-500" />}
                        {game.id === 'president' && <Crown size={24} className="text-yellow-500" />}
                        {game.id === 'mao' && <Gavel size={24} className="text-purple-500" />}
                        {game.id === 'deutsch' && <Swords size={24} className="text-orange-500" />}
                        {game.id === 'pouilleux' && <Cat size={24} className="text-slate-500" />}
                        
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">{game.title}</span>
                                {game.isDrinking && <Beer size={16} className="text-amber-500" />}
                            </div>
                            {game.targetView && <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Module Interactif</span>}
                        </div>
                    </div>
                    {game.targetView ? (
                        <PlayCircle className="text-ios-blue" size={24} />
                    ) : (
                        <ChevronRight className="text-slate-400" size={20} />
                    )}
                </Card>
            ))}
        </div>
    </div>
  );
};