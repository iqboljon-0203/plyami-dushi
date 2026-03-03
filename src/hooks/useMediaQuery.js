import { useState, useEffect } from 'react';

/**
 * useMediaQuery — Reactive media query hook.
 * @param {string} query — CSS media query string, e.g. '(max-width: 768px)'
 * @returns {boolean} — Whether the query currently matches
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useMediaQuery;
