import React from 'react';
import logoImg from '../assets/fincurio_logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ className = "h-8", showText = true, textClassName, variant = 'dark' }) => {
  return (
    <div className="flex items-center gap-1">
      <img
        src={logoImg}
        alt="Fincurio logo"
        className={className}
      />

      {/* Optional text */}
      {showText && (
        <span className={`text-xl font-serif font-medium tracking-wide ${textClassName || 'text-secondary'}`}>
          Fincurio
        </span>
      )}
    </div>
  );
};

export default Logo;
