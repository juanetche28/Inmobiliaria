// Capa de datos con Firebase: propiedades y usuarios en Firestore, cuentas en Firebase Auth.
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase.js';
import { firebaseConfig } from './firebaseConfig.js';

const withId = (d) => ({ id: d.id, ...d.data() });

// ---- Propiedades ----
export async function listProps() {
  const s = await getDocs(query(collection(db, 'properties'), orderBy('fecha', 'desc')));
  return s.docs.map(withId);
}
export async function getProp(id) {
  const s = await getDoc(doc(db, 'properties', id));
  return s.exists() ? withId(s) : null;
}
export const addProp = (datos) => addDoc(collection(db, 'properties'), datos);
export const updateProp = (id, datos) => updateDoc(doc(db, 'properties', id), datos);
export const deleteProp = (id) => deleteDoc(doc(db, 'properties', id));

// ---- Usuarios ----
export async function listUsers() {
  const s = await getDocs(collection(db, 'users'));
  return s.docs.map(withId);
}
export async function getProfile(uid) {
  const s = await getDoc(doc(db, 'users', uid));
  return s.exists() ? withId(s) : null;
}

// Crear un usuario con la sesión del admin abierta: se usa una segunda instancia de Firebase
// para que crear la cuenta nueva NO cierre la sesión del admin.
export async function createGestor({ nombre, email, password, permissions }) {
  const second = initializeApp(firebaseConfig, 'secundaria-' + Date.now());
  try {
    const a = getAuth(second);
    const cred = await createUserWithEmailAndPassword(a, email, password);
    await signOut(a);
    await setDoc(doc(db, 'users', cred.user.uid), { nombre, email, role: 'gestor', permissions });
  } finally {
    await deleteApp(second);
  }
}
// Borra el perfil: sin perfil el usuario ya no puede entrar ni operar (ver manual sobre la cuenta de Auth).
export const deleteProfile = (uid) => deleteDoc(doc(db, 'users', uid));
