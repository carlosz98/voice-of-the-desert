import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* "Is this Felipe?" Everyone else uses the site normally; when Felipe enters
 * his code on his profile page, the "Mi panel" tab appears in the menu.
 *
 * DEMO ONLY: there's no server yet, so the code lives here in the page and
 * isn't real security (anyone could read it in the page's source). With the
 * database and hosting this becomes a real login. */
const DEMO_CODE = "desierto";
const KEY = "votd-felipe"; // remembered until this browser tab is closed

const AuthContext = createContext({ isFelipe: false, signIn: () => false, signOut: () => {} });

export function AuthProvider({ children }) {
  const [isFelipe, setIsFelipe] = useState(() => {
    try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
  });
  const signIn = useCallback(code => {
    const ok = code.trim().toLowerCase() === DEMO_CODE;
    if (ok) {
      setIsFelipe(true);
      try { sessionStorage.setItem(KEY, "1"); } catch {}
    }
    return ok;
  }, []);
  const signOut = useCallback(() => {
    setIsFelipe(false);
    try { sessionStorage.removeItem(KEY); } catch {}
  }, []);
  const value = useMemo(() => ({ isFelipe, signIn, signOut }), [isFelipe, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
