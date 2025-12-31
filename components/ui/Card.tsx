import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  interactive = false, 
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-ios-card/80 dark:bg-ios-darkCard/80 
        backdrop-blur-xl 
        border border-white/20 dark:border-white/10
        rounded-3xl p-6 
        shadow-xl shadow-black/5 dark:shadow-black/20
        ${interactive ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};