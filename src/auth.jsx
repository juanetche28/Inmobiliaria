import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import { getProfile } from './data.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

// Regla de permisos (la misma lógica está en firestore.rules, que es la que realmente protege los datos).
export const can = (user, permiso) => !!user && (user.role === 'admin' || !!user.permissions?.[permiso]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function cargarPerfil(fu) {
    const perfil = fu && (await getProfile(fu.uid));
    if (fu && !perfil) { await signOut(auth); setUser(null); return null; }
    const u = perfil ? { ...perfil, id: fu.uid } : null;
    setUser(u);
    return u;
  }

  useEffect(() => onAuthStateChanged(auth, async (fu) => { await cargarPerfil(fu); setLoading(false); }), []);

  async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const u = await cargarPerfil(cred.user);
    return u ? null : 'sin-perfil';
  } catch (e) {
    return e.code || e.message;
  }
}
  const logout = () => signOut(auth);

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
