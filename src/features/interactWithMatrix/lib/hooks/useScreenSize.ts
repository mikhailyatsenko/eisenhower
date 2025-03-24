import { useState, useEffect, useCallback } from 'react';

export const useScreenSize = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  const handleResize = useCallback(() => {
    setIsSmallScreen(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return { isSmallScreen };
};
