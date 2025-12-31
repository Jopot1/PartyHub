import React, { useState } from 'react';
import { View, Player } from './types';
import { Hub } from './components/Hub';
import { Undercover } from './components/Undercover';
import { Werewolf } from './components/Werewolf';
import { CardRules } from './components/CardRules';
import { Psychiatrist } from './components/Psychiatrist';
import { TwentyOne } from './components/TwentyOne';
import { Password } from './components/Password';
import { ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HUB);
  const [players, setPlayers] = useState<Player[]>([]);

  const goBack = () => {
    // Optional: Add confirmation dialog if game is in progress
    setCurrentView(View.HUB);
  };

  const getHeaderTitle = (view: View) => {
      switch(view) {
          case View.PSYCHIATRIST: return 'Psychiatre';
          case View.UNDERCOVER: return 'Undercover';
          case View.WEREWOLF: return 'Loup-Garou';
          case View.RULES: return 'Règles';
          case View.TWENTY_ONE: return 'Le 21';
          case View.PASSWORD: return 'Mot de Passe';
          default: return '';
      }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-ios-bg dark:bg-ios-darkBg shadow-2xl overflow-hidden relative">
      {/* Sticky Header for sub-pages */}
      {currentView !== View.HUB && (
        <div className="sticky top-0 z-50 px-4 py-3 flex items-center bg-ios-bg/80 dark:bg-ios-darkBg/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-all">
            <button 
                onClick={goBack}
                className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-ios-blue flex items-center font-medium"
            >
                <ChevronLeft size={24} />
                Hub
            </button>
            <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest">
                {getHeaderTitle(currentView)}
            </span>
        </div>
      )}

      <main className="min-h-[calc(100vh-60px)]">
        {currentView === View.HUB && (
            <Hub onNavigate={setCurrentView} />
        )}
        
        {currentView === View.UNDERCOVER && (
            <Undercover players={players} setPlayers={setPlayers} />
        )}

        {currentView === View.WEREWOLF && (
            <Werewolf players={players} setPlayers={setPlayers} />
        )}

        {currentView === View.PSYCHIATRIST && (
            <Psychiatrist players={players} setPlayers={setPlayers} />
        )}

        {currentView === View.RULES && (
            <CardRules onNavigate={setCurrentView} />
        )}

        {currentView === View.TWENTY_ONE && (
            <TwentyOne />
        )}

        {currentView === View.PASSWORD && (
            <Password />
        )}
      </main>
    </div>
  );
};

export default App;