import React from 'react';

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  className = '',
  staggerMs = 80,
}) => {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className="fade-in-up"
          style={{ animationDelay: `${index * staggerMs}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggerChildren;
