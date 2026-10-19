import { useState, useEffect, useRef } from 'react';

export function useAutohideNav(threshold = 50) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show at the top
          if (currentScrollY < threshold) {
            setIsHidden(false);
          } else if (currentScrollY > lastScrollY.current + 8) {
            // Scrolling down
            setIsHidden(true);
          } else if (currentScrollY < lastScrollY.current - 12) {
            // Scrolling up
            setIsHidden(false);
          }

          lastScrollY.current = Math.max(0, currentScrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // If mouse hovers near the very top of the window, peek navbar open
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 32) {
        setIsHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [threshold]);

  return { isHidden, setIsHidden };
}
