import { createContext, useContext, useState } from 'react';
import { getUsers, getSession, setSession, hash } from './storage.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

// Regla de permisos: el admin puede todo; el resto solo lo que tenga marcado en "permissions".
export const can = (user, permiso) => !!user && (user.role === 'admin' || !!user.permissions?.[permiso]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUsers().find((u) => u.id === getSession()) || null);

  async function login(email, password) {
    const h = await hash(password);
    const u = getUsers().find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.passHash === h);
    if (!u) return false;
    setSession(u.id);
    setUser(u);
    return true;
  }
  function logout() { setSession(null); setUser(null); }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
