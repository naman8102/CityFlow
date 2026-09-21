/**
 * CityFlow AI — Isolated Per-Tab Session Manager
 * Enables multiple browser tabs to maintain distinct authenticated role accounts
 * (e.g. Tab 1: /citizen, Tab 2: /police, Tab 3: /logistics) without cross-tab token overwrites.
 */

const TOKEN_KEY = 'cityflow_tab_token';
const USER_KEY = 'cityflow_tab_user';

export const getTabToken = () => {
  if (typeof window === 'undefined') return '';
  try {
    const sessionToken = sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken) return sessionToken;
    // Fallback to localStorage if sessionStorage empty
    return localStorage.getItem('cityflow_token') || '';
  } catch {
    return '';
  }
};

export const getTabUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionUser = sessionStorage.getItem(USER_KEY);
    if (sessionUser) return JSON.parse(sessionUser);
    const localUser = localStorage.getItem('cityflow_user');
    if (localUser) return JSON.parse(localUser);
    return null;
  } catch {
    return null;
  }
};

export const setTabSession = (token, user) => {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('cityflow_token', token);
    }
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem('cityflow_user', JSON.stringify(user));
    }
  } catch (err) {
    console.warn('[SessionManager] Could not save session:', err);
  }
};

export const clearTabSession = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem('cityflow_token');
    localStorage.removeItem('cityflow_user');
  } catch (err) {
    console.warn('[SessionManager] Could not clear session:', err);
  }
};
