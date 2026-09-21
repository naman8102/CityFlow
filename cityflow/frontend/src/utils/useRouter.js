import { useState, useEffect, useCallback } from 'react';

export function useRouter() {
  const getNormalizedPath = () => {
    if (typeof window === 'undefined') return '/citizen';
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    if (path === '' || path === '/') return '/citizen';
    return path;
  };

  const [currentPath, setCurrentPath] = useState(getNormalizedPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((toPath) => {
    if (typeof window === 'undefined') return;
    const normalized = toPath.toLowerCase();
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
      setCurrentPath(normalized);
    }
  }, []);

  return {
    currentPath,
    navigate,
    isCitizenRoute: currentPath === '/citizen' || currentPath === '/',
    isPoliceRoute: currentPath === '/police',
    isLogisticsRoute: currentPath === '/logistics'
  };
}
