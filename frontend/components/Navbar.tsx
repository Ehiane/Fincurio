
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#38292b]/20">
      <Link to="/" className="flex items-center gap-3 text-primary text-secondary">
        <span className="material-symbols-outlined text-3xl text-primary">diamond</span>
        <h2 className="text-xl font-bold tracking-tight font-display">Fincurio</h2>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8">
        <a href="#awareness" className="text-sm font-medium text-stone-600 dark:text-stone-text hover:text-primary dark:hover:text-white transition-colors">Awareness</a>
        <a href="#clarity" className="text-sm font-medium text-stone-600 dark:text-stone-text hover:text-primary dark:hover:text-white transition-colors">Clarity</a>
        <a href="#insight" className="text-sm font-medium text-stone-600 dark:text-stone-text hover:text-primary dark:hover:text-white transition-colors">Insight</a>
      </nav>

      <Link 
        to="/signin"
        className="group flex items-center justify-center rounded-full h-10 px-6 bg-transparent border border-stone-300 dark:border-[#533c40] text-sm font-bold text-stone-800 text-secondary hover:border-primary hover:text-primary transition-all"
      >
        Sign In
      </Link>
    </header>
  );
};

export default Navbar;
