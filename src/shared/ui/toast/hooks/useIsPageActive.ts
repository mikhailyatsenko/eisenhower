import { useEffect, useState } from 'react';

/** False while the user is on another tab or window */
export const useIsPageActive = () => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const activate = () => setIsActive(true);
    const deactivate = () => setIsActive(false);
    const handleVisibility = () =>
      setIsActive(document.visibilityState === 'visible');

    window.addEventListener('focus', activate);
    window.addEventListener('blur', deactivate);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', activate);
      window.removeEventListener('blur', deactivate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return isActive;
};
