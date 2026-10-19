import React, { useRef, useState, useCallback } from 'react';

interface SpotlightBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  interactive?: boolean;
}

export const SpotlightBox: React.FC<SpotlightBoxProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.08)',
  interactive = true,
  ...props
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all duration-300 ${
        interactive ? 'interactive-box hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-lg dark:hover:shadow-[0_4px_24px_rgba(255,255,255,0.03)]' : ''
      } ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, var(--spotlight-fill, rgba(0,0,0,0.06)), transparent 75%)`
        }}
      />

      {/* Dark mode illuminated border flare */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 dark:block hidden"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.15), transparent 70%)`
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
