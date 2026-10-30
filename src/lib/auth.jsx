import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { accounts, session } from "./api.js";

/* Who is signed in? Everyone can register and sign in (to comment, and
 * so their name goes on dedications and messages). Felipe signs in the
 * same way; his account has role "felipe", so "Mi panel" appears.
 *
 * The real work happens in api.js (PHP API, or the demo mode until the
 * API is online). This file keeps the answer for the whole site. */

const AuthContext = createContext({
  user: null,
  isFelipe: false,
  ready: true,
  register: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  update: async () => {},
  remove: async () => {},
});

export function AuthProvider({ children }) {
  // start with what this browser remembers, so the page doesn't flicker
  const [user, setUser] = useState(() => session.get()?.user || null);
  const [ready, setReady] = useState(() => !session.get());

  // then check with the server that the ticket still works
  useEffect(() => {
    if (!session.get()) return;
    let alive = true;
    accounts
      .me()
      .then(me => {
        if (!alive) return;
        setUser(me);
        session.set(session.get().token, me);
      })
      .catch(e => {
        if (!alive) return;
        // 401 = the ticket expired or was signed out elsewhere
        if (e.status === 401) {
          session.clear();
          setUser(null);
        }
      })
      .finally(() => alive && setReady(true));
    return () => { alive = false; };
  }, []);

  const keep = useCallback(({ token, user }) => {
    session.set(token, user);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(data => accounts.register(data).then(keep), [keep]);
  const signIn = useCallback((email, password) => accounts.login({ email, password }).then(keep), [keep]);

  const signOut = useCallback(async () => {
    try { await accounts.logout(); } catch {}
    session.clear();
    setUser(null);
  }, []);

  const update = useCallback(async changes => {
    const me = await accounts.update(changes);
    session.set(session.get()?.token, me);
    setUser(me);
    return me;
  }, []);

  const remove = useCallback(async password => {
    await accounts.remove(password);
    session.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isFelipe: user?.role === "felipe", ready, register, signIn, signOut, update, remove }),
    [user, ready, register, signIn, signOut, update, remove]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/* "Rosa M." → "RM" for the round badge */
export const initials = name =>
  (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
